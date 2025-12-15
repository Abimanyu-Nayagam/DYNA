from app import db
from datetime import datetime
class LeagueForm(db.Model):
    __tablename__ = 'league_forms'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)

    cur_rank = db.Column(db.String(50), nullable=False)
    peak_rank = db.Column(db.String(50), nullable=False)
    last_season_rank = db.Column(db.String(50), nullable=True)

    main_role = db.Column(db.String(50), nullable=False)
    server = db.Column(db.String(50), nullable=True)

    cs_per_min = db.Column(db.Float, nullable=True)

    avg_kills = db.Column(db.Float, nullable=True)
    avg_deaths = db.Column(db.Float, nullable=True)
    avg_assists = db.Column(db.Float, nullable=True)

    avg_dmg = db.Column(db.Float, nullable=True)
    avg_vision_score = db.Column(db.Float, nullable=True)
    avg_game_duration = db.Column(db.Float, nullable=True)

    ign = db.Column(db.String(100), nullable=True)
    riot_id = db.Column(db.String(100), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    ishidden = db.Column(db.Boolean, default=False)
