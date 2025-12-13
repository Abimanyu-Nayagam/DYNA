import { useState } from 'react'
import '@/styles/createportfolio.css'

interface PubgFormData {
  username: string;
  in_game_id: string;
  fd_ratio: number | string;
  current_rank: string;
  highest_rank: string;
  headshot_rate: number | string;
  headshots: number | string;
  eliminations: number | string;
  most_eliminations: number | string;
  matches_played: number | string;
  wins: number | string;
  top_10: number | string;
  avg_damage: number | string;
  avg_survival_time: number | string;
}

const CreatePubgPortfolio = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState<PubgFormData>({
    username: '',
    in_game_id: '',
    fd_ratio: '',
    current_rank: 'Gold',
    highest_rank: 'Gold',
    headshot_rate: '',
    headshots: '',
    eliminations: '',
    most_eliminations: '',
    matches_played: '',
    wins: '',
    top_10: '',
    avg_damage: '',
    avg_survival_time: ''
  });

  const ranks = ['Gold', 'Platinum', 'Diamond', 'Crown', 'Ace', 'Conqueror'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Add API call to create PUBG stats
    console.log('Form submitted:', formData);
    
    // For now, just show success message
    alert('Portfolio created successfully!');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create PUBG Portfolio</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="portfolio-form">
          <div className="form-section">
            <h3>Player Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="username">Username *</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Enter your username"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="in_game_id">In-Game ID *</label>
                <input
                  type="text"
                  id="in_game_id"
                  name="in_game_id"
                  value={formData.in_game_id}
                  onChange={handleChange}
                  required
                  placeholder="Enter your PUBG ID"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Ranks</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="current_rank">Current Rank *</label>
                <select
                  id="current_rank"
                  name="current_rank"
                  value={formData.current_rank}
                  onChange={handleChange}
                  required
                >
                  {ranks.map(rank => (
                    <option key={rank} value={rank}>{rank}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="highest_rank">Highest Rank *</label>
                <select
                  id="highest_rank"
                  name="highest_rank"
                  value={formData.highest_rank}
                  onChange={handleChange}
                  required
                >
                  {ranks.map(rank => (
                    <option key={rank} value={rank}>{rank}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Combat Stats</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fd_ratio">K/D Ratio</label>
                <input
                  type="number"
                  step="0.01"
                  id="fd_ratio"
                  name="fd_ratio"
                  value={formData.fd_ratio}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="eliminations">Total Eliminations</label>
                <input
                  type="number"
                  id="eliminations"
                  name="eliminations"
                  value={formData.eliminations}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="headshots">Headshots</label>
                <input
                  type="number"
                  id="headshots"
                  name="headshots"
                  value={formData.headshots}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="headshot_rate">Headshot Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  id="headshot_rate"
                  name="headshot_rate"
                  value={formData.headshot_rate}
                  onChange={handleChange}
                  placeholder="0.0"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="most_eliminations">Most Eliminations (Single Match)</label>
                <input
                  type="number"
                  id="most_eliminations"
                  name="most_eliminations"
                  value={formData.most_eliminations}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="avg_damage">Average Damage</label>
                <input
                  type="number"
                  step="0.1"
                  id="avg_damage"
                  name="avg_damage"
                  value={formData.avg_damage}
                  onChange={handleChange}
                  placeholder="0.0"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Match Statistics</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="matches_played">Matches Played</label>
                <input
                  type="number"
                  id="matches_played"
                  name="matches_played"
                  value={formData.matches_played}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="wins">Wins</label>
                <input
                  type="number"
                  id="wins"
                  name="wins"
                  value={formData.wins}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="top_10">Top 10 Finishes</label>
                <input
                  type="number"
                  id="top_10"
                  name="top_10"
                  value={formData.top_10}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="avg_survival_time">Avg Survival Time (min)</label>
                <input
                  type="number"
                  step="0.1"
                  id="avg_survival_time"
                  name="avg_survival_time"
                  value={formData.avg_survival_time}
                  onChange={handleChange}
                  placeholder="0.0"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Create Portfolio
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePubgPortfolio
