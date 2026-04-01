def to_float(value, field_name):
    try:
        if value is None or value == "":
            raise ValueError(f"{field_name} is required")
        return float(value)
    except Exception:
        raise ValueError(f"{field_name} must be a valid number")


def to_int(value, field_name):
    try:
        if value is None or value == "":
            raise ValueError(f"{field_name} is required")
        return int(float(value))
    except Exception:
        raise ValueError(f"{field_name} must be a valid integer")


def normalize_region(region):
    return str(region or "").strip()