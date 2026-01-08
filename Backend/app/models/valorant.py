from datetime import datetime
from enum import Enum
from typing import List, Optional

from app import db

# -----------------------
# Enums
# -----------------------

class SeasonEnum(str, Enum):
    # Episodes (EP01 .. EP09) - each has ACT1..ACT3
    EP01 = "EP01"
    EP02 = "EP02"
    EP03 = "EP03"
    EP04 = "EP04"
    EP05 = "EP05"
    EP06 = "EP06"
    EP07 = "EP07"
    EP08 = "EP08"
    EP09 = "EP09"

    # Year-style seasons (V24, V25)
    V24 = "V24"
    V25 = "V25"

class ActNumberEnum(int, Enum):
    ACT1 = 1
    ACT2 = 2
    ACT3 = 3
    ACT4 = 4
    ACT5 = 5
    ACT6 = 6

class RegionEnum(str, Enum):
    NA = "North America"
    EU = "Europe"
    AP = "Asia-Pacific"
    KR = "Korea"
    JP = "Japan"
    BR = "Brazil"
    LATAM = "LATAM"
    MEA = "MEA"

class ServerEnum(str, Enum):
    # Asia-Pacific / AP
    MUMBAI = "Mumbai"
    SINGAPORE = "Singapore"
    MANILA = "Manila"
    TOKYO = "Tokyo"
    # Korea / JP
    SEOUL = "Seoul"
    OSAKA = "Osaka"
    # Europe
    FRANKFURT = "Frankfurt"
    LONDON = "London"
    AMSTERDAM = "Amsterdam"
    # North America (example hosts)
    VIRGINIA = "Virginia"
    OREGON = "Oregon"
    TEXAS = "Texas"
    CALIFORNIA = "California"
    # LATAM / BR
    SAO_PAULO = "Sao Paulo"
    # MEA
    DUBAI = "Dubai"
    # fallback / others
    OTHER = "Other"

class RankEnum(str, Enum):
    IRON1 = "Iron 1"
    IRON2 = "Iron 2"
    IRON3 = "Iron 3"
    BRONZE1 = "Bronze 1"
    BRONZE2 = "Bronze 2"
    BRONZE3 = "Bronze 3"
    SILVER1 = "Silver 1"
    SILVER2 = "Silver 2"
    SILVER3 = "Silver 3"
    GOLD1 = "Gold 1"
    GOLD2 = "Gold 2"
    GOLD3 = "Gold 3"
    PLATINUM1 = "Platinum 1"
    PLATINUM2 = "Platinum 2"
    PLATINUM3 = "Platinum 3"
    DIAMOND1 = "Diamond 1"
    DIAMOND2 = "Diamond 2"
    DIAMOND3 = "Diamond 3"
    ASCENDANT1 = "Ascendant 1"
    ASCENDANT2 = "Ascendant 2"
    ASCENDANT3 = "Ascendant 3"
    IMMORTAL1 = "Immortal 1"
    IMMORTAL2 = "Immortal 2"
    IMMORTAL3 = "Immortal 3"
    RADIANT = "Radiant"

class RoleEnum(str, Enum):
    DUELIST = "Duelist"
    INITIATOR = "Initiator"
    CONTROLLER = "Controller"
    SENTINEL = "Sentinel"

class AgentEnum(str, Enum):
    ASTRA = "Astra"
    BREACH = "Breach"
    BRIMSTONE = "Brimstone"
    CHAMBER = "Chamber"
    CYPHER = "Cypher"
    DEADLOCK = "Deadlock"
    FADE = "Fade"
    GEKKO = "Gekko"
    HARBOR = "Harbor"
    ISO = "Iso"
    JETT = "Jett"
    KAYO = "KAY/O"
    KILLJOY = "Killjoy"
    NEON = "Neon"
    OMEN = "Omen"
    PHOENIX = "Phoenix"
    RAZE = "Raze"
    REYNA = "Reyna"
    SAGE = "Sage"
    SKYE = "Skye"
    SOVA = "Sova"
    VIPER = "Viper"
    YORU = "Yoru"
    WAYLAY = "Waylay"
    VETO = "Veto"
    TEJO = "Tejo"


# -----------------------
# Team history table (separate)
# -----------------------
class TeamHistory(db.Model):
    __tablename__ = "team_history"

    id = db.Column(db.Integer, primary_key=True)
    valorant_profile_id = db.Column(db.Integer, db.ForeignKey("valorant_profile.id", ondelete="CASCADE"), nullable=False)

    team_name = db.Column(db.String(150), nullable=False)
    joined_at = db.Column(db.Date, nullable=False)
    left_at = db.Column(db.Date, nullable=True)
    website = db.Column(db.String(300), nullable=True)

    def to_dict(self):
        return {
            "team_name": self.team_name,
            "joined_at": self.joined_at.isoformat() if self.joined_at else None,
            "left_at": self.left_at.isoformat() if self.left_at else None,
            "website": self.website,
        }


# -----------------------
# Tournament history table (separate)
# -----------------------
class TournamentHistory(db.Model):
    __tablename__ = "tournament_history"

    id = db.Column(db.Integer, primary_key=True)
    valorant_profile_id = db.Column(db.Integer, db.ForeignKey("valorant_profile.id", ondelete="CASCADE"), nullable=False)

    name = db.Column(db.String(250), nullable=False)
    organizer = db.Column(db.String(150), nullable=True)
    year = db.Column(db.Integer, nullable=True)
    placement = db.Column(db.String(100), nullable=True)  # e.g., "1st", "Top 8"
    role_in_tournament = db.Column(db.String(120), nullable=True)  # e.g., "Entry", "IGL"
    notes = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            "name": self.name,
            "organizer": self.organizer,
            "year": self.year,
            "placement": self.placement,
            "role_in_tournament": self.role_in_tournament,
            "notes": self.notes,
        }


# -----------------------
# Main Valorant profile
# -----------------------
class ValorantProfile(db.Model):
    __tablename__ = "valorant_profile"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id", ondelete="CASCADE"), unique=True, nullable=False)
    # Relationship to User for search / display
    user = db.relationship(
        "User",
        backref=db.backref("valorant_profile", uselist=False)
    )


    # ---------------------
    # Identity (required)
    # ---------------------
    player_name = db.Column(db.String(120), nullable=False)  # display name in profile
    riot_id = db.Column(db.String(80), nullable=False)       # name part before #
    tagline = db.Column(db.String(20), nullable=False)       # the #tag part 

    # ---------------------
    # Region + server (required)
    # ---------------------
    region = db.Column(db.Enum(RegionEnum, values_callable=lambda x: [e.value for e in x]), nullable=False)
    server = db.Column(db.Enum(ServerEnum, values_callable=lambda x: [e.value for e in x]), nullable=False)

    # ---------------------
    # When the user started playing (required)
    # ---------------------
    started_playing = db.Column(db.Date, nullable=False)

    # ---------------------
    # Rank information (required fields for current rank + act)
    # ---------------------
    current_rank = db.Column(db.Enum(RankEnum, values_callable=lambda x: [e.value for e in x]), nullable=False)
    current_season = db.Column(db.Enum(SeasonEnum, values_callable=lambda x: [e.value for e in x]), nullable=False)         # EP01..EP09 or V24..V25
    current_act_number = db.Column(db.Integer, nullable=False)  # ACT1..ACT6

    # Peak rank info (peak rank + related act fields) — peak_rank may be nullable if not supplied
    peak_rank = db.Column(db.Enum(RankEnum, values_callable=lambda x: [e.value for e in x]), nullable=True)
    peak_season = db.Column(db.Enum(SeasonEnum, values_callable=lambda x: [e.value for e in x]), nullable=True)
    peak_act_number = db.Column(db.Integer, nullable=True)
    peak_rank_date = db.Column(db.Date, nullable=True)

    # ---------------------
    # Core statistics (required)
    # ---------------------
    kd = db.Column(db.Float, nullable=False)
    win_rate = db.Column(db.Float, nullable=False)
    total_matches = db.Column(db.Integer, nullable=False)
    hours_played = db.Column(db.Float, nullable=False)

    # ---------------------
    # Playstyle & role (required)
    # ---------------------
    main_role = db.Column(db.Enum(RoleEnum, values_callable=lambda x: [e.value for e in x]), nullable=False)
    playstyle_description = db.Column(db.String(300), nullable=False)

    # Playstyle ratings (0-10 scale)
    aggressiveness = db.Column(db.Integer, nullable=False, default=5)
    utility_usage = db.Column(db.Integer, nullable=False, default=5)
    anchoring_skill = db.Column(db.Integer, nullable=False, default=5)
    lurking_skill = db.Column(db.Integer, nullable=False, default=5)
    entry_confidence = db.Column(db.Integer, nullable=False, default=5)

    # ---------------------
    # Agents (required: best_agent + top_agents minimal)
    # ---------------------
    best_agent = db.Column(db.Enum(AgentEnum, values_callable=lambda x: [e.value for e in x]), nullable=False)
    # top_agents stored as JSON list of strings; validate length (1..5) in schema layer
    top_agents = db.Column(db.JSON, nullable=False, default=list)

    # ---------------------
    # Team & pro history (optional)
    # ---------------------
    in_team = db.Column(db.Boolean, default=False, nullable=False)
    current_team = db.Column(db.String(150), nullable=True)
    role_in_team = db.Column(db.String(120), nullable=True)
    been_in_team_before = db.Column(db.Boolean, default=False, nullable=False)

    # Relationship to TeamHistory table (list)
    team_history = db.relationship("TeamHistory", backref="valorant_profile", cascade="all, delete-orphan", lazy="select")

    # ---------------------
    # Tournament history (optional) - separate table
    # ---------------------
    tournaments = db.relationship("TournamentHistory", backref="valorant_profile", cascade="all, delete-orphan", lazy="select")

    # ---------------------
    # Media
    # ---------------------
    media_clips = db.Column(db.JSON, nullable=True, default=list)  # list of clip URLs

    # ---------------------
    # Misc & display
    # ---------------------
    banner_url = db.Column(db.String(300), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    is_public = db.Column(db.Boolean, default=False, nullable=False)
    visibility_settings = db.Column(db.JSON, nullable=True, default=dict)

    # ---------------------
    # Sync & timestamps
    # ---------------------
    last_synced = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        db.UniqueConstraint("user_id", name="uq_valo_user"),
    )

    # ---------------------
    # Convenience properties & serializers
    # ---------------------
    @property
    def full_riot_id(self) -> str:
        return f"{self.riot_id}#{self.tagline}"

    def to_dict(self) -> dict:
        """
        Return JSON-serializable representation used by APIs.
        Keep this stable; adjust fields as frontend needs evolve.
        """
        return {
            "id": self.id,
            "user_id": self.user_id,
            "player_name": self.player_name,
            "riot_id": self.riot_id,
            "tagline": self.tagline,
            "full_riot_id": self.full_riot_id,
            "region": self.region.value if self.region else None,
            "server": self.server.value if self.server else None,
            "started_playing": self.started_playing.isoformat() if self.started_playing else None,
            "current_rank": self.current_rank.value if self.current_rank else None,
            "current_act": {
                "season": self.current_season.value if self.current_season else None,
                "act_number": self.current_act_number if self.current_act_number else None,
            },
            "peak_rank": self.peak_rank.value if self.peak_rank else None,
            "peak_act": {
                "season": self.peak_season.value if self.peak_season else None,
                "act_number": self.peak_act_number if self.peak_act_number else None,
                "date": self.peak_rank_date.isoformat() if self.peak_rank_date else None,
            },
            "kd": self.kd,
            "win_rate": self.win_rate,
            "total_matches": self.total_matches,
            "hours_played": self.hours_played,
            "main_role": self.main_role.value if self.main_role else None,
            "playstyle_description": self.playstyle_description,
            "aggressiveness": self.aggressiveness,
            "utility_usage": self.utility_usage,
            "anchoring_skill": self.anchoring_skill,
            "lurking_skill": self.lurking_skill,
            "entry_confidence": self.entry_confidence,
            "best_agent": self.best_agent.value if self.best_agent else None,
            "top_agents": self.top_agents or [],
            "in_team": self.in_team,
            "current_team": self.current_team,
            "role_in_team": self.role_in_team,
            "been_in_team_before": self.been_in_team_before,
            "team_history": [t.to_dict() for t in self.team_history],
            "tournaments": [t.to_dict() for t in self.tournaments],
            "media_clips": self.media_clips or [],
            "banner_url": self.banner_url,
            "bio": self.bio,
            "notes": self.notes,
            "is_public": self.is_public,
            "visibility_settings": self.visibility_settings or {},
            "last_synced": self.last_synced.isoformat() if self.last_synced else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }