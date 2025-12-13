import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PlayerCard from '@/components/ui/PlayerCard'
import CreatePubgPortfolio from '@/components/CreatePubgPortfolio'
import '@/styles/playerspage.css'

interface PubgPlayer {
  id: number;
  username: string;
  in_game_id: string;
  current_rank: string;
}

const PubgPlayersPage = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<PubgPlayer[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<PubgPlayer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn] = useState(false); // TODO: Replace with actual auth check

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    // Filter players based on search term
    if (searchTerm.trim() === '') {
      setFilteredPlayers(players);
    } else {
      const filtered = players.filter(player =>
        player.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.in_game_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.current_rank.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPlayers(filtered);
    }
  }, [searchTerm, players]);

  const fetchPlayers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/games/pubg/');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setPlayers(data);
      setFilteredPlayers(data);
    } catch (error) {
      console.error('Error fetching players:', error);
      // Fallback to empty array on error
      setPlayers([]);
      setFilteredPlayers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePortfolio = () => {
    if (!isLoggedIn) {
      // TODO: Replace with actual login page route
      navigate('/login');
    } else {
      setShowCreateForm(true);
    }
  };

  return (
    <div className="players-page">
      <div className="players-header">
        <div className="header-content">
          <h1 className="page-title">PUBG PLAYERS</h1>
        </div>
      </div>

      <div className="players-controls">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search by username, ID, or rank..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <p className='search-icon'>🔎︎</p>
        </div>
        
        <button className="create-portfolio-btn" onClick={handleCreatePortfolio}>
          + Create Portfolio
        </button>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <p>Loading players...</p>
        </div>
      ) : (
        <>
          {filteredPlayers.length === 0 ? (
            <div className="no-results">
             <p>🔎︎</p>
              <h3>No players found</h3>
              <p>Try adjusting your search criteria</p>
            </div>
          ) : (
            <>
              <div className="results-count">
                Showing {filteredPlayers.length} {filteredPlayers.length === 1 ? 'player' : 'players'}
              </div>
              <div className="players-grid">
                {filteredPlayers.map((player) => (
                  <PlayerCard
                    key={player.id}
                    username={player.username}
                    in_game_id={player.in_game_id}
                    current_rank={player.current_rank}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {showCreateForm && (
        <CreatePubgPortfolio onClose={() => setShowCreateForm(false)} />
      )}
    </div>
  )
}

export default PubgPlayersPage
