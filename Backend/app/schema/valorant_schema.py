from pydantic import BaseModel, Field, HttpUrl, field_validator
from typing import List, Optional, Literal
from datetime import date


# =========================================================
# ENUM LITERALS (MUST MATCH DB ENUM .value EXACTLY)
# =========================================================

RegionEnum = Literal[
    "North America",
    "Europe",
    "Asia-Pacific",
    "Korea",
    "Japan",
    "Brazil",
    "LATAM",
    "MEA",
]

ServerEnum = Literal[
    "Mumbai",
    "Singapore",
    "Manila",
    "Tokyo",
    "Seoul",
    "Osaka",
    "Frankfurt",
    "London",
    "Amsterdam",
    "Virginia",
    "Oregon",
    "Texas",
    "California",
    "Sao Paulo",
    "Dubai",
    "Other",
]

RankEnum = Literal[
    "Iron 1", "Iron 2", "Iron 3",
    "Bronze 1", "Bronze 2", "Bronze 3",
    "Silver 1", "Silver 2", "Silver 3",
    "Gold 1", "Gold 2", "Gold 3",
    "Platinum 1", "Platinum 2", "Platinum 3",
    "Diamond 1", "Diamond 2", "Diamond 3",
    "Ascendant 1", "Ascendant 2", "Ascendant 3",
    "Immortal 1", "Immortal 2", "Immortal 3",
    "Radiant",
]

RoleEnum = Literal[
    "Duelist",
    "Initiator",
    "Controller",
    "Sentinel",
]

AgentEnum = Literal[
    "Astra", "Breach", "Brimstone", "Chamber", "Cypher", "Deadlock",
    "Fade", "Gekko", "Harbor", "Iso", "Jett", "KAY/O", "Killjoy",
    "Neon", "Omen", "Phoenix", "Raze", "Reyna", "Sage", "Skye",
    "Sova", "Viper", "Yoru", "Waylay", "Veto", "Tejo",
]

SeasonEnum = Literal[
    "EP01", "EP02", "EP03", "EP04", "EP05",
    "EP06", "EP07", "EP08", "EP09",
    "V24", "V25",
]


# =========================================================
# SUB-SCHEMAS (INLINE FORM SUPPORT)
# =========================================================

class TeamHistoryCreate(BaseModel):
    team_name: str = Field(..., max_length=150)
    joined_at: date
    left_at: Optional[date] = None
    website: Optional[str] = None


class TournamentHistoryCreate(BaseModel):
    name: str = Field(..., max_length=250)
    organizer: Optional[str] = Field(None, max_length=150)
    year: int = Field(..., ge=2019)  # Valorant release year
    placement: Optional[str] = Field(None, max_length=100)
    role_in_tournament: Optional[str] = Field(None, max_length=120)
    notes: Optional[str] = None


# =========================================================
# MAIN CREATE SCHEMA
# =========================================================

class ValorantProfileCreate(BaseModel):

    # -------------------------
    # Identity
    # -------------------------
    riot_id: str = Field(
        ...,
        min_length=3,
        max_length=16,
        pattern=r"^[a-zA-Z0-9_]+$",
    )

    # IMPORTANT:
    # Frontend MUST send tagline WITHOUT '#'
    # Backend will add '#' when displaying full Riot ID
    tagline: str = Field(
        ...,
        min_length=1,
        max_length=6,
        pattern=r"^[A-Za-z0-9]+$",
    )

    # -------------------------
    # Region & Server
    # -------------------------
    region: RegionEnum
    server: ServerEnum

    # -------------------------
    # Started Playing
    # -------------------------
    started_playing: date

    # -------------------------
    # Current Rank (required)
    # -------------------------
    current_rank: RankEnum
    current_season: SeasonEnum
    current_act_number: int = Field(..., ge=1, le=6)

    # -------------------------
    # Peak Rank (MANDATORY)
    # -------------------------
    peak_rank: RankEnum
    peak_season: SeasonEnum
    peak_act_number: int = Field(..., ge=1, le=6)
    peak_rank_date: date

    # -------------------------
    # Core Stats
    # -------------------------
    kd: float = Field(..., ge=0)
    win_rate: float = Field(..., ge=0, le=100)
    total_matches: int = Field(..., ge=0)
    hours_played: float = Field(..., ge=0)

    # -------------------------
    # Role & Playstyle
    # -------------------------
    main_role: RoleEnum
    playstyle_description: str = Field(..., max_length=300)

    aggressiveness: int = Field(..., ge=0, le=10)
    utility_usage: int = Field(..., ge=0, le=10)
    anchoring_skill: int = Field(..., ge=0, le=10)
    lurking_skill: int = Field(..., ge=0, le=10)
    entry_confidence: int = Field(..., ge=0, le=10)

    # -------------------------
    # Agents
    # -------------------------
    best_agent: AgentEnum
    top_agents: List[AgentEnum] = Field(default_factory=list, max_items=5)

    # -------------------------
    # Team Info
    # -------------------------
    in_team: bool = False
    current_team: Optional[str] = Field(None, max_length=150)
    role_in_team: Optional[str] = Field(None, max_length=120)
    been_in_team_before: bool = False

    team_history: Optional[List[TeamHistoryCreate]] = None

    # -------------------------
    # Tournament History
    # -------------------------
    tournaments: Optional[List[TournamentHistoryCreate]] = None

    # -------------------------
    # Media
    # -------------------------
    media_clips: Optional[List[str]] = Field(None, max_items=10)
    banner_url: Optional[str] = None

    # -------------------------
    # Misc
    # -------------------------
    bio: Optional[str] = Field(None, max_length=1000)
    notes: Optional[str] = None
    is_public: bool = False
    visibility_settings: Optional[dict] = None


    # =====================================================
    # VALIDATORS
    # =====================================================

    @field_validator("current_act_number")
    @classmethod
    def validate_current_act(cls, act_number, info):
        season = info.data.get("current_season")
        if season and season.startswith("EP") and act_number > 3:
            raise ValueError("Episodes only have ACT1–ACT3")
        return act_number

    @field_validator("peak_act_number")
    @classmethod
    def validate_peak_act(cls, act_number, info):
        season = info.data.get("peak_season")
        if season and season.startswith("EP") and act_number > 3:
            raise ValueError("Episodes only have ACT1–ACT3")
        return act_number

    @field_validator("top_agents")
    @classmethod
    def validate_top_agents(cls, v):
        if not v:
            raise ValueError("At least one agent must be provided")
        if len(v) > 5:
            raise ValueError("Maximum 5 agents allowed")
        return v

    @field_validator("team_history")
    @classmethod
    def validate_team_history(cls, v, info):
        if v and not info.data.get("been_in_team_before"):
            raise ValueError(
                "been_in_team_before must be true when team_history is provided"
            )
        return v

# =========================================================
# MAIN UPDATE SCHEMA (for PATCH)
# =========================================================

class ValorantProfileUpdate(BaseModel):
    # All fields optional — reuse validation logic
    riot_id: Optional[str] = Field(None, min_length=3, max_length=16, pattern=r"^[a-zA-Z0-9_]+$")
    tagline: Optional[str] = Field(None, min_length=1, max_length=6, pattern=r"^[A-Za-z0-9]+$")
    region: Optional[RegionEnum] = None
    server: Optional[ServerEnum] = None
    started_playing: Optional[date] = None
    current_rank: Optional[RankEnum] = None
    current_season: Optional[SeasonEnum] = None
    current_act_number: Optional[int] = Field(None, ge=1, le=6)
    peak_rank: Optional[RankEnum] = None
    peak_season: Optional[SeasonEnum] = None
    peak_act_number: Optional[int] = Field(None, ge=1, le=6)
    peak_rank_date: Optional[date] = None
    kd: Optional[float] = Field(None, ge=0)
    win_rate: Optional[float] = Field(None, ge=0, le=100)
    total_matches: Optional[int] = Field(None, ge=0)
    hours_played: Optional[float] = Field(None, ge=0)
    main_role: Optional[RoleEnum] = None
    playstyle_description: Optional[str] = Field(None, max_length=300)
    aggressiveness: Optional[int] = Field(None, ge=0, le=10)
    utility_usage: Optional[int] = Field(None, ge=0, le=10)
    anchoring_skill: Optional[int] = Field(None, ge=0, le=10)
    lurking_skill: Optional[int] = Field(None, ge=0, le=10)
    entry_confidence: Optional[int] = Field(None, ge=0, le=10)
    best_agent: Optional[AgentEnum] = None
    top_agents: Optional[List[AgentEnum]] = Field(None, max_items=5)
    in_team: Optional[bool] = None
    current_team: Optional[str] = Field(None, max_length=150)
    role_in_team: Optional[str] = Field(None, max_length=120)
    been_in_team_before: Optional[bool] = None
    team_history: Optional[List[TeamHistoryCreate]] = None
    tournaments: Optional[List[TournamentHistoryCreate]] = None
    media_clips: Optional[List[str]] = Field(None, max_items=10)
    banner_url: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=1000)
    notes: Optional[str] = None
    is_public: Optional[bool] = None
    visibility_settings: Optional[dict] = None

    # Reuse validators — they handle None safely
    @field_validator("current_act_number")
    @classmethod
    def validate_current_act(cls, v, info):
        if v is None:
            return v
        season = info.data.get("current_season")
        if season and season.startswith("EP") and v > 3:
            raise ValueError("Episodes only have ACT1–ACT3")
        return v

    @field_validator("peak_act_number")
    @classmethod
    def validate_peak_act(cls, v, info):
        if v is None:
            return v
        season = info.data.get("peak_season")
        if season and season.startswith("EP") and v > 3:
            raise ValueError("Episodes only have ACT1–ACT3")
        return v

    @field_validator("top_agents")
    @classmethod
    def validate_top_agents(cls, v):
        if v is None:
            return v
        if not v:
            raise ValueError("At least one agent must be provided")
        if len(v) > 5:
            raise ValueError("Maximum 5 agents allowed")
        return v

    @field_validator("team_history")
    @classmethod
    def validate_team_history(cls, v, info):
        if v is None:
            return v
        if not info.data.get("been_in_team_before"):
            raise ValueError(
                "been_in_team_before must be true when team_history is provided"
            )
        return v