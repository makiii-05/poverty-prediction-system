import os
import joblib
from preprocess import load_and_prepare_data
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

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

# Evaluate
print("=== SVC MODEL ===")
print("Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:")
print(classification_report(y_test, y_pred))
print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))

# Save model to ml-service/models/
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
MODEL_DIR = os.path.join(ROOT_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "svc_model.pkl")

# Create models folder if it does not exist
os.makedirs(MODEL_DIR, exist_ok=True)

# Save model
joblib.dump(model, MODEL_PATH)
print(f"\nModel saved as {MODEL_PATH}")