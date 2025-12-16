from app import db
from app.models import LeagueForm
from app.schema import LeagueBaseSchema
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

lol_bp = Blueprint('lol', __name__)

# Route to create a new league portfolio
@lol_bp.route('/create-folio', methods=['POST'])
@jwt_required()
def create_portfolio():
    # If portfolio exists for user_id, return error
    try:
        user_id = get_jwt_identity()
        print(user_id)
        existing_form = LeagueForm.query.filter_by(user_id=user_id).first()
        if existing_form:
            return jsonify({"error": "League portfolio already exists for this user_id"}), 400
    except Exception as e:
        return jsonify({"error": "Invalid request: " + str(e)}), 400

    data = request.get_json()

    # Pydantic validation
    try:
        league_data = LeagueBaseSchema(**data)
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
    new_form = LeagueForm(
        user_id=user_id,

        cur_rank=data["cur_rank"],
        peak_rank=data["peak_rank"],
        last_season_rank=data.get("last_season_rank"),
        player_since=data["player_since"],

        main_role=data["main_role"],
        server=data.get("server"),

        cs_per_min=data.get("cs_per_min"),

        avg_kills=data.get("avg_kills"),
        avg_deaths=data.get("avg_deaths"),
        avg_assists=data.get("avg_assists"),

        avg_dmg=data.get("avg_dmg"),
        avg_vision_score=data.get("avg_vision_score"),
        avg_game_duration=data.get("avg_game_duration"),

        ign=data.get("ign"),
        riot_id=data.get("riot_id")
        )


    try:
        db.session.add(new_form)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Database error: " + str(e)}), 500
    
    return jsonify({"message": "League portfolio created successfully"}), 201

# Route to get a league portfolio by user_id
@lol_bp.route('/get-folio', methods=['GET'])
@jwt_required()
def get_portfolio():
    user_id = get_jwt_identity()
    form = LeagueForm.query.filter_by(user_id=user_id).first()

    if not form:
        return jsonify({"error": "League portfolio not found"}), 404

    form_data = {
        "id": form.id,
        "user_id": form.user_id,

        "cur_rank": form.cur_rank,
        "peak_rank": form.peak_rank,
        "last_season_rank": form.last_season_rank,
        "player_since": form.player_since,

        "main_role": form.main_role,
        "server": form.server,

        "cs_per_min": form.cs_per_min,

        "avg_kills": form.avg_kills,
        "avg_deaths": form.avg_deaths,
        "avg_assists": form.avg_assists,

        "avg_dmg": form.avg_dmg,
        "avg_vision_score": form.avg_vision_score,
        "avg_game_duration": form.avg_game_duration,

        "ign": form.ign,
        "riot_id": form.riot_id,
    }

    return jsonify(form_data), 200


# Route to get all league portfolios
@lol_bp.route('/get-all-folios', methods=['GET'])
def get_all_portfolios():
    forms = LeagueForm.query.all()
    all_forms = []

    for form in forms:
        all_forms.append({
            "id": form.id,
            "user_id": form.user_id,

            "cur_rank": form.cur_rank,
            "peak_rank": form.peak_rank,
            "last_season_rank": form.last_season_rank,
            "player_since": form.player_since,

            "main_role": form.main_role,
            "server": form.server,

            "cs_per_min": form.cs_per_min,

            "avg_kills": form.avg_kills,
            "avg_deaths": form.avg_deaths,
            "avg_assists": form.avg_assists,

            "avg_dmg": form.avg_dmg,
            "avg_vision_score": form.avg_vision_score,
            "avg_game_duration": form.avg_game_duration,

            "ign": form.ign,
            "riot_id": form.riot_id,
        })

    return jsonify(all_forms), 200


# Route to update a league portfolio by user_id
@lol_bp.route('/update-folio', methods=['PUT'])
@jwt_required()
def update_portfolio():
    user_id = get_jwt_identity()
    data = request.get_json()

    form = LeagueForm.query.filter_by(user_id=user_id).first()
    if not form:
        return jsonify({"error": "League portfolio not found"}), 404

    # Pydantic validation
    try:
        league_data = LeagueBaseSchema(**data)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    form.cur_rank = data.get("cur_rank", form.cur_rank)
    form.peak_rank = data.get("peak_rank", form.peak_rank)
    form.last_season_rank = data.get("last_season_rank", form.last_season_rank)
    form.player_since = data.get("player_since", form.player_since)

    form.main_role = data.get("main_role", form.main_role)
    form.server = data.get("server", form.server)

    form.cs_per_min = data.get("cs_per_min", form.cs_per_min)

    form.avg_kills = data.get("avg_kills", form.avg_kills)
    form.avg_deaths = data.get("avg_deaths", form.avg_deaths)
    form.avg_assists = data.get("avg_assists", form.avg_assists)

    form.avg_dmg = data.get("avg_dmg", form.avg_dmg)
    form.avg_vision_score = data.get("avg_vision_score", form.avg_vision_score)
    form.avg_game_duration = data.get("avg_game_duration", form.avg_game_duration)

    form.ign = data.get("ign", form.ign)
    form.riot_id = data.get("riot_id", form.riot_id)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Database error: " + str(e)}), 500

    return jsonify({"message": "League portfolio updated successfully"}), 200


# Route to delete a league portfolio by user_id
@lol_bp.route('/delete-folio', methods=['DELETE'])
@jwt_required()
def delete_portfolio():
    user_id = get_jwt_identity()
    form = LeagueForm.query.filter_by(user_id=user_id).first()
    if not form:
        return jsonify({"error": "League form not found"}), 404
    
    try:
        db.session.delete(form)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Database error: " + str(e)}), 500
    
    return jsonify({"message": "League form deleted successfully"}), 200
