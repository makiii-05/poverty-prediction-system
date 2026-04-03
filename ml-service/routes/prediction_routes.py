from flask import Blueprint, request, jsonify

from services.model_service import (
    FEATURE_COLUMNS,
    VALID_REGIONS,
    get_model_info,
    predict_single,
)
from services.db_service import (
    save_single_prediction,
    save_bulk_predictions,
    save_prediction_history,
    get_prediction_history,
)

from utils.validators import validate_prediction_data
from utils.helpers import to_int, to_float, normalize_region

prediction_bp = Blueprint("prediction_bp", __name__)


@prediction_bp.route("/", methods=["GET"])
def home():
    return jsonify({
        "success": True,
        "message": "ML service is running",
        "valid_regions": VALID_REGIONS,
        "feature_columns": FEATURE_COLUMNS,
        "model_info": get_model_info()
    })


@prediction_bp.route("/predict", methods=["POST"])
def predict_user():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": "No input data provided"
            }), 400

        validate_prediction_data(data, require_poverty_level=False)
        prediction = predict_single(data, to_int, to_float, normalize_region)

        return jsonify({
            "success": True,
            "poverty_level": prediction,
            "model_info": get_model_info()
        })

    except ValueError as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@prediction_bp.route("/predict-admin", methods=["POST"])
def predict_admin():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": "No input data provided"
            }), 400

        validate_prediction_data(data, require_poverty_level=False)
        prediction = predict_single(data, to_int, to_float, normalize_region)

        return jsonify({
            "success": True,
            "poverty_level": prediction,
            "model_info": get_model_info()
        })

    except ValueError as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@prediction_bp.route("/predict-bulk", methods=["POST"])
def predict_bulk():
    try:
        data = request.get_json()

        if not isinstance(data, list):
            return jsonify({
                "success": False,
                "error": "Expected a list of rows"
            }), 400

        if len(data) == 0:
            return jsonify({
                "success": False,
                "error": "No rows found"
            }), 400

        results = []
        errors = []

        for index, item in enumerate(data):
            try:
                validate_prediction_data(item, require_poverty_level=False)
                prediction = predict_single(item, to_int, to_float, normalize_region)

                results.append({
                    "row_index": index + 1,
                    "region": normalize_region(item.get("region")),
                    "year": to_int(item.get("year"), "year"),
                    "ave_income": to_float(item.get("ave_income"), "ave_income"),
                    "expenditure": to_float(item.get("expenditure"), "expenditure"),
                    "unemployment_rate": to_float(item.get("unemployment_rate"), "unemployment_rate"),
                    "mean_years_education": to_float(item.get("mean_years_education"), "mean_years_education"),
                    "population_size": to_int(item.get("population_size"), "population_size"),
                    "poverty_level": prediction
                })
            except Exception as row_error:
                errors.append({
                    "row_index": index + 1,
                    "error": str(row_error)
                })

        return jsonify({
            "success": True,
            "total_rows": len(data),
            "predicted_rows": len(results),
            "failed_rows": len(errors),
            "results": results,
            "errors": errors,
            "model_info": get_model_info()
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@prediction_bp.route("/save-prediction", methods=["POST"])
def save_prediction():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": "No input data provided"
            }), 400

        validate_prediction_data(data, require_poverty_level=True)

        inserted_id = save_single_prediction(
            data,
            to_int,
            to_float,
            normalize_region,
        )

        return jsonify({
            "success": True,
            "message": "Prediction saved to database successfully",
            "id": inserted_id
        })

    except ValueError as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@prediction_bp.route("/save-bulk-predictions", methods=["POST"])
def save_bulk():
    try:
        data = request.get_json()

        if not isinstance(data, list):
            return jsonify({
                "success": False,
                "error": "Expected a list of prediction rows"
            }), 400

        if len(data) == 0:
            return jsonify({
                "success": False,
                "error": "No prediction rows provided"
            }), 400

        result = save_bulk_predictions(
            data,
            validate_prediction_data,
            to_int,
            to_float,
            normalize_region,
        )

        return jsonify({
            "success": True,
            "message": "Bulk save completed",
            "saved_rows": result["saved_rows"],
            "failed_rows": result["failed_rows"],
            "errors": result["errors"]
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@prediction_bp.route("/save-history", methods=["POST"])
def save_history():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": "No history payload provided"
            }), 400

        required_fields = [
            "file_name",
            "total_rows",
            "predicted_rows",
            "failed_rows",
            "model_info",
            "results",
        ]

        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                "success": False,
                "error": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400

        history_result = save_prediction_history(
            file_name=data.get("file_name"),
            total_rows=data.get("total_rows"),
            predicted_rows=data.get("predicted_rows"),
            failed_rows=data.get("failed_rows"),
            model_info=data.get("model_info"),
            results=data.get("results") or [],
        )

        return jsonify({
            "success": True,
            "message": "Prediction history saved successfully",
            "history_id": history_result["history_id"],
            "details_saved": history_result["details_saved"]
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
    
@prediction_bp.route("/history", methods=["GET"])
def get_history():
    try:
        limit = request.args.get("limit", default=10, type=int)

        if limit is None or limit <= 0:
            return jsonify({
                "success": False,
                "error": "Limit must be a positive integer"
            }), 400

        history = get_prediction_history(limit=limit)

        return jsonify({
            "success": True,
            "history": history
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500