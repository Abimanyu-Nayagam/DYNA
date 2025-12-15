import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ValorantPlayerCard from '@/components/ui/ValorantPlayerCard';
import { valorantAPI } from '@/services/api';
import '@/styles/valorantsearch.css';

// 📝 TypeScript Interface for search results
interface ValorantSearchResult {
    player_name: string;
    riot_id: string;
    tagline: string;
    current_rank: string;
    region: string;
    best_agent: string;
    user_name: string; // This is the DYNA username we use for routing
}

const ValorantSearchPage = () => {
    // 🎯 React Router hook for navigation
    const navigate = useNavigate();

    // 👤 Get current user info (to show "Create Portfolio" button)
    const { user } = useAuth();

    // 📊 State Management (React hooks to store data)
    const [players, setPlayers] = useState<ValorantSearchResult[]>([]);
    const [filteredPlayers, setFilteredPlayers] = useState<ValorantSearchResult[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 🔄 Fetch players when page loads
    useEffect(() => {
        fetchAllPlayers();
    }, []);

    // 🔍 Filter players when search query changes
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredPlayers(players);
        } else {
            const filtered = players.filter(player =>
                player.player_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                player.riot_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                player.current_rank.toLowerCase().includes(searchQuery.toLowerCase()) ||
                player.best_agent.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredPlayers(filtered);
        }
    }, [searchQuery, players]);

    // 📡 API Call: Fetch all public Valorant players
    const fetchAllPlayers = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Call backend API (GET /api/valorant/search)
            const results = await valorantAPI.searchProfiles('');

            setPlayers(results);
            setFilteredPlayers(results);
        } catch (err: any) {
            console.error('Error fetching players:', err);
            setError('Failed to load players. Please try again.');
            setPlayers([]);
            setFilteredPlayers([]);
        } finally {
            setIsLoading(false);
        }
    };

    // 🔍 Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    // ➕ Navigate to create portfolio page
    const handleCreatePortfolio = () => {
        if (!user) {
            // If not logged in, go to login page
            navigate('/login');
        } else {
            // If logged in, go to create portfolio page
            navigate('/players/valorant/create');
        }
    };

    // 👤 Navigate to user's Valorant profile
    const handleViewProfile = (userName: string) => {
        // Navigate to /user/:username/valorant
        navigate(`/user/${userName}/valorant`);
    };

    return (
        <div className="valorant-search-page">
            {/* 🎨 Header Section */}
            <div className="search-header">
                <div className="header-glow"></div>
                <h1 className="page-title">VALORANT PLAYERS</h1>
                <p className="page-subtitle">Discover top agents and their statistics</p>
            </div>

            {/* 🔍 Search Controls */}
            <div className="search-controls">
                <div className="search-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by player name, Riot ID, rank, or agent..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    <span className="search-icon">🔎</span>
                </div>

                {/* ➕ Create Portfolio Button */}
                <button
                    className="create-portfolio-btn"
                    onClick={handleCreatePortfolio}
                >
                    + Create Portfolio
                </button>
            </div>

            {/* 📊 Results Count */}
            {!isLoading && !error && (
                <div className="results-count">
                    Showing {filteredPlayers.length} {filteredPlayers.length === 1 ? 'player' : 'players'}
                </div>
            )}

            {/* ⏳ Loading State */}
            {isLoading && (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading players...</p>
                </div>
            )}

            {/* ❌ Error State */}
            {error && (
                <div className="error-container">
                    <p className="error-icon">⚠️</p>
                    <h3>Oops! Something went wrong</h3>
                    <p>{error}</p>
                    <button className="retry-btn" onClick={fetchAllPlayers}>
                        Retry
                    </button>
                </div>
            )}

            {/* 🎮 Players Grid */}
            {!isLoading && !error && (
                <>
                    {filteredPlayers.length === 0 ? (
                        <div className="no-results">
                            <p className="no-results-icon">🔍</p>
                            <h3>No players found</h3>
                            <p>Try adjusting your search criteria or create your own portfolio!</p>
                        </div>
                    ) : (
                        <div className="players-grid">
                            {filteredPlayers.map((player, index) => (
                                <ValorantPlayerCard
                                    key={index}
                                    playerName={player.player_name}
                                    riotId={`${player.riot_id}#${player.tagline}`}
                                    currentRank={player.current_rank}
                                    region={player.region}
                                    bestAgent={player.best_agent}
                                    userName={player.user_name}
                                    onClick={() => handleViewProfile(player.user_name)}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ValorantSearchPage;