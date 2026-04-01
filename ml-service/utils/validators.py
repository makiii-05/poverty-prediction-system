def validate_prediction_data(data, require_poverty_level=False):
    required_fields = [
        "region",
        "year",
        "ave_income",
        "expenditure",
        "unemployment_rate",
        "mean_years_education",
        "population_size"
    ]

    if require_poverty_level:
        required_fields.append("poverty_level")

    missing_fields = [
        field for field in required_fields
        if field not in data or data[field] in [None, ""]
    ]

    if missing_fields:
        raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")