import React from 'react';
import '@/styles/valorant/valorantcard.css';

// 📝 TypeScript Interface - defines what data this card needs
interface ValorantPlayerCardProps {
    playerName: string;      // Display name like "ShadowStrike"
    riotId: string;          // Riot ID like "Shadow#7890"
    currentRank: string;     // Rank like "Immortal 2"
    region: string;          // Region like "Asia-Pacific"
    bestAgent: string;       // Best agent like "Jett"
    userName: string;        // DYNA username for profile link
    onClick?: () => void;    // Function to call when card is clicked
}

// 🎨 Agent colors for visual styling
const AGENT_COLORS: { [key: string]: string } = {
    'Jett': '#89CFF0',
    'Reyna': '#A020F0',
    'Raze': '#FF6B35',
    'Phoenix': '#FFA500',
    'Sage': '#00FF88',
    'Cypher': '#FFD700',
    'Sova': '#4A90E2',
    'Omen': '#6A5ACD',
    'Viper': '#00FF00',
    'Brimstone': '#FF4500',
    // Add more agents as needed
};

// 🏆 Rank colors for badges
const RANK_COLORS: { [key: string]: string } = {
    'Iron': '#4A4A4A',
    'Bronze': '#CD7F32',
    'Silver': '#C0C0C0',
    'Gold': '#FFD700',
    'Platinum': '#00CED1',
    'Diamond': '#B9F2FF',
    'Ascendant': '#FF1744',
    'Immortal': '#D946EF',
    'Radiant': '#FFD700',
};

// 🎯 Helper function to get rank color
const getRankColor = (rank: string): string => {
    const rankName = rank.split(' ')[0]; // Get "Immortal" from "Immortal 2"
    return RANK_COLORS[rankName] || '#8b5cf6';
};

// 🎯 Helper function to get agent color
const getAgentColor = (agent: string): string => {
    return AGENT_COLORS[agent] || '#8b5cf6';
};

const ValorantPlayerCard: React.FC<ValorantPlayerCardProps> = ({
    playerName,
    riotId,
    currentRank,
    region,
    bestAgent,
    onClick
}) => {
    return (
        <div
            className="valorant-player-card"
            onClick={onClick}
        >
            {/* 🌟 Animated glow border effect */}
            <div className="card-glow"></div>

            {/* 👤 Player Header with Avatar */}
            <div className="card-header">
                <div className="player-avatar">
                    {/* Show first letter of player name */}
                    {playerName.charAt(0).toUpperCase()}
                </div>
                <div className="player-info">
                    <h3 className="player-name">{playerName}</h3>
                    <p className="riot-id">{riotId}</p>
                </div>
            </div>

            {/* 📊 Stats Section */}
            <div className="card-stats">
                {/* Rank Badge */}
                <div className="stat-badge rank-badge">
                    <div
                        className="badge-icon"
                        style={{
                            background: `linear-gradient(135deg, ${getRankColor(currentRank)}88, ${getRankColor(currentRank)}44)`
                        }}
                    >
                        🏆
                    </div>
                    <div className="badge-info">
                        <span className="badge-label">Rank</span>
                        <span
                            className="badge-value"
                            style={{ color: getRankColor(currentRank) }}
                        >
                            {currentRank}
                        </span>
                    </div>
                </div>

                {/* Best Agent Badge */}
                <div className="stat-badge agent-badge">
                    <div
                        className="badge-icon"
                        style={{
                            background: `linear-gradient(135deg, ${getAgentColor(bestAgent)}88, ${getAgentColor(bestAgent)}44)`
                        }}
                    >
                        ⚡
                    </div>
                    <div className="badge-info">
                        <span className="badge-label">Main</span>
                        <span
                            className="badge-value"
                            style={{ color: getAgentColor(bestAgent) }}
                        >
                            {bestAgent}
                        </span>
                    </div>
                </div>

                {/* Region Badge */}
                <div className="stat-badge region-badge">
                    <div className="badge-icon">🌍</div>
                    <div className="badge-info">
                        <span className="badge-label">Region</span>
                        <span className="badge-value">{region}</span>
                    </div>
                </div>
            </div>

            {/* 🔗 View Profile Button */}
            <button className="view-profile-btn">
                View Profile 
            </button>
        </div>
    );
};

export default ValorantPlayerCard;