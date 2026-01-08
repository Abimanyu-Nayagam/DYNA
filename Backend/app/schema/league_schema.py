from pydantic import BaseModel, ConfigDict

class LeagueBaseSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    cur_rank: str
    peak_rank: str
    player_since: str
    last_season_rank: str | None = None

    main_role: str
    server: str | None = None

    cs_per_min: float | None = None

    avg_kills: float | None = None
    avg_deaths: float | None = None
    avg_assists: float | None = None

    avg_dmg: float | None = None
    avg_vision_score: float | None = None
    avg_game_duration: float | None = None

    ign: str | None = None
    riot_id: str | None = None
