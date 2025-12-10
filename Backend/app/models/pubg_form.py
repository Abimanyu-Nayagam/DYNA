from app import db
from datetime import datetime, timezone

class PubgPlayerStats(db.Model):
    __tablename__ = "pubg_player_stats"
    
    # Primary key
    id = db.Column(db.Integer, primary_key=True, nullable=False, autoincrement=True)
    
    # Foreign key to User model
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    
    # Player identification
    username = db.Column(db.String(100), nullable=False)
    in_game_id = db.Column(db.String(100), nullable=False, unique=True)
    
    # Performance ratios and rankings
    fd_ratio = db.Column(db.Float, nullable=True)
    current_rank = db.Column(db.String(50), nullable=True)
    highest_rank = db.Column(db.String(50), nullable=True)
    
    # Accuracy and combat stats
    headshot_rate = db.Column(db.Float, nullable=True)
    headshots = db.Column(db.Integer, default=0)
    eliminations = db.Column(db.Integer, default=0)
    most_eliminations = db.Column(db.Integer, default=0)
    
    # Match statistics
    matches_played = db.Column(db.Integer, default=0)
    wins = db.Column(db.Integer, default=0)
    top_10 = db.Column(db.Integer, default=0)  # Top 10 finishes
    
    # Performance averages
    avg_damage = db.Column(db.Float, nullable=True)  # Average damage per match
    avg_survival_time = db.Column(db.Float, nullable=True)  # Average survival time in minutes
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    
    # Relationship to User model
    user = db.relationship('User', backref=db.backref('pubg_stats', lazy=True))
    
    def __repr__(self):
        return f"<PubgPlayerStats {self.username} - IGN: {self.in_game_id}>"
    
    def to_dict(self):
        """Convert the model to a dictionary for JSON serialization"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.username,
            'in_game_id': self.in_game_id,
            'fd_ratio': self.fd_ratio,
            'current_rank': self.current_rank,
            'highest_rank': self.highest_rank,
            'headshot_rate': self.headshot_rate,
            'headshots': self.headshots,
            'eliminations': self.eliminations,
            'most_eliminations': self.most_eliminations,
            'matches_played': self.matches_played,
            'wins': self.wins,
            'top_10': self.top_10,
            'avg_damage': self.avg_damage,
            'avg_survival_time': self.avg_survival_time,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        } 