import os
import joblib
from preprocess_regression import load_and_prepare_data_regression
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Base paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.normpath(os.path.join(BASE_DIR, "..", "models"))
os.makedirs(MODELS_DIR, exist_ok=True)

# Load data
X, y, low_threshold, high_threshold = load_and_prepare_data_regression()

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42
)

# Create model
model = RandomForestRegressor(
    n_estimators=100,
    max_depth=5,
    random_state=42
)

# Train
model.fit(X_train, y_train)

# Predict
y_pred = model.predict(X_test)

# Evaluate
mae = mean_absolute_error(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)
rmse = mse ** 0.5
r2 = r2_score(y_test, y_pred)

print("=== RANDOM FOREST REGRESSOR ===")
print("MAE:", mae)
print("MSE:", mse)
print("RMSE:", rmse)
print("R² Score:", r2)

# Save model
model_path = os.path.join(MODELS_DIR, "random_forest_regressor.pkl")
metadata_path = os.path.join(MODELS_DIR, "regression_metadata.pkl")

joblib.dump(model, model_path)
joblib.dump(
    {
        "low_threshold": low_threshold,
        "high_threshold": high_threshold,
        "feature_names": X.columns.tolist()
    },
    metadata_path
)

print(f"\nModel saved as {model_path}")
print(f"Metadata saved as {metadata_path}")