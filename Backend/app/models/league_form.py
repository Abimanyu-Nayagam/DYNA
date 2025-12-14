from app import db
from datetime import datetime

class LeagueForm(db.Model):
    __tablename__ = 'league_forms'
    
    id = db.Column(db.Integer, primary_key=True, nullable=False, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    
    cur_rank = db.Column(db.String(50), nullable=False)
    peak_rank = db.Column(db.String(50), nullable=False)
    main_role = db.Column(db.String(50), nullable=False)
    cs_per_min = db.Column(db.Float, nullable=True)

    avg_dmg = db.Column(db.Float, nullable=True)
    avg_kda = db.Column(db.Float, nullable=True)
    avg_kp_percent = db.Column(db.Numeric(10, 3), nullable=True)
    avg_vision_score = db.Column(db.Float, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<LeagueForm {self.id} - User {self.user_id}>"