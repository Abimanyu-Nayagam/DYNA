from app import db
from datetime import datetime

# Fields for the form: id (autoincrement primary key), user_id, cur_rank, peak_rank, main_role, cs_per_min, created_at, updated_at
class LeagueForm(db.Model):
    __tablename__ = 'league_forms'
    id = db.Column(db.Integer, primary_key=True, nullable=False, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    cur_rank = db.Column(db.String(50), nullable=False)
    peak_rank = db.Column(db.String(50), nullable=False)
    main_role = db.Column(db.String(50), nullable=False)
    cs_per_min = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<LeagueForm {self.id} - User {self.user_id}>"