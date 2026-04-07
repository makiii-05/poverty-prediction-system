import os
import json
import joblib
from preprocess import load_and_prepare_data
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score


# Load preprocessed data
X, y = load_and_prepare_data()

print("=== DATASET INFO ===")
print("Feature shape:", X.shape)
print("Target shape:", y.shape)
print()

print("=== CLASS DISTRIBUTION (FULL DATASET) ===")
print(y.value_counts())
print()


# Split into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

print("=== TRAIN / TEST SPLIT INFO ===")
print("X_train shape:", X_train.shape)
print("X_test shape:", X_test.shape)
print("y_train shape:", y_train.shape)
print("y_test shape:", y_test.shape)
print()

print("=== CLASS DISTRIBUTION (TRAIN SET) ===")
print(y_train.value_counts())
print()

print("=== CLASS DISTRIBUTION (TEST SET) ===")
print(y_test.value_counts())
print()


# Create model pipeline
model = Pipeline([
    ("scaler", StandardScaler()),
    ("svc", SVC(kernel="rbf", C=1.0, gamma="scale", random_state=42))
])

print("=== MODEL CONFIGURATION ===")
print(model)
print()


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
report_text = classification_report(y_test, y_pred)

labels = sorted(y.unique())

# Print
print("=== SVC MODEL ===")
print("Accuracy:", accuracy)
print("F1 Score (Weighted):", f1_weighted)
print("F1 Score (Macro):", f1_macro)
print()

print("=== CLASS LABELS ===")
print(labels)
print()

print("=== CONFUSION MATRIX ===")
print(cm)
print()

print("=== CONFUSION MATRIX WITH LABELS ===")
print("Labels:", labels)
for i, row in enumerate(cm):
    print(f"{labels[i]}: {row}")
print()

print("=== CLASSIFICATION REPORT ===")
print(report_text)
print()

print("=== PER-CLASS METRICS ===")
for label in labels:
    if label in report:
        print(f"Class: {label}")
        print("  Precision:", report[label]["precision"])
        print("  Recall   :", report[label]["recall"])
        print("  F1-Score :", report[label]["f1-score"])
        print("  Support  :", report[label]["support"])
        print()

print("=== OVERALL METRICS ===")
if "macro avg" in report:
    print("Macro Avg Precision:", report["macro avg"]["precision"])
    print("Macro Avg Recall   :", report["macro avg"]["recall"])
    print("Macro Avg F1-Score :", report["macro avg"]["f1-score"])
    print("Macro Avg Support  :", report["macro avg"]["support"])
    print()

if "weighted avg" in report:
    print("Weighted Avg Precision:", report["weighted avg"]["precision"])
    print("Weighted Avg Recall   :", report["weighted avg"]["recall"])
    print("Weighted Avg F1-Score :", report["weighted avg"]["f1-score"])
    print("Weighted Avg Support  :", report["weighted avg"]["support"])
    print()


# Save model and metrics
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
MODEL_DIR = os.path.join(ROOT_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "svc_model.pkl")
METRICS_PATH = os.path.join(MODEL_DIR, "svc_model_metrics.pkl")

os.makedirs(MODEL_DIR, exist_ok=True)

joblib.dump(model, MODEL_PATH)

metrics = {
    "model_name": "SVC",
    "model_config": {
        "scaler": "StandardScaler",
        "classifier": "SVC",
        "kernel": "rbf",
        "C": 1.0,
        "gamma": "scale",
        "random_state": 42
    },
    "dataset_info": {
        "feature_shape": list(X.shape),
        "target_shape": int(y.shape[0]),
        "train_shape": list(X_train.shape),
        "test_shape": list(X_test.shape),
        "test_size": 0.2,
        "random_state": 42,
        "stratify": True
    },
    "class_labels": labels,
    "class_distribution": {
        "full_dataset": y.value_counts().to_dict(),
        "train_set": y_train.value_counts().to_dict(),
        "test_set": y_test.value_counts().to_dict()
    },
    "accuracy": float(accuracy),
    "f1_weighted": float(f1_weighted),
    "f1_macro": float(f1_macro),
    "confusion_matrix": cm.tolist(),
    "classification_report": report,
    "feature_names": list(X.columns) if hasattr(X, "columns") else []
}

METRICS_JSON_PATH = os.path.join(MODEL_DIR, "svc_model_metrics.json")

with open(METRICS_JSON_PATH, "w") as f:
    json.dump(metrics, f, indent=2)

print(f"\nModel saved as {MODEL_PATH}")
print(f"Metrics saved as {METRICS_JSON_PATH}")