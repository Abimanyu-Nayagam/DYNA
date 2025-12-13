from app import db
from datetime import datetime, timezone

class CsgoPlayerStats(db.Model):
    __tablename__ = "csgo_player_stats"
    
    # Primary key
    id = db.Column(db.Integer, primary_key=True, nullable=False, autoincrement=True)
    
    # Foreign key to User model
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    
    # Player identification
    username = db.Column(db.String(100), nullable=False)
    in_game_id = db.Column(db.String(100), nullable=False, unique=True)
    
    # Rankings and ratings
    current_rank = db.Column(db.String(50), nullable=True)
    highest_rank = db.Column(db.String(50), nullable=True)
    mm_rank = db.Column(db.String(50), nullable=True)          
    faceit_level = db.Column(db.Integer, nullable=True)        
    elo = db.Column(db.Integer, nullable=True)                 
    
    # Combat performance
    kd_ratio = db.Column(db.Float, nullable=True)
    headshot_percentage = db.Column(db.Float, nullable=True)
    kills = db.Column(db.Integer, default=0)
    deaths = db.Column(db.Integer, default=0)
    assists = db.Column(db.Integer, default=0)
    mvps = db.Column(db.Integer, default=0)
    
    # Match statistics
    matches_played = db.Column(db.Integer, default=0)
    wins = db.Column(db.Integer, default=0)
    win_rate = db.Column(db.Float, nullable=True)
    
    # Performance averages
    avg_damage_per_round = db.Column(db.Float, nullable=True)
    avg_kills_per_round = db.Column(db.Float, nullable=True)
    rounds_played = db.Column(db.Integer, default=0)
    
    # Utility and objective play
    bomb_plants = db.Column(db.Integer, default=0)
    bomb_defuses = db.Column(db.Integer, default=0)
    flash_assists = db.Column(db.Integer, default=0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=datetime.now(timezone.utc),
        onupdate=datetime.now(timezone.utc)
    )
    
    ishidden = db.Column(db.Boolean, default=False)
    
    # Relationship to User model
    user = db.relationship('User', backref=db.backref('csgo_stats', lazy=True))
    
    def __repr__(self):
        return f"<CsgoPlayerStats {self.username} - IGN: {self.in_game_id}>"
    
    def to_dict(self):
        """Convert the model to a dictionary for JSON serialization"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.username,
            'in_game_id': self.in_game_id,
            'current_rank': self.current_rank,
            'highest_rank': self.highest_rank,
            'mm_rank': self.mm_rank,
            'faceit_level': self.faceit_level,
            'elo': self.elo,
            'kd_ratio': self.kd_ratio,
            'headshot_percentage': self.headshot_percentage,
            'kills': self.kills,
            'deaths': self.deaths,
            'assists': self.assists,
            'mvps': self.mvps,
            'matches_played': self.matches_played,
            'wins': self.wins,
            'win_rate': self.win_rate,
            'avg_damage_per_round': self.avg_damage_per_round,
            'avg_kills_per_round': self.avg_kills_per_round,
            'rounds_played': self.rounds_played,
            'bomb_plants': self.bomb_plants,
            'bomb_defuses': self.bomb_defuses,
            'flash_assists': self.flash_assists,
            'ishidden': self.ishidden,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
