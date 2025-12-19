import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { valorantAPI } from "@/services/api";
import "@/styles/valorant/valorantprofile.css";
import type { ValorantProfileData } from "@/services/api";

/* ================= TYPES ================= */

// interface ActInfo {
//   season: string;
//   act_number: number;
//   date?: string;
// }

// interface TeamHistoryItem {
//   team_name: string;
//   joined_at: string;
//   left_at: string | null;
//   website: string | null;
// }

// interface TournamentItem {
//   name: string;
//   organizer: string | null;
//   year: number;
//   placement: string | null;
//   role_in_tournament: string | null;
//   notes: string | null;
// }

// interface ValorantProfile {
//   id: number;
//   user_id: number;

//   player_name: string;
//   riot_id?: string;
//   tagline?: string;
//   full_riot_id: string;

//   region: string;
//   server: string;

//   started_playing: string;
//   created_at?: string;
//   updated_at?: string;
//   last_synced: string | null;

//   current_rank: string;
//   current_act: ActInfo;

//   peak_rank: string;
//   peak_act: ActInfo;

//   kd: number;
//   win_rate: number;
//   total_matches: number;
//   hours_played: number;

//   main_role: string;
//   playstyle_description: string;
//   aggressiveness: number;
//   utility_usage: number;
//   entry_confidence: number;
//   lurking_skill: number;
//   anchoring_skill: number;

//   best_agent: string;
//   top_agents: string[];

//   in_team: boolean;
//   current_team: string | null;
//   role_in_team: string | null;
//   team_history: TeamHistoryItem[];

//   tournaments: TournamentItem[];
//   media_clips: string[];
//   bio: string | null;

//   is_public: boolean;
// }

/* ================= COMPONENT ================= */

const ValorantProfilePage = () => {
  const { username } = useParams<{ username?: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<ValorantProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  const redirectedRef = useRef(false);

  /* ================= LOAD PROFILE ================= */

  useEffect(() => {
    // ⛔ WAIT for auth hydration on refresh
    if (authLoading) return;

    const load = async () => {
      try {
        setLoading(true);

        /* =======================
           CASE 1: /me
        ======================= */
        if (!username) {
          if (!user) {
            navigate("/login", { replace: true });
            return;
          }

          const res = await valorantAPI.getMyProfile();

          if (!res.exists || !res.data) {
            setProfile(null);
            setIsOwner(true);
          } else {
            setProfile(res.data);
            setIsOwner(true);
          }
          return;
        }

        /* =======================
           CASE 2: /username === me
           Redirect ONCE
        ======================= */
        if (
          user &&
          username.toLowerCase() === user.user_name.toLowerCase() &&
          !redirectedRef.current
        ) {
          redirectedRef.current = true;
          navigate("/players/valorant/me", { replace: true });
          return;
        }

        /* =======================
           CASE 3: Public profile
        ======================= */
        const publicProfile = await valorantAPI.getPublicProfile(username!);
        setProfile(publicProfile);
        setIsOwner(false);

      } catch (err) {
        console.error("Valorant profile load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [username, user, authLoading, navigate]);

  /* ================= RENDER GUARDS ================= */

  // ⛔ Block render until auth is ready
  if (authLoading || loading) {
    return <div className="profile-loading">Loading profile…</div>;
  }

  if (!profile && isOwner) {
    return (
      <div className="valo-empty-profile">
        <h2>No Valorant Profile Found</h2>
        <p>You haven’t created your Valorant portfolio yet.</p>
        <button
          className="valo-create-btn"
          onClick={() => navigate("/players/valorant/create")}
        >
          ➕ Create Valorant Profile
        </button>
      </div>
    );
  }

  if (!profile) return null;

  /* ================= MAIN VIEW ================= */

  return (
    <div className="valo-profile-page">

      {/* HEADER */}
      <section className="valo-header">
        <h1 className="valo-player-name">{profile.player_name}</h1>
        <p className="valo-riot-id">{profile.full_riot_id}</p>
        <p className="valo-region">
          {profile.region} • {profile.server}
        </p>
{/* 
        <p className="valo-muted">
          Playing since{" "}
          {new Date(profile.started_playing).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
          })}
        </p> */}

        {isOwner && (
          <div className="valo-owner-actions">
            <button
              className="valo-btn"
              onClick={() => navigate("/players/valorant/me/edit")}
            >
              ✏️ Edit Profile
            </button>
          </div>
        )}
      </section>

      {/* RANK */}
      <section className="valo-card">
        <h2>🏆 Rank</h2>

        <div className="valo-rank-grid">
          <div>
            <h4>Current</h4>
            <p className="rank">{profile.current_rank}</p>
            {/* <span>
              {profile.current_act.season} • Act {profile.current_act.act_number}
            </span> */}
          </div>

          {/* <div>
            <h4>Peak</h4>
            <p className="rank">{profile.peak_rank}</p>
            <span>
              {profile.peak_act.season} • Act {profile.peak_act.act_number}
            </span>
            {profile.peak_act.date && (
              <small className="valo-muted">
                Achieved on{" "}
                {new Date(profile.peak_act.date).toLocaleDateString()}
              </small>
            )}
          </div> */}

        </div>
      </section>

      {/* PERFORMANCE */}
      <section className="valo-card">
        <h2>📊 Performance</h2>

        <div className="valo-stats-grid">
          <div><strong>K/D</strong><span>{profile.kd}</span></div>
          <div><strong>Win Rate</strong><span>{profile.win_rate}%</span></div>
          <div><strong>Matches</strong><span>{profile.total_matches}</span></div>
          <div><strong>Hours</strong><span>{profile.hours_played}</span></div>
        </div>
{/* 
        {profile.last_synced && (
          <p className="valo-muted">
            Last synced: {new Date(profile.last_synced).toLocaleString()}
          </p>
        )} */}
      </section>

      {/* PLAYSTYLE */}
      <section className="valo-card">
        <h2>🎮 Playstyle</h2>
        <p className="valo-role">{profile.main_role}</p>
        {/* <p className="valo-description">{profile.playstyle_description}</p> */}

        {/* <div className="valo-playstyle-grid">
          <div>Aggression <span>{profile.aggressiveness}/10</span></div>
          <div>Entry <span>{profile.entry_confidence}/10</span></div>
          <div>Utility <span>{profile.utility_usage}/10</span></div>
          <div>Lurking <span>{profile.lurking_skill}/10</span></div>
          <div>Anchoring <span>{profile.anchoring_skill}/10</span></div>
        </div> */}
      </section>

      {/* AGENTS */}
      <section className="valo-card">
        <h2>🧬 Agents</h2>
        <p>Best Agent: <strong>{profile.best_agent}</strong></p>
        <div className="valo-agent-list">
          {profile.top_agents.map(a => (
            <span key={a} className="valo-agent-chip">{a}</span>
          ))}
        </div>
      </section>

      {/* MEDIA */}

      {/* {profile.media_clips.length > 0 && (
        <section className="valo-card">
          <h2>🎬 Media</h2>
          <div className="valo-media-grid">
            {profile.media_clips.map((url, i) => (
              <video key={i} src={url} controls className="valo-media-video" />
            ))}
          </div>
        </section>
      )} */}

      {/* TEAM HISTORY */}
      {/* {profile.team_history.length > 0 && (
        <section className="valo-card">
          <h2>👥 Team History</h2>
          {profile.team_history.map((team, i) => (
            <div key={i} className="valo-team-item">
              <h4>{team.team_name}</h4>
              <p>
                {new Date(team.joined_at).toLocaleDateString()} —{" "}
                {team.left_at
                  ? new Date(team.left_at).toLocaleDateString()
                  : "Present"}
              </p>
              {team.website && (
                <a href={team.website} target="_blank" rel="noreferrer">
                  Team Website
                </a>
              )}
            </div>
          ))}
        </section>
      )} */}

      {/* TOURNAMENTS */}
      {/* {profile.tournaments.length > 0 && (
        <section className="valo-card">
          <h2>🏆 Tournaments</h2>
          {profile.tournaments.map((t, i) => (
            <div key={i} className="valo-tournament-item">
              <h4>{t.name}</h4>
              <p>{t.year} • {t.organizer}</p>
              {t.placement && <p>Placement: {t.placement}</p>}
              {t.role_in_tournament && <p>Role: {t.role_in_tournament}</p>}
            </div>
          ))}
        </section>
      )} */}

      {/* ABOUT */}
      {/* {profile.bio && (
        <section className="valo-card">
          <h2>📝 About</h2>
          <p>{profile.bio}</p>
        </section>
      )} */}

    </div>
  );
};

export default ValorantProfilePage;
