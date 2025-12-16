import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PlayerCard from "@/components/ui/PlayerCard";
import "@/styles/playerspage.css";
import { leagueAPI } from "@/services/api";

interface LeaguePlayer {
  id: number;
  user_id: number;
  ign: string;
  riot_id: string;
  cur_rank: string;
  server: string;
}

const LolPlayersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [players, setPlayers] = useState<LeaguePlayer[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<LeaguePlayer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPlayers(players);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = players.filter(
        (player) =>
          player.ign.toLowerCase().includes(term) ||
          player.riot_id.toLowerCase().includes(term) ||
          player.cur_rank.toLowerCase().includes(term) ||
          player.server.toLowerCase().includes(term)
      );
      setFilteredPlayers(filtered);
    }
  }, [searchTerm, players]);

  const fetchPlayers = async () => {
    try {
      setIsLoading(true);

      const data = await leagueAPI.getAllStats();
      setPlayers(data);
      setFilteredPlayers(data);

    } catch (error) {
      console.error("Error fetching players:", error);
      setPlayers([]);
      setFilteredPlayers([]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleCreatePortfolio = () => {
    if (!user) {
      navigate("/login");
    } else {
      navigate("/players/lol/create");
    }
  };

  return (
    <div className="players-page">
      <div className="players-header">
        <div className="header-content">
          <h1 className="page-title">LEAGUE OF LEGENDS PLAYERS</h1>
        </div>
      </div>

      <div className="players-controls">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search by IGN, Riot ID, rank, or server..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <p className="search-icon">🔎︎</p>
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
                Showing {filteredPlayers.length}{" "}
                {filteredPlayers.length === 1 ? "player" : "players"}
              </div>

              <div className="players-grid">
                {filteredPlayers.map((player) => (
                  <PlayerCard
                    key={player.id}
                    user_id={player.user_id}
                    username={player.ign}
                    in_game_id={player.riot_id}
                    current_rank={player.cur_rank}
                    onClick={() =>
                      navigate(`/players/${player.ign}/lol`)
                    }
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default LolPlayersPage;
