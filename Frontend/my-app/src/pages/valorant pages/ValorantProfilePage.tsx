import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { valorantAPI } from "@/services/api";
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
  id: number;
  user_id: number;

  player_name: string;
  full_riot_id: string;
  region: string;
  server: string;

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

  in_team: boolean;
  current_team: string | null;
  role_in_team: string | null;
  team_history: TeamHistoryItem[];

  tournaments: TournamentItem[];
  media_clips: string[];
  bio: string | null;

  is_public: boolean;
}

/* ================= COMPONENT ================= */

const ValorantProfilePage = () => {
  const { username } = useParams<{ username?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState<ValorantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  // prevents redirect loops
  const redirectedRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        /* =======================
           CASE 1: /me route
        ======================= */
        if (!username) {
          if (!user) {
            navigate("/login");
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
           CASE 2: /:username
           If it's ME → redirect ONCE
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
        const publicProfile = await valorantAPI.getPublicProfile(username);
        setProfile(publicProfile);
        setIsOwner(false);

      } catch (err) {
        console.error("Valorant profile load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [username, user, navigate]);

  /* ================= RENDER STATES ================= */

  if (loading) {
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
        <h1>{profile.player_name}</h1>
        <p>{profile.full_riot_id}</p>
        <p>{profile.region} • {profile.server}</p>

        {isOwner && (
          <div className="valo-owner-actions">
            <button>Edit</button>
            <button>Delete</button>
            <label>
              <input type="checkbox" checked={profile.is_public} readOnly />
              Public
            </label>
          </div>
        )}
      </section>

      {/* RANK */}
      <section className="valo-card">
        <h2>Rank</h2>
        <p>{profile.current_rank}</p>
        <span>
          {profile.current_act.season} • Act {profile.current_act.act_number}
        </span>
      </section>

      {/* STATS */}
      <section className="valo-card">
        <h2>Performance</h2>
        <div>K/D: {profile.kd}</div>
        <div>Win Rate: {profile.win_rate}%</div>
        <div>Matches: {profile.total_matches}</div>
        <div>Hours: {profile.hours_played}</div>
      </section>

      {/* AGENTS */}
      <section className="valo-card">
        <h2>Agents</h2>
        <strong>{profile.best_agent}</strong>
        <div>
          {profile.top_agents.map(a => (
            <span key={a}>{a}</span>
          ))}
        </div>
      </section>

      {/* BIO */}
      {profile.bio && (
        <section className="valo-card">
          <h2>About</h2>
          <p>{profile.bio}</p>
        </section>
      )}

    </div>
  );
};

export default ValorantProfilePage;
