from preprocess import load_and_prepare_data

X, y = load_and_prepare_data()
print(X.columns.tolist())