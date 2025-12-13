import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

const CreatePubgPortfolioPage = () => {
  const navigate = useNavigate();
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
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const ranks = ['Gold', 'Platinum', 'Diamond', 'Crown', 'Ace', 'Conqueror'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        alert('Please select a valid video file');
        return;
      }
      // Validate file size (max 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB in bytes
      if (file.size > maxSize) {
        alert('Video file size must be less than 100MB');
        return;
      }
      setVideoFile(file);
    }
  };

  const saveVideoLocally = async (file: File, userId: number) => {
    // Create a download link to save the file with the correct name
    const blob = new Blob([file], { type: file.type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${userId}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Note: After download, manually move the file to Frontend/my-app/public/Pubg-Highlights/
    alert(`Video downloaded as ${userId}.mp4. Please move it to the public/Pubg-Highlights folder.`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/games/pubg/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 1, // TODO: Replace with actual logged-in user ID
          username: formData.username,
          in_game_id: formData.in_game_id,
          fd_ratio: Number(formData.fd_ratio) || 0,
          current_rank: formData.current_rank,
          highest_rank: formData.highest_rank,
          headshot_rate: Number(formData.headshot_rate) || 0,
          headshots: Number(formData.headshots) || 0,
          eliminations: Number(formData.eliminations) || 0,
          most_eliminations: Number(formData.most_eliminations) || 0,
          matches_played: Number(formData.matches_played) || 0,
          wins: Number(formData.wins) || 0,
          top_10: Number(formData.top_10) || 0,
          avg_damage: Number(formData.avg_damage) || 0,
          avg_survival_time: Number(formData.avg_survival_time) || 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create portfolio');
      }

      const data = await response.json();
      console.log('Portfolio created:', data);
      
      // Handle video file if selected
      if (videoFile) {
        const userId = 1; // TODO: Use actual user_id from response or context
        await saveVideoLocally(videoFile, userId);
      }
      
      alert('Portfolio created successfully!');
      navigate('/players/pubg');
    } catch (error) {
      console.error('Error creating portfolio:', error);
      alert(error instanceof Error ? error.message : 'Failed to create portfolio. Please try again.');
    }
  };

  return (
    <div className="create-portfolio-page">
      <div className="page-container">
        <div className="page-header">
          <h1>Create PUBG Portfolio</h1>
          <button className="back-btn" onClick={() => navigate('/players/pubg')}>
            ← Back to Players
          </button>
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
            <h3>Gameplay Highlights</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="highlight_video">Best Gameplay Highlights (MP4 Video)</label>
                <input
                  type="file"
                  id="highlight_video"
                  name="highlight_video"
                  accept="video/mp4,video/*"
                  onChange={handleVideoChange}
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
            <button type="button" className="cancel-btn" onClick={() => navigate('/players/pubg')}>
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

export default CreatePubgPortfolioPage
