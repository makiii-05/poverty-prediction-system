import os
import joblib
import pandas as pd
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load trained model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "svc_model.pkl")

model = joblib.load(MODEL_PATH)

# Dynamic feature columns from trained model
FEATURE_COLUMNS = list(model.feature_names_in_)

# Dynamic region columns from trained model
REGION_COLUMNS = [col for col in FEATURE_COLUMNS if col.startswith("region_")]

# Convert region column names to valid region names
VALID_REGIONS = [col.replace("region_", "", 1) for col in REGION_COLUMNS]

print("Loaded model features:")
print(FEATURE_COLUMNS)

print("Detected valid regions:")
print(VALID_REGIONS)


def prepare_input(data):
    row = {col: 0 for col in FEATURE_COLUMNS}

    # Fill numeric / direct fields dynamically
    for key, value in data.items():
        if key in row and key != "region":
            row[key] = value

    # Handle region separately
    region = str(data.get("region", "")).strip()

    if not region:
        raise ValueError("Region is required")

    if region not in VALID_REGIONS:
        raise ValueError(f"Invalid region: {region}")

    region_col = f"region_{region}"
    row[region_col] = 1

    return pd.DataFrame([row])


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "success": True,
        "message": "ML service is running",
        "valid_regions": VALID_REGIONS,
        "feature_columns": FEATURE_COLUMNS
    })


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": "No input data provided"
            }), 400

        input_df = prepare_input(data)

        prediction = model.predict(input_df)[0]

        return jsonify({
            "success": True,
            "poverty_level": str(prediction)
        })

    except ValueError as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(port=8000, debug=True)