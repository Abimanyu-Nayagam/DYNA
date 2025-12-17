import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaUser, FaCalendar } from "react-icons/fa";
import "../styles/profile.css";
import { useAuth } from "@/contexts/AuthContext";
import { pubgAPI, csgoAPI, leagueAPI, valorantAPI } from "../services/api";
import api from "../services/api";

/* ================= TYPES ================= */

interface UserData {
  user_id: number;
  user_name: string;
  email: string;
  created_at: string | null;
  updated_at: string | null;
}

/* ================= COMPONENT ================= */

const Profile = () => {
  const { user, logout } = useAuth();
  const user_name = user?.user_name;

  const navigate = useNavigate();

  const [heroImage, setHeroImage] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [availableGames, setAvailableGames] = useState<string[]>([]);
  const [pubg_user, setPubgUser] = useState("");
  const [csgo_user, setCsgoUser] = useState("");
  const [valo_user, setValoUser] = useState("");
  const [lol_user, setLolUser] = useState("");

  /* ================= GAME CONFIG ================= */

  const games = [
    {
      title: "PUBG",
      image: "/pubgcard.png",
      viewRoute: pubg_user ? `/players/${pubg_user}/pubg` : null,
      createRoute: "/players/pubg/create",
    },
    {
      title: "CSGO",
      image: "/csgocard.png",
      viewRoute: csgo_user ? `/players/${csgo_user}/csgo` : null,
      createRoute: "/players/csgo/create",
    },
    {
      title: "VALORANT",
      image: "/valocard.png",
      viewRoute: valo_user ? `/players/valorant/me` : null,
      createRoute: valo_user
        ? "/players/valorant/me/edit"
        : "/players/valorant/create",
    },
    {
      title: "LEAGUE OF LEGENDS",
      image: "/lolcard.png",
      viewRoute: lol_user ? `/players/${lol_user}/lol` : null,
      createRoute: "/players/lol/create",
    },
  ];

  /* ================= EFFECTS ================= */

  useEffect(() => {
    setHeroImage("/main-port-bg.png");
    fetchUserData();
  }, []);

  /* ================= DATA LOAD ================= */

  const fetchUserData = async () => {
    if (!user_name) return;

    try {
      setIsLoading(true);

      const response = await api.get("/players");
      const users = response.data?.data ?? response.data ?? [];

      const matchedUser = users.find(
        (u: UserData) =>
          u.user_name.toLowerCase() === user_name.toLowerCase()
      );

      if (!matchedUser) throw new Error("User not found");

      setUserData(matchedUser);
      await checkAvailableGames(matchedUser.user_id);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= GAME CHECK ================= */

  const checkAvailableGames = async (userId: number) => {
    const available: string[] = [];

    // PUBG
    try {
      const res = await pubgAPI.getStatsByUser(userId);
      setPubgUser(res.username);
      available.push("PUBG");
    } catch {
      console.error("Error fetching PUBG data:", error);
    }

    // CSGO
    try {
      const res = await csgoAPI.getStatsByUser(userId);
      setCsgoUser(res.username);
      available.push("CSGO");
    } catch {
      console.error("Error fetching CS GO data:", error);
    }

      // LOL Check
    try {
      console.log(userId)
      const res = await leagueAPI.getIgnByUserId(userId);
      setLolUser(res.ign);
      available.push("LEAGUE OF LEGENDS");
    } catch {
      console.error("Error fetching League of Legends data:", error);
    }

    // VALORANT (REAL EXISTENCE CHECK)
    try {
      const res = await valorantAPI.getMyProfile();
      if (res?.exists) {
        setValoUser(user_name || "");
        available.push("VALORANT");
      } else {
        setValoUser("");
      }
    } catch {
      setValoUser("");
    }

    // LOL placeholder (future teammate work)
    // setLolUser(user_name || "");

    setAvailableGames(available);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  /* ================= STATES ================= */

  if (isLoading) {
    return <div className="main-portfolio-loading">Loading...</div>;
  }

  if (error || !userData) {
    return (
      <div className="main-portfolio-error">
        <h2>{error || "User not found"}</h2>
        <Link to="/players" className="back-link">
          ← Back to Players
        </Link>
      </div>
    );
  }

  /* ================= RENDER ================= */

  return (
    <div className="main-portfolio">
      <div
        className="main-hero-section"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="main-hero-overlay" />
        <div className="main-hero-content">
          <div className="user-info-container">
            <div className="user-avatar">
              <FaUser />
            </div>

            <h1 className="user-name">{userData.user_name}</h1>

            <div className="user-details">
              <div className="detail-item">
                <FaEnvelope className="detail-icon" />
                <div className="detail-text">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{userData.email}</span>
                </div>
              </div>

              <div className="detail-item">
                <FaCalendar className="detail-icon" />
                <div className="detail-text">
                  <span className="detail-label">Member Since</span>
                  <span className="detail-value">
                    {formatDate(userData.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="logout-wrapper">
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="logout-btn"
        >
          LOGOUT
        </button>
      </div>

      <div className="main-games-section">
        <h2 className="section-title">Game Portfolios</h2>

        <div className="main-portfolio-games-grid">
          {games.map((game, index) => {
            const isAvailable = availableGames.includes(game.title);

            return (
              <div key={index} className="game-card-wrapper">
                {isAvailable && game.viewRoute ? (
                  <Link to={game.viewRoute} className="game-card-link">
                    <div className="main-portfolio-game-card">
                      <div className="game-card-image-container">
                        <img
                          src={game.image}
                          alt={game.title}
                          className="game-card-image"
                        />
                        <div className="game-card-overlay" />
                      </div>

                      <div className="game-card-content">
                        <h3 className="main-portfolio-game-title">
                          {game.title}
                        </h3>
                        <div className="view-portfolio-btn">
                          View Portfolio →
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="main-portfolio-game-card disabled">
                    <div className="game-card-image-container">
                      <img
                        src={game.image}
                        alt={game.title}
                        className="game-card-image"
                      />
                      <div className="game-card-overlay" />
                    </div>

                    <div className="game-card-content">
                      <h3 className="main-portfolio-game-title">
                        {game.title}
                      </h3>
                    </div>
                  </div>
                )}

                <div className="align-center mt-20">
                  <button
                    className="profile-portfolio-btn"
                    onClick={() => navigate(game.createRoute)}
                  >
                    {isAvailable ? "Update Portfolio" : "Create Portfolio"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Profile;
