import joblib
import pandas as pd

model = joblib.load("models/svc_model.pkl")

new_data = pd.DataFrame([{
    "year": 2015,
    "ave_income": 143200,
    "expenditure": 116802,
    "unemployment_rate": 3.5,
    "mean_years_education": 6.63,
    "population_size": 3200000,

    "region_CAR": 0,
    "region_CARAGA": 0,
    "region_MIMAROPA": 0,
    "region_NCR": 0,
    "region_Region I": 0,
    "region_Region II": 0,
    "region_Region III": 0,
    "region_Region IV": 0,
    "region_Region IX": 0,
    "region_Region V": 0,
    "region_Region VI": 0,
    "region_Region VII": 0,
    "region_Region VIII": 0,
    "region_Region X": 0,
    "region_Region XI": 0,
    "region_Region XII": 0
}])

prediction = model.predict(new_data)[0]

# Map to incidence range
if prediction == "Low":
    estimated_incidence = "< 16.3%"
elif prediction == "Moderate":
    estimated_incidence = "16.3% - 27.7%"
else:
    estimated_incidence = "> 27.7%"

print("\n=== NEW INPUT PREDICTION ===")
print("Predicted Poverty Level:", prediction)
print("Estimated Poverty Incidence:", estimated_incidence)