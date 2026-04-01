import mysql.connector
from config import DB_CONFIG, REGION_NAME_MAP
from services.model_service import VALID_REGIONS


def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)


def save_single_prediction(
    data,
    to_int,
    to_float,
    normalize_region,
):
    conn = None
    cursor = None

    try:
        region = normalize_region(data["region"])
        if region not in VALID_REGIONS:
            raise ValueError(f"Invalid region: {region}")

        region_name = REGION_NAME_MAP.get(region, region)

        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            INSERT INTO regional_data (
                region,
                region_name,
                year,
                ave_income,
                expenditure,
                unemployment_rate,
                mean_years_education,
                population_size,
                poverty_level
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        values = (
            region,
            region_name,
            to_int(data["year"], "year"),
            to_float(data["ave_income"], "ave_income"),
            to_float(data["expenditure"], "expenditure"),
            to_float(data["unemployment_rate"], "unemployment_rate"),
            to_float(data["mean_years_education"], "mean_years_education"),
            to_int(data["population_size"], "population_size"),
            str(data["poverty_level"])
        )

        cursor.execute(query, values)
        conn.commit()

        return cursor.lastrowid
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def save_bulk_predictions(
    data,
    validate_prediction_data,
    to_int,
    to_float,
    normalize_region,
):
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            INSERT INTO regional_data (
                region,
                region_name,
                year,
                ave_income,
                expenditure,
                unemployment_rate,
                mean_years_education,
                population_size,
                poverty_level
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        saved_count = 0
        errors = []

        for index, item in enumerate(data):
            try:
                validate_prediction_data(item, require_poverty_level=True)

                region = normalize_region(item["region"])
                if region not in VALID_REGIONS:
                    raise ValueError(f"Invalid region: {region}")

                region_name = REGION_NAME_MAP.get(region, region)

                values = (
                    region,
                    region_name,
                    to_int(item["year"], "year"),
                    to_float(item["ave_income"], "ave_income"),
                    to_float(item["expenditure"], "expenditure"),
                    to_float(item["unemployment_rate"], "unemployment_rate"),
                    to_float(item["mean_years_education"], "mean_years_education"),
                    to_int(item["population_size"], "population_size"),
                    str(item["poverty_level"])
                )

                cursor.execute(query, values)
                saved_count += 1

            except Exception as row_error:
                errors.append({
                    "row_index": item.get("row_index", index + 1),
                    "error": str(row_error)
                })

        conn.commit()

        return {
            "saved_rows": saved_count,
            "failed_rows": len(errors),
            "errors": errors
        }
    except Exception:
        if conn:
            conn.rollback()
        raise
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def save_prediction_history(
    file_name,
    total_rows,
    predicted_rows,
    failed_rows,
    model_info,
    results,
):
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        history_query = """
            INSERT INTO prediction_history (
                file_name,
                total_rows,
                predicted_rows,
                failed_rows,
                model_name,
                accuracy,
                f1,
                recall
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """

        history_values = (
            str(file_name or ""),
            int(total_rows or 0),
            int(predicted_rows or 0),
            int(failed_rows or 0),
            model_info.get("model_name") if isinstance(model_info, dict) else None,
            model_info.get("accuracy") if isinstance(model_info, dict) else None,
            model_info.get("f1") if isinstance(model_info, dict) else None,
            model_info.get("recall") if isinstance(model_info, dict) else None,
        )

        cursor.execute(history_query, history_values)
        history_id = cursor.lastrowid

        detail_query = """
            INSERT INTO prediction_history_details (
                history_id,
                row_index,
                region,
                year,
                ave_income,
                expenditure,
                unemployment_rate,
                mean_years_education,
                population_size,
                poverty_level
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        for row in results:
            detail_values = (
                history_id,
                row.get("row_index"),
                row.get("region"),
                row.get("year"),
                row.get("ave_income"),
                row.get("expenditure"),
                row.get("unemployment_rate"),
                row.get("mean_years_education"),
                row.get("population_size"),
                row.get("poverty_level"),
            )
            cursor.execute(detail_query, detail_values)

        conn.commit()

        return {
            "history_id": history_id,
            "details_saved": len(results or [])
        }

    except Exception:
        if conn:
            conn.rollback()
        raise
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()