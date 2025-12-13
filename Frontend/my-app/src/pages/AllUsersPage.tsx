import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import UserCard from '@/components/ui/UserCard'
import '@/styles/playerspage.css'

interface Player {
  user_id: number;
  user_name: string;
  email: string;
  provider: string;
  created_at: string | null;
  updated_at: string | null;
}

const PlayersPage = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    // Filter players based on search term
    if (searchTerm.trim() === '') {
      setFilteredPlayers(players);
    } else {
      const filtered = players.filter(player =>
        player.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.user_id.toString().includes(searchTerm)
      );
      setFilteredPlayers(filtered);
    }
  }, [searchTerm, players]);

  const fetchPlayers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/players');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      // Extract data array from the response object
      const playersData = result.data || [];
      setPlayers(playersData);
      setFilteredPlayers(playersData);
    } catch (error) {
      console.error('Error fetching players:', error);
      // Fallback to empty array on error
      setPlayers([]);
      setFilteredPlayers([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="players-page">
      <div className="players-header">
        <div className="header-content">
          <h1 className="page-title">ALL PLAYERS</h1>
        </div>
      </div>

      <div className="players-controls">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search by username, USER ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <p className='search-icon'>🔎︎</p>
        </div>
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
                  <UserCard
                    key={player.user_id}
                    user_id={player.user_id}
                    username={player.user_name}
                    onClick={() => navigate(`/players/${player.user_id}`)}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default PlayersPage
