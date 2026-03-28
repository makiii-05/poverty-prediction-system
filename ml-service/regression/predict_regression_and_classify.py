import os
import joblib
import pandas as pd


def classify_poverty_level(value, low_threshold, high_threshold):
    if value < low_threshold:
        return "Low"
    elif value < high_threshold:
        return "Moderate"
    else:
        return "High"


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.normpath(os.path.join(BASE_DIR, "..", "models"))

# Change this to the model you want to test
model_path = os.path.join(MODELS_DIR, "random_forest_regressor.pkl")
metadata_path = os.path.join(MODELS_DIR, "regression_metadata.pkl")

# Load trained model and metadata
model = joblib.load(model_path)
metadata = joblib.load(metadata_path)

low_threshold = metadata["low_threshold"]
high_threshold = metadata["high_threshold"]
feature_names = metadata["feature_names"]

# Example input
new_data = pd.DataFrame([{
    "year": 2023,
    "ave_income": 250000,
    "expenditure": 200000,
    "unemployment_rate": 4,
    "mean_years_education": 12,
    "population_size": 3000000,
    "region": "NCR"
}])

# One-hot encode input
new_data = pd.get_dummies(new_data, drop_first=True, dtype=int)

# Match training columns
new_data = new_data.reindex(columns=feature_names, fill_value=0)

# Predict poverty incidence
predicted_poverty_incidence = model.predict(new_data)[0]

# Convert to poverty level
predicted_poverty_level = classify_poverty_level(
    predicted_poverty_incidence,
    low_threshold,
    high_threshold
)

print("Predicted Poverty Incidence:", round(predicted_poverty_incidence, 2))
print("Predicted Poverty Level:", predicted_poverty_level)