from pydantic import BaseModel, ConfigDict

class LeagueBaseSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    cur_rank: str
    peak_rank: str
    main_role: str
    cs_per_min: float
    