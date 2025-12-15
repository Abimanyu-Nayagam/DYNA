import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FaEnvelope, FaUser, FaCalendar } from 'react-icons/fa'
import { pubgAPI, csgoAPI } from '../services/api'
import '../styles/mainportfolio.css'

interface UserData {
  user_id: number;
  user_name: string;
  email: string;
  provider: string;
  created_at: string | null;
  updated_at: string | null;
}

const MainPortfolio = () => {
  const { username } = useParams<{ username: string }>();
  const [heroImage, setHeroImage] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableGames, setAvailableGames] = useState<string[]>([]);

  const games = [
    {
      title: 'PUBG',
      image: '/pubgcard.png',
      route: `/players/${username}/pubg`,
    },
    {
      title: 'CSGO',
      image: '/csgocard.png',
      route: `/players/${username}/csgo`,
    },
    {
      title: 'VALORANT',
      image: '/valocard.png',
      route: `/players/${username}/valo`,
    },
    {
      title: 'LEAGUE OF LEGENDS',
      image: '/lolcard.png',
      route: `/players/${username}/lol`,
    }
  ];

  useEffect(() => {
    setHeroImage('/main-port-bg.png');
    fetchUserData();
  }, [username]);

  const fetchUserData = async () => {
    if (!username) return;

    try {
      setIsLoading(true);
      // Fetch all users and find by username
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/players`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const result = await response.json();
      const users = result.data || [];
      
      // Find user by username (case-insensitive)
      const user = users.find(
        (u: UserData) => u.user_name.toLowerCase() === username.toLowerCase()
      );
      
      if (!user) {
        throw new Error('User not found');
      }
      
      setUserData(user);
      
      // Check which games this user has portfolios for
      await checkAvailableGames(user.user_id);
      
      setError(null);
    } catch (err) {
      setError('Failed to load user data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAvailableGames = async (userId: number) => {
    const available: string[] = [];
    
    // Check PUBG
    try {
      await pubgAPI.getStatsByUser(userId);
      available.push('PUBG');
    } catch (err) {
      // User doesn't have PUBG portfolio
    }
    
    // Check CSGO
    try {
      await csgoAPI.getStatsByUser(userId);
      available.push('CSGO');
    } catch (err) {
      // User doesn't have CSGO portfolio
    }
    
    // Add other games here when implemented
    // TODO: Add VALORANT and LOL checks when APIs are available
    
    setAvailableGames(available);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return <div className="main-portfolio-loading">Loading...</div>;
  }

  if (error || !userData) {
    return (
      <div className="main-portfolio-error">
        <h2>{error || 'User not found'}</h2>
        <Link to="/players" className="back-link">← Back to Players</Link>
      </div>
    );
  }

  return (
    <div className="main-portfolio">
      <div className="main-hero-section" style={{ backgroundImage: `url(${heroImage})` }}>
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
                  <span className="detail-value">{formatDate(userData.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="main-games-section">
        <h2 className="section-title">Game Portfolios</h2>
        {availableGames.length === 0 ? (
          <div className="no-portfolios">
            <p>No game portfolios found for this user.</p>
          </div>
        ) : (
        <div className="main-portfolio-games-grid">
          {games.filter(game => availableGames.includes(game.title)).map((game, index) => (
            <Link to={game.route} key={index} className="game-card-link">
              <div className="main-portfolio-game-card">
                <div className="game-card-image-container">
                  <img src={game.image} alt={game.title} className="game-card-image" />
                  <div className="game-card-overlay">
                  </div>
                </div>
                <div className="game-card-content">
                  <h3 className="main-portfolio-game-title">{game.title}</h3>
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
  )
}

export default MainPortfolio