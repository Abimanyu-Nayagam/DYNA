import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaUser, FaCalendar } from "react-icons/fa";
import "../styles/profile.css";
import { useAuth } from "@/contexts/AuthContext";
import { pubgAPI, csgoAPI } from "../services/api";

interface UserData {
  user_id: number;
  user_name: string;
  email: string;
  provider: string;
  created_at: string | null;
  updated_at: string | null;
}

const Profile = () => {
  const user = useAuth();
  const { logout } = useAuth();
  const user_name = user.user?.user_name;
  const [heroImage, setHeroImage] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableGames, setAvailableGames] = useState<string[]>([]);
  const [csgo_user, setCsgoUser] = useState("");
  const [pubg_user, setPubgUser] = useState("");
  const [valo_user, setValoUser] = useState("");
  const [lol_user, setLolUser] = useState("");

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
      route: `/players/${valo_user}/valo`,
    },
    {
      title: "LEAGUE OF LEGENDS",
      image: "/lolcard.png",
      route: `/players/${lol_user}/lol`,
    },
  ];

  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    setHeroImage("/main-port-bg.png");
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    if (!user_name) return;

    try {
      setIsLoading(true);
      // Fetch all users and find by username
      const response = await fetch(`http://localhost:5000/players`);

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const result = await response.json();
      const users = result.data || [];

      // Find user by username (case-insensitive)
      const user = users.find(
        (u: UserData) => u.user_name.toLowerCase() === user_name.toLowerCase()
      );

      if (!user) {
        throw new Error("User not found");
      }
      await checkAvailableGames(user.user_id);
      setUserData(user);
      setError(null);
    } catch (err) {
      setError("Failed to load user data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAvailableGames = async (userId: number) => {
    const available: string[] = [];

    // Check PUBG
    try {
      const res = await pubgAPI.getStatsByUser(userId);
      setPubgUser(res.username);
      available.push("PUBG");
    } catch (err) {
      // User doesn't have PUBG portfolio
    }

    // Check CSGO
    try {
      const res = await csgoAPI.getStatsByUser(userId);
      setCsgoUser(res.username);

      available.push("CSGO");
    } catch (err) {
      // User doesn't have CSGO portfolio
    }

    // Add other games here when implemented
    // TODO: Add VALORANT and LOL checks when APIs are available

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

  return (
    <div className="main-portfolio">
      <div
        className="main-hero-section"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="main-hero-overlay"></div>
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
        <button onClick={handleLogout} className="logout-btn">
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
