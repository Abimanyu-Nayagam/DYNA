from app import db

class UserHighlights(db.Model):
    __tablename__ = "user_highlights"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    username = db.Column(db.String(150), nullable=False)
    game_name = db.Column(db.String(50), nullable=False)
    video_url = db.Column(db.String(500), nullable=False)

    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
