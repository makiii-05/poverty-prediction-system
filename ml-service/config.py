import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "models", "svc_model.pkl")
METRICS_PATH = os.path.join(BASE_DIR, "models", "svc_model_metrics.pkl")

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "poverty_ml_db"
}

REGION_NAME_MAP = {
    "BARMM": "Bangsamoro Autonomous Region in Muslim Mindanao",
    "NCR": "National Capital Region",
    "CAR": "Cordillera Administrative Region",
    "Region I": "Ilocos Region",
    "Region II": "Cagayan Valley",
    "Region III": "Central Luzon",
    "Region IV": "CALABARZON",
    "Region V": "Bicol Region",
    "Region VI": "Western Visayas",
    "Region VII": "Central Visayas",
    "Region VIII": "Eastern Visayas",
    "Region IX": "Zamboanga Peninsula",
    "Region X": "Northern Mindanao",
    "Region XI": "Davao Region",
    "Region XII": "SOCCSKSARGEN",
    "MIMAROPA": "MIMAROPA Region",
    "CARAGA": "Caraga"
}