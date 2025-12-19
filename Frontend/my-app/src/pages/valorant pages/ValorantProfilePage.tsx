import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { valorantAPI } from "@/services/api";
import MusicToggle from "@/components/ui/valorant/MusicToggle";
import "@/styles/valorant/valorantprofile.css";

/* ================= TYPES ================= */

interface ActInfo {
  season: string;
  act_number: number;
  date?: string;
}

interface TeamHistoryItem {
  team_name: string;
  joined_at: string;
  left_at: string | null;
  website: string | null;
}

interface TournamentItem {
  name: string;
  organizer: string | null;
  year: number;
  placement: string | null;
  role_in_tournament: string | null;
  notes: string | null;
}

interface ValorantProfile {
  player_name: string;
  full_riot_id: string;
  region: string;
  server: string;
  started_playing: string;
  current_rank: string;
  current_act: ActInfo;
  peak_rank: string;
  peak_act: ActInfo;
  kd: number;
  win_rate: number;
  total_matches: number;
  hours_played: number;
  main_role: string;
  playstyle_description: string;
  aggressiveness: number;
  utility_usage: number;
  entry_confidence: number;
  lurking_skill: number;
  anchoring_skill: number;
  best_agent: string;
  top_agents: string[];
  team_history: TeamHistoryItem[];
  tournaments: TournamentItem[];
  media_clips: string[];
  bio: string | null;
}

/* ================= IMAGE MAPS ================= */

const RANK_IMAGE_MAP: Record<string, string> = {
  "Iron 1": "/Valorant/ValoRanksPNGs/Iron_1_Rank.png",
  "Iron 2": "/Valorant/ValoRanksPNGs/Iron_2_Rank.png",
  "Iron 3": "/Valorant/ValoRanksPNGs/Iron_3_Rank.png",
  "Bronze 1": "/Valorant/ValoRanksPNGs/Bronze_1_Rank.png",
  "Bronze 2": "/Valorant/ValoRanksPNGs/Bronze_2_Rank.png",
  "Bronze 3": "/Valorant/ValoRanksPNGs/Bronze_3_Rank.png",
  "Silver 1": "/Valorant/ValoRanksPNGs/Silver_1_Rank.png",
  "Silver 2": "/Valorant/ValoRanksPNGs/Silver_2_Rank.png",
  "Silver 3": "/Valorant/ValoRanksPNGs/Silver_3_Rank.png",
  "Gold 1": "/Valorant/ValoRanksPNGs/Gold_1_Rank.png",
  "Gold 2": "/Valorant/ValoRanksPNGs/Gold_2_Rank.png",
  "Gold 3": "/Valorant/ValoRanksPNGs/Gold_3_Rank.png",
  "Platinum 1": "/Valorant/ValoRanksPNGs/Platinum_1_Rank.png",
  "Platinum 2": "/Valorant/ValoRanksPNGs/Platinum_2_Rank.png",
  "Platinum 3": "/Valorant/ValoRanksPNGs/Platinum_3_Rank.png",
  "Diamond 1": "/Valorant/ValoRanksPNGs/Diamond_1_Rank.png",
  "Diamond 2": "/Valorant/ValoRanksPNGs/Diamond_2_Rank.png",
  "Diamond 3": "/Valorant/ValoRanksPNGs/Diamond_3_Rank.png",
  "Ascendant 1": "/Valorant/ValoRanksPNGs/Ascendant_1_Rank.png",
  "Ascendant 2": "/Valorant/ValoRanksPNGs/Ascendant_2_Rank.png",
  "Ascendant 3": "/Valorant/ValoRanksPNGs/Ascendant_3_Rank.png",
  "Immortal 1": "/Valorant/ValoRanksPNGs/Immortal_1_Rank.png",
  "Immortal 2": "/Valorant/ValoRanksPNGs/Immortal_2_Rank.png",
  "Immortal 3": "/Valorant/ValoRanksPNGs/Immortal_3_Rank.png",
  "Radiant": "/Valorant/ValoRanksPNGs/Radiant_Rank.png",
};

const AGENT_IMAGE_MAP: Record<string, string> = {
  Astra: "/Valorant/Agent/Astra.png",
  Breach: "/Valorant/Agent/Breach.png",
  Brimstone: "/Valorant/Agent/Brimstone.png",
  Chamber: "/Valorant/Agent/Chamber.png",
  Clove: "/Valorant/Agent/Clove.png",
  Cypher: "/Valorant/Agent/Cypher.png",
  Deadlock: "/Valorant/Agent/Deadlock.png",
  Fade: "/Valorant/Agent/Fade.png",
  Gekko: "/Valorant/Agent/Gekko.png",
  Harbor: "/Valorant/Agent/Harbor.png",
  Iso: "/Valorant/Agent/iso.png",
  Jett: "/Valorant/Agent/Jett.png",
  "KAY/O": "/Valorant/Agent/kayo.png",
  Killjoy: "/Valorant/Agent/Killjoy.png",
  Neon: "/Valorant/Agent/Neon.png",
  Omen: "/Valorant/Agent/Omen.png",
  Phoenix: "/Valorant/Agent/Phoenix.png",
  Raze: "/Valorant/Agent/Raze.png",
  Reyna: "/Valorant/Agent/Reyna.png",
  Sage: "/Valorant/Agent/Sage.png",
  Skye: "/Valorant/Agent/Skye.png",
  Sova: "/Valorant/Agent/Sova.png",
  Tejo: "/Valorant/Agent/Tejo.png",
  Veto: "/Valorant/Agent/Veto.png",
  Viper: "/Valorant/Agent/Viper.png",
  Waylay: "/Valorant/Agent/Waylay.png",
  Yoru: "/Valorant/Agent/Yoru.png",
};

const ROLE_IMAGE_MAP: Record<string, string> = {
  Controller: "/Valorant/roleLogo/Controller.png",
  Duelist: "/Valorant/roleLogo/Duelist.png",
  Sentinel: "/Valorant/roleLogo/Sentinel.png",
  Initiator: "/Valorant/roleLogo/Initiator.png",
};

const normalizeRank = (rank: string) =>
  rank.replace("_", " ").replace(/\s+/g, " ").trim();

/* ================= COMPONENT ================= */

const ValorantProfilePage = () => {
  const { username } = useParams<{ username?: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<ValorantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"not_found" | "unauthorized" | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const redirectedRef = useRef(false);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Case 1: /players/valorant/me - Own profile (authenticated)
        if (!username) {
          if (!user) {
            // Not logged in, redirect to login
            navigate('/login');
            return;
          }
          const res = await valorantAPI.getMyProfile();
          setProfile(res.data);
          setIsOwner(true);
          return;
        }

        // Case 2: Logged-in user viewing their own username URL
        if (user && username.toLowerCase() === user.user_name.toLowerCase()) {
          if (!redirectedRef.current) {
            redirectedRef.current = true;
            navigate("/players/valorant/me", { replace: true });
            return;
          }
        }

        // Case 3: Public profile (viewing someone else's profile)
        const data = await valorantAPI.getPublicProfile(username);
        setProfile(data);

        // Check if viewer is the owner (shouldn't happen due to redirect, but safety check)
        setIsOwner(user ? username.toLowerCase() === user.user_name.toLowerCase() : false);

      } catch (err: any) {
        console.error('Error loading profile:', err);
        if (err?.response?.status === 404) {
          setError("not_found");
        } else if (err?.response?.status === 403) {
          setError("unauthorized");
        } else {
          setError("not_found");
        }
        setProfile(null);
        setIsOwner(false);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username, user, authLoading, navigate]);

  /* ================= UI STATES ================= */

  if (authLoading || loading) {
    return <div className="valo-loading">Loading profile…</div>;
  }

  if (error === "not_found") {
    return (
      <div className="valo-loading">
        <p>Profile not found</p>
        <button onClick={() => navigate('/players/valorant')}>← Back to Search</button>
      </div>
    );
  }

  if (error === "unauthorized") {
    return (
      <div className="valo-loading">
        <p>This profile is private</p>
        <button onClick={() => navigate('/players/valorant')}>← Back to Search</button>
      </div>
    );
  }

  if (!profile) {
    return <div className="valo-loading">Something went wrong</div>;
  }

  /* ================= PAGE ================= */

  return (
    <div className="valo-page">
      <MusicToggle />

      {/* HERO */}
      <section className="valo-hero">
        <video className="valo-bg-video" autoPlay muted loop playsInline>
          <source src="/Valorant/background.mp4" type="video/mp4" />
        </video>

        <div className="valo-hero-content">
          <h1 className="valo-name">{profile.player_name}</h1>
          <h2 className="valo-riot">{profile.full_riot_id}</h2>
          <p className="valo-meta">
            {profile.region} • {profile.server}
          </p>
          <p className="valo-since">
            Playing since{" "}
            {new Date(profile.started_playing).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
            })}
          </p>
        </div>

 {/* 🔒 ONLY show edit button if user is the owner */}
        {isOwner && (
          <button
            className="valo-edit-btn"
            onClick={() => navigate("/players/valorant/me/edit")}
          >
            ✏️ Edit Profile
          </button>
        )}
      </section>

      {/* RANKS */}
      <section className="valo-section two-col">
        <div className="valo-card valo-rank-card">
          <h3>Current Rank</h3>
          <img
            className="valo-rank-icon"
            src={RANK_IMAGE_MAP[normalizeRank(profile.current_rank)]}
            alt={profile.current_rank}
          />
          <p className="valo-rank">{profile.current_rank}</p>
          <span>
            {profile.current_act.season} • Act {profile.current_act.act_number}
          </span>
        </div>

        <div className="valo-card valo-rank-card muted">
          <h3>Peak Rank</h3>
          <img
            className="valo-rank-icon"
            src={RANK_IMAGE_MAP[normalizeRank(profile.peak_rank)]}
            alt={profile.peak_rank}
          />
          <p className="valo-rank">{profile.peak_rank}</p>
          <span>
            {profile.peak_act.season} • Act {profile.peak_act.act_number}
          </span>
        </div>
      </section>

      {/* AGENT + PERFORMANCE */}
      <section className="valo-section">
        <div className="valo-card agent-showcase">
          <div className="agent-hero">
            <h3>Best Agent</h3>
            <h2>{profile.best_agent}</h2>
            <img
              src={AGENT_IMAGE_MAP[profile.best_agent]}
              alt={profile.best_agent}
              className="agent-image"
            />
          </div>

          <div className="agent-performance">
            <div className="favourite-role">
              <span>Favourite Role</span>
              <div className="role-inline">
                <img
                  src={ROLE_IMAGE_MAP[profile.main_role]}
                  alt={profile.main_role}
                />
                <strong>{profile.main_role}</strong>
              </div>
            </div>

            <div className="stats-pie-grid">
              <div className="stats-top">
                <div className="stat-item">
                  <span className="stat-label">K/D:</span>
                  <span className="stat-value">{profile.kd}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Win Rate:</span>
                  <span className="stat-value">{profile.win_rate}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Matches:</span>
                  <span className="stat-value">{profile.total_matches}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Hours:</span>
                  <span className="stat-value">{profile.hours_played}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="valo-section">
          <h2 className="section-title">Top 5 Agents</h2>
          <div className="top-agents">
            {profile.top_agents.map((agent) => (
              <div key={agent} className="agent-mini-card">
                <img src={AGENT_IMAGE_MAP[agent]} alt={agent} />
                <span>{agent}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="playstyle-wrapper">
          <div className="valo-card">
            <h3>Playstyle</h3>
            <p className="playstyle-text">{profile.playstyle_description}</p>
          </div>
          <div className="skill-bars">
            {[
              ["Aggression", profile.aggressiveness],
              ["Entry", profile.entry_confidence],
              ["Utility", profile.utility_usage],
              ["Lurking", profile.lurking_skill],
              ["Anchoring", profile.anchoring_skill],
            ].map(([label, value]) => (
              <div key={label} className="skill-bar">
                <span>{label}</span>
                <div className="bar">
                  <div style={{ width: `${Number(value) * 10}%` }} />
                </div>
                <strong>{value}/10</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MEDIA */}
      {/* ================= HIGHLIGHTS ================= */}
      {profile.media_clips && profile.media_clips.length > 0 && (
        <section className="valo-section valo-highlights">
          <h2 className="section-title">Highlights</h2>

          <div className="media-grid">
            {profile.media_clips.map((url, i) => (
              <div key={i} className="valo-video-card">
                <video
                  src={url}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="valo-highlight-video"
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => {
                    e.currentTarget.pause();
                    e.currentTarget.currentTime = 0;
                  }}
                  onClick={() => setActiveVideo(url)}
                />
              </div>
            ))}
          </div>
        </section>
      )}


      {/* CAREER */}
      {(profile.team_history.length > 0 || profile.tournaments.length > 0) && (
        <section className="valo-section">
          <h2 className="section-title">Career & Achievements</h2>
          <div className="career-grid">
            <div className="career-column">
              <h3>Teams</h3>
              <div className="career-scroll">
                {profile.team_history.map((t, i) => (
  <div key={i} className="valo-card compact valo-team-card">
    <div className="valo-team-header">
      <h4 className="valo-team-name">{t.team_name}</h4>
      <span className="valo-team-date">
        {new Date(t.joined_at).toLocaleDateString()} –{" "}
        {t.left_at ? new Date(t.left_at).toLocaleDateString() : "Present"}
      </span>
    </div>

    {t.website && (
      <a
        href={t.website}
        target="_blank"
        rel="noreferrer"
        className="valo-team-link"
      >
        Team Website
      </a>
    )}
  </div>
))}

              </div>
            </div>

            <div className="career-column">
              <h3>Tournaments</h3>
              <div className="career-scroll">
                {profile.tournaments.map((t, i) => (
  <div key={i} className="valo-card compact valo-tournament-card">
    <div className="valo-tournament-header">
      <h4 className="valo-tournament-name">{t.name}</h4>
      {t.placement && (
        <span className="valo-tournament-placement">
          {t.placement}
        </span>
      )}
    </div>

    <div className="valo-tournament-meta">
      <span className="valo-tournament-year">{t.year}</span>
      {t.role_in_tournament && (
        <span className="valo-tournament-role">
          {t.role_in_tournament}
        </span>
      )}
    </div>
  </div>
))}

              </div>
            </div>
          </div>
        </section>
      )} 

      {/* BIO */}
      {profile.bio && (
        <section className="valo-section">
          <div className="valo-card bio">
            <h2>About</h2>
            <p>{profile.bio}</p>
          </div>
        </section>
      )}
      {/* ================= VIDEO MODAL ================= */}
      {activeVideo && (
        <div className="valo-video-modal" onClick={() => setActiveVideo(null)}>
          <video
            src={activeVideo}
            autoPlay
            controls
            className="valo-video-expanded"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default ValorantProfilePage;