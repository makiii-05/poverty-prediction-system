from preprocess_regression import load_and_prepare_data_regression
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVR
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Load data
X, y, low_threshold, high_threshold = load_and_prepare_data_regression()

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42
)

models = {
    "Decision Tree Regressor": DecisionTreeRegressor(
        random_state=42,
        max_depth=5
    ),
    "Random Forest Regressor": RandomForestRegressor(
        n_estimators=100,
        max_depth=5,
        random_state=42
    ),
    "SVR": Pipeline([
        ("scaler", StandardScaler()),
        ("svr", SVR(kernel="rbf", C=1.0, gamma="scale"))
    ])
}

print("=== REGRESSION MODEL COMPARISON ===")
print(f"Low Threshold: {low_threshold:.4f}")
print(f"High Threshold: {high_threshold:.4f}\n")

for name, model in models.items():
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = mse ** 0.5
    r2 = r2_score(y_test, y_pred)

    print(f"{name}")
    print(f"MAE : {mae:.4f}")
    print(f"MSE : {mse:.4f}")
    print(f"RMSE: {rmse:.4f}")
    print(f"R²  : {r2:.4f}")
    print("-" * 40)