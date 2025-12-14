import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { pubgAPI, type PubgStatsData } from '../services/api';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { FaCrosshairs, FaTrophy, FaMedal, FaSkull, FaGamepad, FaBolt } from 'react-icons/fa';
import '../styles/pubgportfolio.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const PubgPortfolio = () => {
  const { userId } = useParams<{ userId: string }>();
  const [stats, setStats] = useState<PubgStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heroImage, setHeroImage] = useState('');

  // Helper function to get rank image path
  const getRankImage = (rank: string | null) => {
    if (!rank) return null;
    const rankName = rank.toLowerCase();
    console.log('Loading rank image for:', rank, '->', rankName);
    return `/PUBG-RANKS/${rankName}.png`;
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;

      try {
        const data = await pubgAPI.getStatsByUser(parseInt(userId));
        setStats(data);
      } catch (err) {
        setError('No PUBG stats Availaible');
        console.error(err);
      }
    };

    fetchStats();

    const fetchHeroImage = async () => {
      setHeroImage('/pubg-port-bg.jpg');
    };

    fetchHeroImage();

  }, [userId]);

  if (isLoading) {
    return (
      <div className="pubg-portfolio-loading">
        <video
          autoPlay
          muted
          onEnded={() => setIsLoading(false)}
          className="loading-video"
        >
          <source src="/pubg-loading.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="pubg-portfolio-error">
        <h2>{error || 'No PUBG stats found'}</h2>
        <p>Please create your PUBG portfolio first.</p>
      </div>
    );
  }

  // Prepare chart data
  const barData = {
    labels: ['Wins', 'Top 10', 'Eliminations', 'Headshots'],
    datasets: [
      {
        label: 'Stats',
        data: [stats.wins || 0, stats.top_10 || 0, stats.eliminations || 0, stats.headshots || 0],
        backgroundColor: '#8b5cf6',
      },
    ],
  };

  const pieData = {
    labels: ['Wins', 'Top 10', 'Other Matches'],
    datasets: [
      {
        data: [
          stats.wins || 0,
          stats.top_10 || 0,
          (stats.matches_played || 0) - (stats.wins || 0) - (stats.top_10 || 0),
        ],
        backgroundColor: ['#48396dff', '#6d44ceff', '#936ceeff'],
        borderColor: 'transparent',
      },
    ],
  };

  const lineData = {
    labels: ['Matches Played', 'Eliminations', 'Wins'],
    datasets: [
      {
        label: 'Performance Trend',
        data: [stats.matches_played || 0, stats.eliminations || 0, stats.wins || 0],
        borderColor: '#8b5cf6',
      },
    ],
  };

  return (
    <div className="pubg-portfolio">
      {/* Hero Section */}
      <div className="pubg-hero-section" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="pubg-hero-overlay"></div>
        <div className="pubg-hero-content">
          <div className="hero-main">
            {stats.current_rank && (
              <img 
                src={getRankImage(stats.current_rank)} 
                alt={`${stats.current_rank} Rank`}
                className="hero-rank-logo-medium"
                onError={(e) => {
                  console.log('Failed to load rank image:', stats.current_rank, getRankImage(stats.current_rank));
                  // Try fallback to .jpg
                  const img = e.target as HTMLImageElement;
                  if (img.src.includes('.png')) {
                    img.src = img.src.replace('.png', '.jpg');
                  }
                }}
              />
            )}
            <div className="hero-user-section">
              <h1 className="pubg-hero-title">{stats.username?.toUpperCase()}</h1>
              <p className="pubg-hero-subtitle">UID : {stats.in_game_id}</p>
            </div>
          </div>
          <div className="pubg-hero-stats">
            <div className="pubg-hero-stat">
              <span className="stat-value">{stats.matches_played || 0}</span>
              <span className="stat-label">Matches Played</span>
            </div>
            <div className="pubg-hero-stat">
              <span className="stat-value">{stats.wins || 0}</span>
              <span className="stat-label">Wins</span>
            </div>
            <div className="pubg-hero-stat">
              <span className="stat-value">{stats.eliminations || 0}</span>
              <span className="stat-label">Eliminations</span>
            </div>
             <div className="pubg-hero-stat">
              <span className="stat-value">{stats.fd_ratio || 0}</span>
              <span className="stat-label">F/D Ratio</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-section">
        <h2 className="section-title">Player Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="card-icon">
              <FaCrosshairs />
            </div>
            <div className="card-content">
              <h3>{stats.eliminations || 0}</h3>
              <p>Total Eliminations</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="card-icon">
              <FaTrophy />
            </div>
            <div className="card-content">
              <h3>{stats.wins || 0}</h3>
              <p>Wins</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="card-icon">
              <FaMedal />
            </div>
            <div className="card-content">
              <h3>{stats.top_10 || 0}</h3>
              <p>Top 10 Finishes</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="card-icon">
              <FaSkull />
            </div>
            <div className="card-content">
              <h3>{stats.headshots || 0}</h3>
              <p>Headshots</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="card-icon">
              <FaGamepad />
            </div>
            <div className="card-content">
              <h3>{stats.matches_played || 0}</h3>
              <p>Matches Played</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="card-icon">
              <FaBolt />
            </div>
            <div className="card-content">
              <h3>{stats.avg_damage?.toFixed(1) || 'N/A'}</h3>
              <p>Avg Damage</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <h2 className="section-title">Performance Analytics</h2>
        <div className="charts-grid">
          <div className="chart-card charts-grid-two">
            <h3>Key Stats Overview</h3>
            <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>
          <div className="chart-card charts-grid-one">
            <h3>Match Results Distribution</h3>
            <Pie data={pieData} options={{ responsive: true }} />
          </div>
          <div className="chart-card charts-grid-three">
            <h3>Performance Trend</h3>
            <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="info-section">
        <h2 className="section-title">Additional Information</h2>
        <div className="info-grid">
          <div className="info-card">
            <h3>Highest Rank</h3>
            <div className="rank-display">
              {stats.highest_rank ? (
                <div className="rank-with-name">
                  <img 
                    src={getRankImage(stats.highest_rank)} 
                    alt={`${stats.highest_rank} Rank`}
                    className="rank-logo-small"
                    onError={(e) => {
                      console.log('Failed to load highest rank image:', stats.highest_rank, getRankImage(stats.highest_rank));
                      // Try fallback to .jpg
                      const img = e.target as HTMLImageElement;
                      if (img.src.includes('.png')) {
                        img.src = img.src.replace('.png', '.jpg');
                      }
                    }}
                  />
                </div>
              ) : (
                <p>N/A</p>
              )}
            </div>
          </div>
          <div className="info-card">
            <h3>Most Eliminations in a Match</h3>
            <p>{stats.most_eliminations || 'N/A'}</p>
          </div>
          <div className="info-card">
            <h3>Average Survival Time</h3>
            <p>{stats.avg_survival_time ? `${stats.avg_survival_time} min` : 'N/A'}</p>
          </div>
          <div className="info-card">
            <h3>Headshot Rate</h3>
            <p>{stats.headshot_rate ? `${stats.headshot_rate.toFixed(1)}%` : 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PubgPortfolio;