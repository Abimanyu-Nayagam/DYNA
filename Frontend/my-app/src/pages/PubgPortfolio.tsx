import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/pubgportfolio.css';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { Bar, Doughnut, Radar } from 'react-chartjs-2';
import api from '../services/api';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale, PointElement, LineElement, Filler);

interface PubgPlayerData {
  id: number;
  user_id: number;
  username: string;
  in_game_id: string;
  fd_ratio: number | null;
  current_rank: string | null;
  highest_rank: string | null;
  headshot_rate: number | null;
  headshots: number;
  eliminations: number;
  most_eliminations: number;
  matches_played: number;
  wins: number;
  top_10: number;
  avg_damage: number | null;
  avg_survival_time: number | null;
  ishidden: boolean;
  created_at: string | null;
  updated_at: string | null;
}

const PUBGPortfolio = () => {
  const { userId } = useParams<{ userId: string }>();
  const [player, setPlayer] = useState<PubgPlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/games/pubg/stats/${userId}`);
        setPlayer(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching player data:', err);
        setError(err.response?.data?.error || 'Failed to load player data');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchPlayerData();
    }
  }, [userId]);

  if (loading) {
    return <div className="pubg-portfolio" style={{ padding: '100px 20px', textAlign: 'center', color: '#fff' }}>Loading player data...</div>;
  }

  if (error || !player) {
    return <div className="pubg-portfolio" style={{ padding: '100px 20px', textAlign: 'center', color: '#fff' }}>Error: {error || 'Player not found'}</div>;
  }

  // Calculated stats
  const avgKills = player.matches_played > 0 ? (player.eliminations / player.matches_played).toFixed(1) : '0.0';
  const kdRatio = ((player.matches_played - player.wins) > 0 ? (player.eliminations / (player.matches_played - player.wins)) : 0).toFixed(1);
  const winRate = player.matches_played > 0 ? ((player.wins / player.matches_played) * 100).toFixed(1) : '0.0';
  const top10Rate = player.matches_played > 0 ? ((player.top_10 / player.matches_played) * 100).toFixed(1) : '0.0';
  const formatSurvivalTime = (seconds: number | null) => {
    if (!seconds) return '0m 0s';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  // Chart Data
  const barData = {
    labels: ['Kills', 'Damage', 'Assists', 'Revives'],
    datasets: [{
      label: 'Per Match Average',
      data: [parseFloat(avgKills), player.avg_damage || 0, 2.1, 1.8],
      backgroundColor: ['#EF4444', '#3B82F6', '#10B981', '#F59E0B'],
      borderRadius: 12,
    }],
  };

  const doughnutData = {
    labels: ['Chicken Dinner', 'Top 5', 'Top 10', 'Other'],
    datasets: [{
      data: [parseFloat(winRate), 24.2, 9.3, 48],
      backgroundColor: ['#10B981', '#F59E0B', '#3B82F6', '#6B7280'],
      borderWidth: 0,
    }],
  };

  const radarData = {
    labels: ['Avg Kills', 'Win Rate %', 'K/D', 'Top 10 %', 'Headshot %', 'Damage/Match'],
    datasets: [
      {
        label: player.username,
        data: [parseFloat(avgKills), parseFloat(winRate), parseFloat(kdRatio), parseFloat(top10Rate), player.headshot_rate || 0, player.avg_damage || 0],
        backgroundColor: 'rgba(239,68,68,0.2)',
        borderColor: '#EF4444',
        pointBackgroundColor: '#EF4444',
      },
      {
        label: 'Average Pro',
        data: [5.2, 12.1, 4.8, 35, 25, 850],
        backgroundColor: 'rgba(107,114,128,0.2)',
        borderColor: '#6B7280',
        pointBackgroundColor: '#6B7280',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#fff' } } },
    scales: { x: { ticks: { color: '#fff' } }, y: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } } },
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: 'rgba(255,255,255,0.2)' },
        grid: { color: 'rgba(255,255,255,0.1)' },
        pointLabels: { color: '#fff' },
        ticks: { color: '#fff', backdropColor: 'transparent' },
      },
    },
  };

  return (
    <div className="pubg-portfolio">
      {/* Hero Section */}
      <section className="hero">
        <video autoPlay loop muted playsInline className="hero-video">
          <source src="https://assets.codepen.io/3834195/pubg-bg.mp4" type="video/mp4" />
        </video>
        <div className="hero-content">
          <h1 className="player-name">{player.username}</h1>
          <p className="player-tagline">PUBG Mobile Esports Pro | {player.current_rank || 'Unranked'} | Tournament Player</p>
          <div className="player-badges">
            <span>Current Rank: {player.current_rank || 'N/A'}</span>
            <span>PUBG ID: {player.in_game_id}</span>
            <span>Peak Rank: {player.highest_rank || 'N/A'}</span>
          </div>

          <div className="quick-stats">
            <div className="stat-card"><div className="value">{avgKills}</div><div className="label">Avg Kills/Match</div></div>
            <div className="stat-card"><div className="value">{kdRatio}</div><div className="label">K/D Ratio</div></div>
            <div className="stat-card"><div className="value">{winRate}%</div><div className="label">Win Rate</div></div>
            <div className="stat-card"><div className="value">{top10Rate}%</div><div className="label">Top 10 Rate</div></div>
          </div>
        </div>
      </section>

      {/* Lifetime Stats */}
      <section className="section stats-section">
        <h2>Lifetime Stats</h2>
        <div className="marquee">
          <div className="marquee-content">
            CHAMPION MINDSET • CONSISTENT PERFORMER • ESPORTS READY • {player.eliminations}+ KILLS • {winRate}% WINRATE • {player.current_rank || 'RANKED PLAYER'} &nbsp; • &nbsp;
            CHAMPION MINDSET • CONSISTENT PERFORMER • ESPORTS READY • {player.eliminations}+ KILLS • {winRate}% WINRATE • {player.current_rank || 'RANKED PLAYER'}
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-big"><i className="fas fa-crosshairs"></i><div className="value">{player.eliminations.toLocaleString()}</div><div className="label">Total Kills</div><small>Avg: {avgKills}/match</small></div>
          <div className="stat-big"><i className="fas fa-trophy"></i><div className="value">{player.wins}</div><div className="label">Wins</div><small>Win Rate: {winRate}%</small></div>
          <div className="stat-big"><i className="fas fa-shield-alt"></i><div className="value">{player.top_10.toLocaleString()}</div><div className="label">Top 10s</div><small>Rate: {top10Rate}%</small></div>
          <div className="stat-big"><i className="fas fa-clock"></i><div className="value">{formatSurvivalTime(player.avg_survival_time)}</div><div className="label">Avg Survival</div><small>Headshot: {player.headshot_rate || 0}%</small></div>
        </div>
      </section>

      {/* Analytics Section */}
      <section className="section analytics-section">
        <h2>Performance Analytics</h2>
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Core Metrics (Last 100 Matches)</h3>
            <div className="chart-container"><Bar data={barData} options={chartOptions} /></div>
          </div>
          <div className="chart-card">
            <h3>Placement Distribution</h3>
            <div className="chart-container"><Doughnut data={doughnutData} options={chartOptions} /></div>
          </div>
        </div>
        <div className="chart-card radar">
          <h3>Vs Average Pro Player</h3>
          <div className="chart-container radar-container"><Radar data={radarData} options={radarOptions} /></div>
        </div>
      </section>

      {/* Recent Highlights */}
      <section className="section highlights-section">
        <h2>Recent Highlights</h2>
        <div className="highlights-grid">
          <div className="highlight-card">Chicken Dinner #{player.wins}<span>{player.most_eliminations} Kills</span><small>Best Performance | Headshots: {player.headshots}</small></div>
          <div className="highlight-card">Top Performance<span>{player.most_eliminations} Kills</span><small>Damage: {player.avg_damage || 0} | K/D: {kdRatio}</small></div>
          <div className="highlight-card">Career Stats<span>{player.matches_played} Matches</span><small>Total Eliminations: {player.eliminations} | Win Rate: {winRate}%</small></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="portfolio-footer">
        <p>© 2025 {player.username} PUBG Portfolio. Ready for Esports Teams. Contact: {player.username.toLowerCase()}@pro.gg</p>
      </footer>
    </div>
  );
};

export default PUBGPortfolio;