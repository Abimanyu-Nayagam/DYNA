from app import db
from app.models import LeagueForm, UserHighlights, User
from app.schema import LeagueBaseSchema
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from app.utils.s3 import upload_video_to_s3, delete_from_s3

lol_bp = Blueprint('lol', __name__)

# Route to create a new league portfolio
@lol_bp.route('/create-folio', methods=['POST'])
@jwt_required()
def create_portfolio():
    print("CONTENT-TYPE:", request.content_type)
    print("FORM:", request.form)
    print("FILES:", request.files)
    user_id = get_jwt_identity()

    if LeagueForm.query.filter_by(user_id=user_id).first():
        return jsonify({"error": "League portfolio already exists"}), 400

    form_data = request.form
    videos = request.files.getlist("videos")

    try:
        validated = LeagueBaseSchema(**form_data.to_dict())
    except Exception as e:
        print(f"Pydantic error: {e}")
        return jsonify({"error": str(e)}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    new_form = LeagueForm(
        user_id=user_id,

        cur_rank=validated.cur_rank,
        peak_rank=validated.peak_rank,
        last_season_rank=validated.last_season_rank,
        player_since=validated.player_since,

        main_role=validated.main_role,
        server=validated.server,

        cs_per_min=validated.cs_per_min,

        avg_kills=validated.avg_kills,
        avg_deaths=validated.avg_deaths,
        avg_assists=validated.avg_assists,

        avg_dmg=validated.avg_dmg,
        avg_vision_score=validated.avg_vision_score,
        avg_game_duration=validated.avg_game_duration,

        ign=validated.ign,
        riot_id=validated.riot_id,
    )

    db.session.add(new_form)
    db.session.flush()

    for video in videos:
        video_url = upload_video_to_s3(video, user_id, "lol")
        db.session.add(UserHighlights(
            user_id=user_id,
            username=user.user_name,   # ✅ FIX
            game_name="lol",
            video_url=video_url
        ))

    db.session.commit()
    return jsonify({"message": "League portfolio created"}), 201

# Route to get a league portfolio by user_id
@lol_bp.route('/get-folio/<ign>', methods=['GET'])
def get_portfolio(ign):
    form = LeagueForm.query.filter_by(ign=ign).first()

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

@lol_bp.route("/videos", methods=["POST"])
def get_highlight_videos():
    data = request.get_json()
    user_name = data.get("username")
    game_name = data.get("game_name")

    # Validate input
    if not user_name or not game_name:
        return jsonify({"error": "Provide both user_name and game_name"}), 400

    # Query the highlights table
    videos = UserHighlights.query.filter_by(username=user_name, game_name=game_name).all()
    video_list = [v.video_url for v in videos]

    if not video_list:
        return jsonify({"message": "No videos found", "videos": []}), 200

    return jsonify({"videos": video_list}), 200

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

    form = LeagueForm.query.filter_by(user_id=user_id).first()
    if not form:
        return jsonify({"error": "League portfolio not found"}), 404

    form_data = request.form
    videos = request.files.getlist("videos")

    try:
        validated = LeagueBaseSchema(**form_data.to_dict())
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    for field, value in validated.model_dump(exclude_unset=True).items():
        setattr(form, field, value)

    for video in videos:
        video_url = upload_video_to_s3(video, user_id, "lol")
        db.session.add(UserHighlights(
            user_id=user_id,
            username=user.user_name,   # ✅ FIX
            game_name="lol",
            video_url=video_url
        ))

    db.session.commit()
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

@lol_bp.route('/get-ign-from-user-id/<int:user_id>', methods = ['POST'])
def get_ign_from_id(user_id):
    row = LeagueForm.query.filter_by(user_id=user_id).first()
    if not row:
        return jsonify({"error": "User does not have a league portfolio"}), 404

    return jsonify({"ign": row.ign})
