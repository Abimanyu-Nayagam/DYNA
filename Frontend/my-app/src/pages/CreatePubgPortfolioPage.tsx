import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { pubgAPI } from '@/services/api'
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
  const { user, token, loading } = useAuth();
  const [formData, setFormData] = useState<PubgFormData>({
    username: '',
    in_game_id: '',
    fd_ratio: '',
    current_rank: 'Bronze',
    highest_rank: 'Bronze',
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
  const [isUpdate, setIsUpdate] = useState(false);
  const [existingStatsId, setExistingStatsId] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      alert('Please login to create a portfolio');
      navigate('/login');
      return;
    }

    // Check if user already has a portfolio
    if (!loading && user && user.user_id) {
      checkExistingPortfolio();
    }
  }, [user, loading, navigate]);

  const checkExistingPortfolio = async () => {
    if (!user?.user_id) return;

    try {
      const existingStats = await pubgAPI.getStatsByUser(user.user_id);
      if (existingStats) {
        // Populate form with existing data
        setFormData({
          username: existingStats.username || '',
          in_game_id: existingStats.in_game_id || '',
          fd_ratio: existingStats.fd_ratio?.toString() || '',
          current_rank: existingStats.current_rank || 'Bronze',
          highest_rank: existingStats.highest_rank || 'Bronze',
          headshot_rate: existingStats.headshot_rate?.toString() || '',
          headshots: existingStats.headshots?.toString() || '',
          eliminations: existingStats.eliminations?.toString() || '',
          most_eliminations: existingStats.most_eliminations?.toString() || '',
          matches_played: existingStats.matches_played?.toString() || '',
          wins: existingStats.wins?.toString() || '',
          top_10: existingStats.top_10?.toString() || '',
          avg_damage: existingStats.avg_damage?.toString() || '',
          avg_survival_time: existingStats.avg_survival_time?.toString() || ''
        });
        setExistingStatsId(existingStats.id);
        setIsUpdate(true);
      }
    } catch (error) {
      // No existing portfolio, continue with creation
      console.log('No existing portfolio found, proceeding with creation');
    }
  };

  const ranks = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Crown', 'Ace', 'Conqueror'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !user) {
      alert("Please login to create a portfolio");
      navigate("/login");
      return;
    }

    try {
      const form = new FormData();

      // Convert empty strings to 0 for number fields
      const numberFields = [
        "fd_ratio",
        "headshot_rate",
        "headshots",
        "eliminations",
        "most_eliminations",
        "matches_played",
        "wins",
        "top_10",
        "avg_damage",
        "avg_survival_time",
      ];

      Object.entries(formData).forEach(([key, value]) => {
        if (numberFields.includes(key)) {
          form.append(key, value === "" ? "0" : value.toString());
        } else {
          form.append(key, value.toString());
        }
      });

      // Add video if selected
      if (videoFile) {
        form.append("video", videoFile);
      }

      const url =
        isUpdate && existingStatsId
          ? `http://localhost:5000/games/pubg/stats/${existingStatsId}`
          : `http://localhost:5000/games/pubg/stats`;

      const response = await fetch(url, {
        method: isUpdate ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Do NOT set Content-Type manually
        },
        body: form,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save portfolio");
      }

      const data = await response.json();
      alert(
        isUpdate
          ? "Portfolio updated successfully!"
          : "Portfolio created successfully!"
      );
      navigate("/players/pubg");
    } catch (error) {
      console.error("Error saving portfolio:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save portfolio. Please try again."
      );
    }
  };

  if (loading) {
    return (
      <div className="create-portfolio-page">
        <div className="page-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="create-portfolio-page">
      <div className="page-container">
        <div className="page-header">
          <h1>{isUpdate ? 'Update PUBG Portfolio' : 'Create PUBG Portfolio'}</h1>
          {isUpdate && (
            <div className="update-message">
              You can have only one portfolio per game, update details if needed
            </div>
          )}
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
                <label htmlFor="fd_ratio">F/D Ratio</label>
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
              {isUpdate ? 'Update Portfolio' : 'Create Portfolio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePubgPortfolioPage
