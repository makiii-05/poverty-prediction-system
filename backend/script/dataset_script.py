import os
import pandas as pd
import mysql.connector
import joblib
import sys

# -----------------------------
# FIX IMPORT PATH FOR preprocess.py
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ML_SERVICE_DIR = os.path.normpath(os.path.join(BASE_DIR, "..", "..", "ml-service"))
sys.path.append(ML_SERVICE_DIR)

from preprocess import load_and_prepare_data

# -----------------------------
# DATABASE CONNECTION
# -----------------------------
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="poverty_ml_db"
)
cursor = conn.cursor()

# -----------------------------
# CREATE TABLE
# -----------------------------
create_table_query = """
CREATE TABLE IF NOT EXISTS regional_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    region VARCHAR(50),
    region_name VARCHAR(100),
    year INT,
    ave_income FLOAT,
    expenditure FLOAT,
    unemployment_rate FLOAT,
    mean_years_education FLOAT,
    population_size BIGINT,
    poverty_level VARCHAR(20)
)
"""
cursor.execute(create_table_query)

# -----------------------------
# OPTIONAL: CLEAR OLD DATA
# -----------------------------
cursor.execute("TRUNCATE TABLE regional_data")

# -----------------------------
# FILE PATH
# -----------------------------
file_path = os.path.join(ML_SERVICE_DIR, "dataset", "MAIN_DATASET.xlsx")
file_path = os.path.normpath(file_path)

print("Resolved path:", file_path)
print("File exists:", os.path.exists(file_path))

# -----------------------------
# LOAD TRAINED MODEL
# -----------------------------
model_path = os.path.join(ML_SERVICE_DIR, "models", "svc_model.pkl")
model_path = os.path.normpath(model_path)

print("Model path:", model_path)
print("Model exists:", os.path.exists(model_path))

model = joblib.load(model_path)

# -----------------------------
# LOAD PREPROCESSED FEATURES
# -----------------------------
X, y = load_and_prepare_data()

# -----------------------------
# PREDICT POVERTY LEVEL USING SVC
# -----------------------------
predicted_levels = model.predict(X)

# -----------------------------
# LOAD RAW EXCEL FOR HUMAN-READABLE COLUMNS
# -----------------------------
df = pd.read_excel(file_path)

# Clean column names
df.columns = (
    df.columns.astype(str)
    .str.strip()
    .str.lower()
    .str.replace(" ", "_", regex=False)
)

# Remove duplicate columns if any
df = df.loc[:, ~df.columns.duplicated()].copy()

print("Columns found:", df.columns.tolist())

# -----------------------------
# REQUIRED COLUMNS FOR DB
# -----------------------------
required_columns = [
    "region",
    "region_name",
    "year",
    "ave_income",
    "expenditure",
    "unemployment_rate",
    "mean_years_education",
    "population_size"
]

missing_columns = [col for col in required_columns if col not in df.columns]
if missing_columns:
    raise ValueError(f"Missing columns in Excel: {missing_columns}")

df = df[required_columns].copy()

# -----------------------------
# CLEAN STRING COLUMNS
# -----------------------------
df["region"] = df["region"].astype(str).str.strip()
df["region_name"] = df["region_name"].astype(str).str.strip()

# -----------------------------
# CLEAN NUMERIC COLUMNS
# -----------------------------
def clean_numeric(series, decimal_comma=False):
    s = series.astype(str).str.strip()
    s = s.str.replace(" ", "", regex=False)

    if decimal_comma:
        s = s.str.replace(",", ".", regex=False)
    else:
        s = s.str.replace(",", "", regex=False)

    s = s.str.replace("%", "", regex=False)

    return pd.to_numeric(s, errors="coerce")

df["year"] = clean_numeric(df["year"])
df["ave_income"] = clean_numeric(df["ave_income"])
df["expenditure"] = clean_numeric(df["expenditure"])
df["unemployment_rate"] = clean_numeric(df["unemployment_rate"])
df["mean_years_education"] = clean_numeric(df["mean_years_education"])
df["population_size"] = clean_numeric(df["population_size"])

# -----------------------------
# DROP INVALID ROWS
# -----------------------------
before_rows = len(df)
df = df.dropna().reset_index(drop=True)
after_rows = len(df)

print(f"Rows before cleaning: {before_rows}")
print(f"Rows after cleaning: {after_rows}")

# Convert integer fields
df["year"] = df["year"].astype(int)
df["population_size"] = df["population_size"].astype(int)

# -----------------------------
# SAFETY CHECK
# -----------------------------
if len(df) != len(predicted_levels):
    raise ValueError(
        f"Row mismatch: cleaned raw data has {len(df)} rows but predictions have {len(predicted_levels)} rows"
    )

# -----------------------------
# ATTACH SVC PREDICTIONS
# -----------------------------
df["poverty_level"] = predicted_levels

print(df.head())

# -----------------------------
# INSERT INTO MYSQL
# -----------------------------
insert_query = """
INSERT INTO regional_data (
    region,
    region_name,
    year,
    ave_income,
    expenditure,
    unemployment_rate,
    mean_years_education,
    population_size,
    poverty_level
)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
"""

values = [
    (
        row["region"],
        row["region_name"],
        int(row["year"]),
        float(row["ave_income"]),
        float(row["expenditure"]),
        float(row["unemployment_rate"]),
        float(row["mean_years_education"]),
        int(row["population_size"]),
        row["poverty_level"],
    )
    for _, row in df.iterrows()
]

cursor.executemany(insert_query, values)
conn.commit()

print(f"{cursor.rowcount} rows inserted successfully.")

cursor.close()
conn.close()