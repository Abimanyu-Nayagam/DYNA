import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaEnvelope, FaUser, FaCalendar } from "react-icons/fa";
import { pubgAPI, csgoAPI, leagueAPI } from "../services/api";
import { useAuth } from "@/contexts/AuthContext";
import "../styles/mainportfolio.css";

/* ================= TYPES ================= */

interface UserData {
  user_id: number;
  user_name: string;
  email: string;
  created_at: string | null;
  updated_at: string | null;
}

/* ================= COMPONENT ================= */

const MainPortfolio = () => {
  const { username: rawUsername } = useParams<{ username: string }>();
  const username = rawUsername ?? "";
  const { user } = useAuth();

  const [heroImage, setHeroImage] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [availableGames, setAvailableGames] = useState<string[]>([]);
  const [pubg_user, setPubgUser] = useState("");
  const [csgo_user, setCsgoUser] = useState("");
  const [valo_user, setValoUser] = useState("");

  /* ================= GAME CONFIG ================= */

  const games = [
    {
      title: "PUBG",
      image: "/pubgcard.png",
      route: pubg_user ? `/players/${pubg_user}/pubg` : "",
    },
    {
      title: "CSGO",
      image: "/csgocard.png",
      route: csgo_user ? `/players/${csgo_user}/csgo` : "",
    },
    {
      title: "VALORANT",
      image: "/valocard.png",
      route:
        user && user.user_name.toLowerCase() === username.toLowerCase()
          ? "/players/valorant/me"
          : `/players/valorant/${valo_user}`,
    },
    // LEAGUE OF LEGENDS (future teammate work)
    // {
    //   title: "LEAGUE OF LEGENDS",
    //   image: "/lolcard.png",
    //   route: `/players/${username}/lol`,
    // },
  ];

  /* ================= EFFECTS ================= */

  useEffect(() => {
    setHeroImage("/main-port-bg.png");
    fetchUserData();
  }, [username]);

  /* ================= DATA LOAD ================= */

  const fetchUserData = async () => {
    if (!username) return;

    try {
      setIsLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/players`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const result = await response.json();
      const users = result.data || [];

      const foundUser = users.find(
        (u: UserData) => u.user_name.toLowerCase() === username.toLowerCase()
      );

      if (!foundUser) {
        throw new Error("User not found");
      }

      setUserData(foundUser);
      await checkAvailableGames(foundUser.user_id);

      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  };

  const checkAvailableGames = async (userId: number) => {
    const available: string[] = [];

    // PUBG
    try {
      const res = await pubgAPI.getStatsByUser(userId);
      setPubgUser(res.username);
      available.push("PUBG");
    } catch {}

    // CSGO
    try {
      const res = await csgoAPI.getStatsByUser(userId);
      setCsgoUser(res.username);
      available.push("CSGO");
    } catch {}

    // VALORANT (public check = existence)
    try {
      setValoUser(username);
      available.push("VALORANT");
    } catch {}
    // Check LoL
    try {
      const res = await leagueAPI.getStatsByUser();
      available.push("LEAGUE OF LEGENDS");
      setLolUser(res.username as string);
    } catch (err) {
      // User doesn't have LoL portfolio
    }

    // Add other games here when implemented
    // TODO: Add VALORANT check when APIs are available

    setAvailableGames(available);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
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
      {/* ================= HERO ================= */}
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

      {/* ================= GAME PORTFOLIOS ================= */}
      <div className="main-games-section">
        <h2 className="section-title">Game Portfolios</h2>

        {availableGames.length === 0 ? (
          <div className="no-portfolios">
            <p>No game portfolios found for this user.</p>
          </div>
        ) : (
          <div className="main-portfolio-games-grid">
            {games
              .filter((game) => availableGames.includes(game.title))
              .map((game, index) => (
                <Link
                  to={game.route}
                  key={index}
                  className="game-card-link"
                >
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
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPortfolio;
