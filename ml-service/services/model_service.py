import os
import joblib
import pandas as pd
from config import MODEL_PATH, METRICS_PATH, DATASET_PATH

model = joblib.load(MODEL_PATH)

FEATURE_COLUMNS = list(getattr(model, "feature_names_in_", []))
REGION_COLUMNS = [col for col in FEATURE_COLUMNS if col.startswith("region_")]
VALID_REGIONS = [col.replace("region_", "", 1) for col in REGION_COLUMNS]

print("Loaded model features:")
print(FEATURE_COLUMNS)

print("Detected valid regions:")
print(VALID_REGIONS)

MODEL_METRICS = {
    "model_name": model.__class__.__name__,
    "accuracy": None,
    "f1": None,
    "recall": None,
    "confusion_matrix": None
}

if os.path.exists(METRICS_PATH):
    try:
        loaded_metrics = joblib.load(METRICS_PATH)
        if isinstance(loaded_metrics, dict):
            MODEL_METRICS["model_name"] = loaded_metrics.get(
                "model_name", MODEL_METRICS["model_name"]
            )
            MODEL_METRICS["accuracy"] = loaded_metrics.get("accuracy")
            MODEL_METRICS["f1"] = loaded_metrics.get("f1")
            MODEL_METRICS["recall"] = loaded_metrics.get("recall")
            MODEL_METRICS["confusion_matrix"] = loaded_metrics.get("confusion_matrix")
    except Exception as e:
        print("Failed to load metrics file:", e)


def prepare_input(data, to_int, to_float, normalize_region):
    row = {col: 0 for col in FEATURE_COLUMNS}

    if "year" in row:
        row["year"] = to_int(data.get("year"), "year")
    if "ave_income" in row:
        row["ave_income"] = to_float(data.get("ave_income"), "ave_income")
    if "expenditure" in row:
        row["expenditure"] = to_float(data.get("expenditure"), "expenditure")
    if "unemployment_rate" in row:
        row["unemployment_rate"] = to_float(
            data.get("unemployment_rate"), "unemployment_rate"
        )
    if "mean_years_education" in row:
        row["mean_years_education"] = to_float(
            data.get("mean_years_education"), "mean_years_education"
        )
    if "population_size" in row:
        row["population_size"] = to_int(
            data.get("population_size"), "population_size"
        )

    region = normalize_region(data.get("region"))

    if not region:
        raise ValueError("Region is required")

    if region not in VALID_REGIONS:
        raise ValueError(f"Invalid region: {region}")

    region_col = f"region_{region}"
    if region_col not in row:
        raise ValueError(f"Region column not found in trained model: {region_col}")

    row[region_col] = 1

    return pd.DataFrame([row])


def predict_single(data, to_int, to_float, normalize_region):
    input_df = prepare_input(data, to_int, to_float, normalize_region)
    prediction = model.predict(input_df)[0]
    return str(prediction)


def clean_poverty_incidence(value):
    if value is None:
        return None

    value = str(value).strip()
    if value == "":
        return None

    value = value.replace("%", "").replace(",", ".")
    return float(value)


def get_thresholds():
    if not os.path.exists(DATASET_PATH):
        raise ValueError(f"Dataset file not found: {DATASET_PATH}")

    df = pd.read_excel(DATASET_PATH)

    df.columns = (
        df.columns.astype(str)
        .str.strip()
        .str.lower()
        .str.replace(" ", "_", regex=False)
    )

    if "poverty_incidence" not in df.columns:
        raise ValueError("poverty_incidence column not found in dataset")

    df["poverty_incidence"] = (
        df["poverty_incidence"]
        .astype(str)
        .str.strip()
        .str.replace("%", "", regex=False)
        .str.replace(",", ".", regex=False)
    )

    df["poverty_incidence"] = pd.to_numeric(df["poverty_incidence"], errors="coerce")
    df = df.dropna(subset=["poverty_incidence"]).reset_index(drop=True)

    if df.empty:
        raise ValueError("No valid poverty_incidence values found in dataset")

    low_threshold = float(df["poverty_incidence"].quantile(0.33))
    high_threshold = float(df["poverty_incidence"].quantile(0.66))

    return {
        "low_threshold": low_threshold,
        "high_threshold": high_threshold
    }


def classify_by_threshold(poverty_incidence):
    thresholds = get_thresholds()
    low_threshold = thresholds["low_threshold"]
    high_threshold = thresholds["high_threshold"]

    value = clean_poverty_incidence(poverty_incidence)

    if value is None:
        raise ValueError("poverty_incidence is required for threshold classification")

    if value < low_threshold:
        return "Low"
    elif value < high_threshold:
        return "Moderate"
    else:
        return "High"


def has_poverty_incidence(data):
    return "poverty_incidence" in data and str(data.get("poverty_incidence")).strip() != ""


def classify_or_predict_row(data, to_int, to_float, normalize_region):
    if has_poverty_incidence(data):
        poverty_level = classify_by_threshold(data.get("poverty_incidence"))
        basis = "threshold"
    else:
        poverty_level = predict_single(data, to_int, to_float, normalize_region)
        basis = "model"

    result = {
        "region": normalize_region(data.get("region")),
        "year": to_int(data.get("year"), "year"),
        "ave_income": to_float(data.get("ave_income"), "ave_income"),
        "expenditure": to_float(data.get("expenditure"), "expenditure"),
        "unemployment_rate": to_float(data.get("unemployment_rate"), "unemployment_rate"),
        "mean_years_education": to_float(data.get("mean_years_education"), "mean_years_education"),
        "population_size": to_int(data.get("population_size"), "population_size"),
        "poverty_level": poverty_level
    }

    if has_poverty_incidence(data):
        result["poverty_incidence"] = clean_poverty_incidence(data.get("poverty_incidence"))

    result["basis"] = basis
    return result


def format_confusion_matrix(confusion_matrix):
    if confusion_matrix is None:
        return None
    return confusion_matrix


def get_model_info():
    thresholds = get_thresholds()

    return {
        "model_name": MODEL_METRICS.get("model_name"),
        "accuracy": MODEL_METRICS.get("accuracy"),
        "f1": MODEL_METRICS.get("f1"),
        "recall": MODEL_METRICS.get("recall"),
        "confusion_matrix": format_confusion_matrix(
            MODEL_METRICS.get("confusion_matrix")
        ),
        "low_threshold": thresholds.get("low_threshold"),
        "high_threshold": thresholds.get("high_threshold")
    }