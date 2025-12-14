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

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;

      try {
        const data = await pubgAPI.getStatsByUser(parseInt(userId));
        setStats(data);
      } catch (err) {
        setError('Failed to load PUBG stats');
        console.error(err);
      }
    };

    fetchStats();

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 7500);

    return () => clearTimeout(timer);
  }, [userId]);

  if (isLoading) {
    return (
      <div className="pubg-portfolio-loading">
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
        backgroundColor: ['#8b5cf6', '#602469', '#d946ef', '#ab1ea6'],
        borderColor: ['#8b5cf6', '#602469', '#d946ef', '#ab1ea6'],
        borderWidth: 1,
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
        backgroundColor: ['#8b5cf6', '#602469', '#d946ef'],
        hoverBackgroundColor: ['#7c3aed', '#4c1d95', '#c026d3'],
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
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="pubg-portfolio">
      {/* Hero Section */}
      <div className="pubg-hero-section">
        <div className="pubg-hero-overlay"></div>
        <div className="pubg-hero-content">
          <h1 className="pubg-hero-title">{stats.username}'s PUBG Portfolio</h1>
          <p className="pubg-hero-subtitle">In-Game ID: {stats.in_game_id}</p>
          <div className="pubg-hero-stats">
            <div className="pubg-hero-stat">
              <span className="stat-value">{stats.current_rank}</span>
              <span className="stat-label">Current Rank</span>
            </div>
            <div className="pubg-hero-stat">
              <span className="stat-value">{stats.fd_ratio?.toFixed(2) || 'N/A'}</span>
              <span className="stat-label">F/D Ratio</span>
            </div>
            <div className="pubg-hero-stat">
              <span className="stat-value">{stats.headshot_rate?.toFixed(1) || 'N/A'}%</span>
              <span className="stat-label">Headshot Rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-section">
        <h2 className="section-title">Player Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="card-icon">🎯</div>
            <div className="card-content">
              <h3>{stats.eliminations || 0}</h3>
              <p>Total Eliminations</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="card-icon">🏆</div>
            <div className="card-content">
              <h3>{stats.wins || 0}</h3>
              <p>Wins</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="card-icon">🎖️</div>
            <div className="card-content">
              <h3>{stats.top_10 || 0}</h3>
              <p>Top 10 Finishes</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="card-icon">💀</div>
            <div className="card-content">
              <h3>{stats.headshots || 0}</h3>
              <p>Headshots</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="card-icon">🎮</div>
            <div className="card-content">
              <h3>{stats.matches_played || 0}</h3>
              <p>Matches Played</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="card-icon">⚡</div>
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
          <div className="chart-card">
            <h3>Key Stats Overview</h3>
            <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>
          <div className="chart-card">
            <h3>Match Results Distribution</h3>
            <Pie data={pieData} options={{ responsive: true }} />
          </div>
          <div className="chart-card">
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
            <p>{stats.highest_rank || 'N/A'}</p>
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