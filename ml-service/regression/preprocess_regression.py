import os
import pandas as pd


def load_and_prepare_data_regression():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(BASE_DIR, "..", "dataset", "MAIN_DATASET.xlsx")
    file_path = os.path.normpath(file_path)

    df = pd.read_excel(file_path)

    # Clean column names
    df.columns = (
        df.columns.astype(str)
        .str.strip()
        .str.lower()
        .str.replace(" ", "_", regex=False)
    )

    poverty_col = "poverty_incidence"

    # Convert poverty incidence to numeric
    df[poverty_col] = (
        df[poverty_col]
        .astype(str)
        .str.strip()
        .str.replace("%", "", regex=False)
        .str.replace(",", ".", regex=False)
    )

    df[poverty_col] = pd.to_numeric(df[poverty_col], errors="coerce")

    # Drop rows where poverty_incidence is missing
    df = df.dropna(subset=[poverty_col]).reset_index(drop=True)

    # Save thresholds for later classification
    low_threshold = df[poverty_col].quantile(0.33)
    high_threshold = df[poverty_col].quantile(0.66)

    # Target = numeric poverty incidence
    y = df[poverty_col]

    # Features
    drop_cols = [poverty_col]
    if "region_name" in df.columns:
        drop_cols.append("region_name")

    X = df.drop(columns=drop_cols)

    # Convert categorical columns to numeric
    X = pd.get_dummies(X, drop_first=True, dtype=int)

    return X, y, low_threshold, high_threshold