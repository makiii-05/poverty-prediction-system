import os
import joblib
from preprocess import load_and_prepare_data
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score
import json

# Load preprocessed data
X, y = load_and_prepare_data()

# Split into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# Create model pipeline
model = Pipeline([
    ("scaler", StandardScaler()),
    ("svc", SVC(kernel="rbf", C=1.0, gamma="scale", random_state=42))
])

# Train model
model.fit(X_train, y_train)

# Predict
y_pred = model.predict(X_test)

# Metrics
accuracy = accuracy_score(y_test, y_pred)
f1_weighted = f1_score(y_test, y_pred, average="weighted")
f1_macro = f1_score(y_test, y_pred, average="macro")
cm = confusion_matrix(y_test, y_pred)
report = classification_report(y_test, y_pred, output_dict=True)

# Print
print("=== SVC MODEL ===")
print("Accuracy:", accuracy)
print("F1 Score (Weighted):", f1_weighted)
print("F1 Score (Macro):", f1_macro)
print("\nConfusion Matrix:")
print(cm)

# Save model and metrics
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
MODEL_DIR = os.path.join(ROOT_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "svc_model.pkl")
METRICS_PATH = os.path.join(MODEL_DIR, "svc_model_metrics.pkl")

os.makedirs(MODEL_DIR, exist_ok=True)

joblib.dump(model, MODEL_PATH)

import json

metrics = {
    "model_name": "SVC",
    "accuracy": float(accuracy),
    "f1_weighted": float(f1_weighted),
    "f1_macro": float(f1_macro),
    "confusion_matrix": cm.tolist(),
    "classification_report": report
}

METRICS_JSON_PATH = os.path.join(MODEL_DIR, "svc_model_metrics.json")

with open(METRICS_JSON_PATH, "w") as f:
    json.dump(metrics, f, indent=2)

print(f"\nModel saved as {MODEL_PATH}")
print(f"Metrics saved as {METRICS_JSON_PATH}")