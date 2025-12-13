from pydantic import BaseModel, ConfigDict

class PubgBaseSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    username: str
    in_game_id: str
    fd_ratio: float | None = None
    current_rank: str | None = None
    highest_rank: str | None = None
    headshot_rate: float | None = None
    headshots: int = 0
    eliminations: int = 0
    most_eliminations: int = 0
    matches_played: int = 0
    wins: int = 0
    top_10: int = 0
    avg_damage: float | None = None
    avg_survival_time: float | None = None
