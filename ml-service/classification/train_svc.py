import os
import sys
import json
import time
import joblib

from typing import Any, Dict, cast

# =====================================================
# FIX IMPORT PATH
# =====================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

PROJECT_ROOT = os.path.normpath(
    os.path.join(BASE_DIR, "..")
)

ML_SERVICE_DIR = os.path.join(PROJECT_ROOT, "ml-service")

if ML_SERVICE_DIR not in sys.path:
    sys.path.append(ML_SERVICE_DIR)

from preprocess import load_and_prepare_data

# =====================================================
# SKLEARN IMPORTS
# =====================================================
from sklearn.model_selection import (
    train_test_split,
    StratifiedKFold,
    GridSearchCV,
    cross_val_score
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score
)

# =====================================================
# LOAD DATASET
# =====================================================
print("======================================")
print("LOADING PREPROCESSED DATASET")
print("======================================")

X, y = load_and_prepare_data()

print("\n=== DATASET INFO ===")
print("Feature Shape :", X.shape)
print("Target Shape  :", y.shape)

print("\n=== CLASS DISTRIBUTION FULL DATASET ===")
print(y.value_counts())

# =====================================================
# TRAIN / TEST SPLIT
# =====================================================
print("\n======================================")
print("SPLITTING TRAIN / TEST DATA")
print("======================================")

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

print("\n=== TRAIN / TEST INFO ===")
print("X_train Shape :", X_train.shape)
print("X_test Shape  :", X_test.shape)
print("y_train Shape :", y_train.shape)
print("y_test Shape  :", y_test.shape)

print("\n=== TRAIN CLASS DISTRIBUTION ===")
print(y_train.value_counts())

print("\n=== TEST CLASS DISTRIBUTION ===")
print(y_test.value_counts())

# =====================================================
# PIPELINE
# =====================================================
print("\n======================================")
print("CREATING SVC PIPELINE")
print("======================================")

pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("svc", SVC(
        random_state=42
    ))
])

print(pipeline)

# =====================================================
# CROSS VALIDATION SETUP
# =====================================================
print("\n======================================")
print("SETTING UP STRATIFIED K-FOLD CV")
print("======================================")

cv = StratifiedKFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)

# =====================================================
# GRIDSEARCHCV SETUP
# =====================================================
print("\n======================================")
print("SETTING UP GRIDSEARCHCV")
print("======================================")

param_grid = {
    "svc__kernel": ["rbf"],
    "svc__C": [0.1, 1, 10, 100],
    "svc__gamma": ["scale", "auto", 0.01, 0.1, 1]
}

grid_search = GridSearchCV(
    estimator=pipeline,
    param_grid=param_grid,
    scoring="f1_weighted",
    cv=cv,
    n_jobs=-1,
    verbose=2
)

print("\n=== PARAMETER GRID ===")
print(param_grid)

# =====================================================
# TRAINING PHASE
# =====================================================
print("\n======================================")
print("TRAINING PHASE WITH GRIDSEARCHCV")
print("======================================")

start_time = time.time()

grid_search.fit(X_train, y_train)

end_time = time.time()
training_time = end_time - start_time

print(f"\n✅ Training Completed in {training_time:.4f} seconds")

print("\n=== BEST PARAMETERS ===")
print(grid_search.best_params_)

print("\n=== BEST CROSS-VALIDATION SCORE ===")
print(grid_search.best_score_)

# Best trained model
model = grid_search.best_estimator_

# =====================================================
# EXTRA CROSS VALIDATION ON BEST MODEL
# =====================================================
print("\n======================================")
print("VALIDATING BEST MODEL USING CROSS_VAL_SCORE")
print("======================================")

cv_scores = cross_val_score(
    model,
    X_train,
    y_train,
    cv=cv,
    scoring="f1_weighted",
    n_jobs=-1
)

print("\n=== CROSS VALIDATION SCORES ===")
print(cv_scores)

print("\n=== MEAN CV SCORE ===")
print(cv_scores.mean())

print("\n=== STD CV SCORE ===")
print(cv_scores.std())

# =====================================================
# PREDICTION
# =====================================================
print("\n======================================")
print("PREDICTING TEST DATA")
print("======================================")

y_pred = model.predict(X_test)

# =====================================================
# METRICS
# =====================================================
print("\n======================================")
print("CALCULATING METRICS")
print("======================================")

accuracy = accuracy_score(y_test, y_pred)

f1_weighted = f1_score(
    y_test,
    y_pred,
    average="weighted"
)

f1_macro = f1_score(
    y_test,
    y_pred,
    average="macro"
)

cm = confusion_matrix(y_test, y_pred)

report = cast(
    Dict[str, Any],
    classification_report(
        y_test,
        y_pred,
        output_dict=True
    )
)

report_text = classification_report(
    y_test,
    y_pred
)

labels = sorted(y.unique())

# =====================================================
# PRINT RESULTS
# =====================================================
print("\n======================================")
print("MODEL RESULTS")
print("======================================")

print("Accuracy           :", accuracy)
print("F1 Score Weighted  :", f1_weighted)
print("F1 Score Macro     :", f1_macro)

print("\n=== CLASS LABELS ===")
print(labels)

print("\n=== CONFUSION MATRIX ===")
print(cm)

print("\n=== CONFUSION MATRIX WITH LABELS ===")

for i, row in enumerate(cm):
    print(f"{labels[i]}: {row}")

print("\n=== CLASSIFICATION REPORT ===")
print(report_text)

# =====================================================
# PER-CLASS METRICS
# =====================================================
print("\n======================================")
print("PER-CLASS METRICS")
print("======================================")

for label in labels:
    class_metrics = report.get(str(label))

    if isinstance(class_metrics, dict):
        print(f"\nClass: {label}")
        print("  Precision:", class_metrics.get("precision", 0))
        print("  Recall   :", class_metrics.get("recall", 0))
        print("  F1-Score :", class_metrics.get("f1-score", 0))
        print("  Support  :", class_metrics.get("support", 0))

# =====================================================
# OVERALL METRICS
# =====================================================
print("\n======================================")
print("OVERALL METRICS")
print("======================================")

macro_avg = report.get("macro avg")

if isinstance(macro_avg, dict):
    print("\n=== MACRO AVG ===")
    print("Precision:", macro_avg.get("precision", 0))
    print("Recall   :", macro_avg.get("recall", 0))
    print("F1-Score :", macro_avg.get("f1-score", 0))
    print("Support  :", macro_avg.get("support", 0))

weighted_avg = report.get("weighted avg")

if isinstance(weighted_avg, dict):
    print("\n=== WEIGHTED AVG ===")
    print("Precision:", weighted_avg.get("precision", 0))
    print("Recall   :", weighted_avg.get("recall", 0))
    print("F1-Score :", weighted_avg.get("f1-score", 0))
    print("Support  :", weighted_avg.get("support", 0))

# =====================================================
# SAVE MODEL
# =====================================================
print("\n======================================")
print("SAVING MODEL")
print("======================================")

MODEL_DIR = os.path.join(PROJECT_ROOT, "models")

os.makedirs(MODEL_DIR, exist_ok=True)

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "svc_model.pkl"
)

joblib.dump(model, MODEL_PATH)

print("Model saved at:")
print(MODEL_PATH)

# =====================================================
# SAVE METRICS
# =====================================================
print("\n======================================")
print("SAVING METRICS JSON")
print("======================================")

metrics = {
    "model_name": "SVC",

    "model_config": {
        "scaler": "StandardScaler",
        "classifier": "SVC",
        "best_params": grid_search.best_params_,
        "best_cv_score": float(grid_search.best_score_),
        "cv_folds": 5,
        "scoring": "f1_weighted",
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

    "grid_search": {
        "param_grid": param_grid,
        "best_params": grid_search.best_params_,
        "best_score": float(grid_search.best_score_)
    },

    "cross_validation": {
        "cv_scores": cv_scores.tolist(),
        "mean_cv_score": float(cv_scores.mean()),
        "std_cv_score": float(cv_scores.std()),
        "cv_folds": 5,
        "scoring": "f1_weighted"
    },

    "test_metrics": {
        "accuracy": float(accuracy),
        "f1_weighted": float(f1_weighted),
        "f1_macro": float(f1_macro),
        "confusion_matrix": cm.tolist(),
        "classification_report": report
    },

    "training_time_seconds": float(training_time),

    "feature_names": (
        list(X.columns)
        if hasattr(X, "columns")
        else []
    )
}

METRICS_JSON_PATH = os.path.join(
    MODEL_DIR,
    "svc_model_metrics.json"
)

with open(METRICS_JSON_PATH, "w") as f:
    json.dump(metrics, f, indent=2)

print("Metrics saved at:")
print(METRICS_JSON_PATH)

print("\n======================================")
print("PROCESS COMPLETED SUCCESSFULLY")
print("======================================")