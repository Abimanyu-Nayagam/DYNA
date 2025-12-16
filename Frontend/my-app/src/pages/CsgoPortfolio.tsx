"use client";
import { csgoAPI, type CsgoStatsData } from "../services/api";
import { useParams } from "react-router-dom";

import { motion } from "framer-motion";

import { useEffect, useState } from "react";
import "../styles/csgoportfolio.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

import { Bar, Radar, Doughnut } from "react-chartjs-2";

const THEME = {
  primary: "#8b5cf6",
  secondary: "#ab1ea6",
  danger: "#c084fc",
  muted: "#8b5cf6",
  grid: "#2a2a3d",
};

export function CsgoCharts({ stats }: { stats: CsgoStatsData }) {
  const matchStats = {
    labels: ["Matches", "Wins"],
    datasets: [
      {
        label: "Match Stats",
        data: [stats.matches_played, stats.wins],
        backgroundColor: [THEME.muted, THEME.secondary],
        borderRadius: 8,
      },
    ],
  };

  const winRateData = {
    labels: ["Win %", "Loss %"],
    datasets: [
      {
        data: [stats.win_rate ?? 0, 100 - (stats.win_rate ?? 0)],
        backgroundColor: [THEME.primary, THEME.danger],
        borderWidth: 0,
      },
    ],
  };

  const performanceData = {
    labels: ["Avg Damage / Round", "Avg Kills / Round", "Rounds Played"],
    datasets: [
      {
        label: "Performance",
        data: [
          stats.avg_damage_per_round ?? 0,
          stats.avg_kills_per_round ?? 0,
          stats.rounds_played,
        ],
        backgroundColor: THEME.primary,
        borderRadius: 8,
      },
    ],
  };

  const utilityRadar = {
    labels: ["Bomb Plants", "Bomb Defuses", "Flash Assists"],
    datasets: [
      {
        label: "Utility Impact",
        data: [stats.bomb_plants, stats.bomb_defuses, stats.flash_assists],
        backgroundColor: "rgba(139,92,246,0.35)",
        borderColor: THEME.primary,
        pointBackgroundColor: THEME.primary,
      },
    ],
  };

  const gridOptions = {
    scales: {
      x: { grid: { color: THEME.grid } },
      y: { grid: { color: THEME.grid } },
    },
    plugins: {
      legend: {
        labels: { color: "#e5e7eb" },
      },
    },
  };

  return (
    <section className="chart-grid-2">
      <ChartCard title="Match Statistics">
        <Bar data={matchStats} options={gridOptions} />
      </ChartCard>

      <ChartCard title="Win Rate">
        <Doughnut data={winRateData} />
      </ChartCard>

      <ChartCard title="Performance Averages">
        <Bar data={performanceData} options={gridOptions} />
      </ChartCard>

      <ChartCard title="Objective & Utility">
        <Radar data={utilityRadar} />
      </ChartCard>
    </section>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="chart-card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export default function CsgoPortfolio() {
  const [stats, setStats] = useState<CsgoStatsData | null>(null);
  const { username } = useParams<{ username: string }>();
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserAndStats = async () => {
      if (!username) return;
      try {
        // First, fetch all users and find by username
        const usersResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/games/csgo`);
        if (!usersResponse.ok) {
          throw new Error("Failed to fetch users");
        }

        const usersResult = await usersResponse.json();
        const users = usersResult || [];

        // Find user by username (case-insensitive)
        const user = users.find(
          (u: any) => u.username.toLowerCase() === username.toLowerCase()
        );

        if (!user) {
          throw new Error("User not found");
        }

        setUserId(user.user_id);

        // Then fetch CSGO stats using userId
        const data = await csgoAPI.getStatsByUser(user.user_id);
        console.log(data);

        setStats(data);
      } catch (err) {
        setError("No CSGO stats Available");
        console.error(err);
      }
    };

    fetchUserAndStats();
  }, [username]);

  if (!stats) return <div className="loading">Loading portfolio...</div>;
  if (error || !stats) {
    return (
      <div className="pubg-portfolio-error">
        <h2>{error || "No PUBG stats found"}</h2>
        <p>Please create your PUBG portfolio first.</p>
      </div>
    );
  }

  return (
    <div className="csgo-portfolio-page">
      {/* HERO */}
      <motion.div
        className="csgo-portfolio-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 2 }}
        style={{
          backgroundImage: "url('/csgo-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="rank-card glass">
          <div className="rank-info">
            <p className="rank p-20 mb-20">{stats.in_game_id}</p>
          </div>

          <div className="rank-right">
            <div className="rank-info">
              <h1>{stats.username}</h1>
              <p className="rank">{stats.current_rank}</p>
              <span className="peak">Peak: {stats.highest_rank}</span>
              <br />
              <span className="peak">MM: {stats.highest_rank}</span>
            </div>

            <div className="metrics">
              <div className="metric">
                <span className="metric-label">ELO</span>
                <span className="metric-value">{stats.elo ?? "—"}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Win Rate</span>
                <span className="metric-value">
                  {stats.win_rate ? `${stats.win_rate.toFixed(1)}%` : "—"}
                </span>
              </div>
              <div className="metric">
                <span className="metric-label">Faceit Level</span>
                <span className="metric-value">
                  {stats.faceit_level ?? "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* STATS GRID */}
      <motion.section
        className="stats-grid"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <StatCard label="K/D Ratio" value={stats.kd_ratio?.toFixed(2)} />
        <StatCard label="Headshot %" value={`${stats.headshot_percentage}%`} />
        <StatCard label="kills" value={`${stats.kills}`} />
        <StatCard label="deaths" value={`${stats.deaths}`} />
        <StatCard label="assists" value={`${stats.assists}`} />
        <StatCard label="MVPs" value={`${stats.mvps} `} />
      </motion.section>

      {stats.video_url && (
        <motion.section
          className="video-section"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="video-container">
            <video loop autoPlay muted playsInline>
              <source src={stats.video_url} type="video/mp4" />
            </video>
            <div className="video-overlay" />
          </div>
        </motion.section>
      )}

      {/* CHARTS */}
      <motion.section
        className="chart-section"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <h2>Performance Breakdown</h2>
        {stats && <CsgoCharts stats={stats} />}
      </motion.section>
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) {
  return (
    <motion.div
      className="stat-card"
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <span>{label}</span>
      <strong>{value ?? "-"}</strong>
    </motion.div>
  );
}
