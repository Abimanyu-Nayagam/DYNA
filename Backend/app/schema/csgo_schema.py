from pydantic import BaseModel, ConfigDict
from datetime import datetime

class CsgoBaseSchema(BaseModel):
    model_config = ConfigDict(extra="ignore")

    # Player identification
    username: str
    in_game_id: str

    # Video (S3 URL)
    video_url: str | None = None

    # Rankings and ratings
    current_rank: str | None = None
    highest_rank: str | None = None
    mm_rank: str | None = None
    faceit_level: int | None = None
    elo: int | None = None

    # Combat performance
    kd_ratio: float | None = None
    headshot_percentage: float | None = None
    kills: int = 0
    deaths: int = 0
    assists: int = 0
    mvps: int = 0

    # Match statistics
    matches_played: int = 0
    wins: int = 0
    win_rate: float | None = None

    # Performance averages
    avg_damage_per_round: float | None = None
    avg_kills_per_round: float | None = None
    rounds_played: int = 0

    # Utility and objective play
    bomb_plants: int = 0
    bomb_defuses: int = 0
    flash_assists: int = 0
