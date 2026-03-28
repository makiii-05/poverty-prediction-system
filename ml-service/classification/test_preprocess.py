from preprocess import load_and_prepare_data

# Load processed data
X, y = load_and_prepare_data()

# ======================
# BASIC CHECKS
# ======================

print("=== DATA CHECK ===")
print("X shape:", X.shape)
print("y shape:", y.shape)

print("\n=== FEATURES (X) ===")
print(X.head())

print("\n=== TARGET (y) ===")
print(y.head())

# ======================
# CHECK CLASS DISTRIBUTION
# ======================

print("\n=== POVERTY LEVEL COUNTS ===")
print(y.value_counts())

# ======================
# CHECK IF ANY NULLS
# ======================

print("\n=== NULL CHECK ===")
print(X.isnull().sum())
print(y.isnull().sum())