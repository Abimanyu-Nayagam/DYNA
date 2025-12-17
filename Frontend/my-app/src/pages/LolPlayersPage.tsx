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
  server: string;
  cur_rank: string;
  peak_rank: string;
  last_season_rank: string;
  player_since: string;
  main_role: string;
  cs_per_min: number | null;
  avg_kills: number | null;
  avg_deaths: number | null;
  avg_assists: number | null;
  avg_dmg: number | null;
  avg_vision_score: number | null;
  avg_game_duration: number | null;
  created_at: string | null;
  updated_at: string | null;
}

const LolPlayersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [players, setPlayers] = useState<LeaguePlayer[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<LeaguePlayer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdate, setIsUpdate] = useState(false);

  useEffect(() => {
    checkExistingPortfolio();
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

  const checkExistingPortfolio = async () => {
      if (!user?.user_id) return;
  
      try {
        const res = await leagueAPI.getIgnByUserId(user.user_id);
        const existingStats = await leagueAPI.getStatsByUser(res.ign);
        if (existingStats) {
          setIsUpdate(true);
        }
      } catch (error) {
        console.log("No existing portfolio found, proceeding with creation");
      }
    };

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
    <div className="lol-players-page">
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

        <button
          className="create-portfolio-btn"
          onClick={handleCreatePortfolio}
        >
          {isUpdate ? " Update Portfolio" : " + Create Portfolio"}
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
