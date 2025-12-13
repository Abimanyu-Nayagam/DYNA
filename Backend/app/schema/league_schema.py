from pydantic import BaseModel, ConfigDict

class LeagueBaseSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    cur_rank: str
    peak_rank: str
    main_role: str
    avg_kda: float
    avg_kp_percent: float
    cs_per_min: float | None = None
    avg_dmg: float | None = None
    avg_vision_score: float | None = None