import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { valorantAPI } from '@/services/api';
import '@/styles/valorantprofile.css';

// 📝 TypeScript Interfaces
interface UserData {
    user_id: number;
    user_name: string;
    email: string;
    created_at: string;
}

interface ValorantProfile {
    id: number;
    user_id: number;
    player_name: string;
    riot_id: string;
    tagline: string;
    full_riot_id: string;
    region: string;
    server: string;
    started_playing: string;
    current_rank: string;
    current_act: {
        season: string;
        act_number: number;
    };
    peak_rank: string;
    peak_act: {
        season: string;
        act_number: number;
        date: string;
    };
    kd: number;
    win_rate: number;
    total_matches: number;
    hours_played: number;
    main_role: string;
    playstyle_description: string;
    aggressiveness: number;
    utility_usage: number;
    anchoring_skill: number;
    lurking_skill: number;
    entry_confidence: number;
    best_agent: string;
    top_agents: string[];
    in_team: boolean;
    current_team: string | null;
    role_in_team: string | null;
    been_in_team_before: boolean;
    team_history: TeamHistoryItem[];
    tournaments: TournamentItem[];
    media_clips: string[];
    banner_url: string | null;
    bio: string | null;
    notes: string | null;
    is_public: boolean;
}

interface TeamHistoryItem {
    team_name: string;
    joined_at: string;
    left_at: string | null;
    website: string | null;
}

interface TournamentItem {
    name: string;
    organizer: string | null;
    year: number;
    placement: string | null;
    role_in_tournament: string | null;
    notes: string | null;
}

// 🎯 Helper Component: Stat Card with Inline Edit
const StatCard = ({ icon, label, value, color, isOwner, isEditMode, onSave }: any) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);

    const handleSave = () => {
        onSave(editValue);
        setIsEditing(false);
    };

    return (
        <div className="stat-card" style={{ borderColor: color }}>
            <div className="stat-icon" style={{ color }}>{icon}</div>
            <div className="stat-content">
                <span className="stat-label">{label}</span>
                {isEditing ? (
                    <div className="stat-edit">
                        <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="stat-input"
                        />
                        <button onClick={handleSave} className="save-btn-mini">✓</button>
                        <button onClick={() => setIsEditing(false)} className="cancel-btn-mini">✕</button>
                    </div>
                ) : (
                    <div className="stat-value-container">
                        <span className="stat-value" style={{ color }}>{value}</span>
                        {isOwner && isEditMode && (
                            <button onClick={() => setIsEditing(true)} className="edit-icon-mini">✏️</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// 📊 Helper Component: Stat Bar (0-10 scale)
const StatBar = ({ label, value }: { label: string; value: number }) => {
    const percentage = (value / 10) * 100;
    const getColor = () => {
        if (value >= 7) return '#00F5A0';
        if (value >= 4) return '#B832FF';
        return '#7C4DFF';
    };

    return (
        <div className="stat-bar-container">
            <div className="stat-bar-header">
                <span className="stat-bar-label">{label}</span>
                <span className="stat-bar-value" style={{ color: getColor() }}>
                    {value}/10
                </span>
            </div>
            <div className="stat-bar-track">
                <div
                    className="stat-bar-fill"
                    style={{
                        width: `${percentage}%`,
                        background: `linear-gradient(90deg, ${getColor()}, ${getColor()}99)`
                    }}
                />
            </div>
        </div>
    );
};

const ValorantProfilePage = () => {
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    // 📊 State Management
    const [userData, setUserData] = useState<UserData | null>(null);
    const [profile, setProfile] = useState<ValorantProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOwner, setIsOwner] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // 📝 Edit form state
    const [editValues, setEditValues] = useState<any>({});

    // 🔄 Load profile on mount
    useEffect(() => {
        if (username) {
            loadProfile();
        }
    }, [username]);

    // 📡 API Call: Load user + valorant profile
    const loadProfile = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Call backend: GET /user/:username (gets DYNA user + games)
            const response = await fetch(`http://localhost:5000/players/${username}`);

            if (!response.ok) {
                throw new Error('Profile not found');
            }

            const data = await response.json();

            // Extract user data
            const userData: UserData = {
                user_id: data.data.user_id,
                user_name: data.data.user_name,
                email: data.data.email || '',
                created_at: data.data.created_at || ''
            };
            setUserData(userData);

            // Check if user has Valorant profile
            if (data.data.games && data.data.games.valorant) {
                setProfile(data.data.games.valorant);

                // Check if current user is the owner
                if (user && user.user_id === userData.user_id) {
                    setIsOwner(true);
                }
            } else {
                setError('No Valorant profile found');
            }

        } catch (err: any) {
            console.error('Error loading profile:', err);
            setError(err.message || 'Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    // ✏️ Toggle edit mode
    const toggleEditMode = () => {
        if (!isEditMode && profile) {
            // Entering edit mode - populate form
            setEditValues({ ...profile });
        }
        setIsEditMode(!isEditMode);
    };

    // 💾 Save single field (PATCH request)
    const saveField = async (fieldName: string, value: any) => {
        try {
            const updateData = { [fieldName]: value };

            // Call backend: PATCH /api/valorant/me
            const response = await valorantAPI.updateProfile(updateData);

            // Update local state
            setProfile(response);
            alert('✅ Updated successfully!');

        } catch (err: any) {
            console.error('Error updating field:', err);
            alert('❌ Failed to update. Please try again.');
        }
    };

    // 🗑️ Delete profile
    const deleteProfile = async () => {
        try {
            await valorantAPI.deleteProfile();
            alert('Profile deleted successfully');
            navigate('/players/valorant');
        } catch (err: any) {
            console.error('Error deleting profile:', err);
            alert('Failed to delete profile');
        }
    };

    // 🎨 Agent color helper
    const getAgentColor = (agent: string): string => {
        const colors: { [key: string]: string } = {
            'Jett': '#89CFF0',
            'Reyna': '#A020F0',
            'Raze': '#FF6B35',
            'Phoenix': '#FFA500',
            'Sage': '#00FF88',
            'Cypher': '#FFD700',
            'Sova': '#4A90E2',
            'Omen': '#6A5ACD',
            'Viper': '#00FF00',
        };
        return colors[agent] || '#8b5cf6';
    };

    // ⏳ Loading state
    if (isLoading) {
        return (
            <div className="valorant-profile-loading">
                <div className="loading-spinner-large"></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    // ❌ Error state
    if (error || !userData || !profile) {
        return (
            <div className="valorant-profile-error">
                <h2>⚠️ Profile Not Found</h2>
                <p>{error || 'This user does not have a Valorant profile yet.'}</p>
                <button onClick={() => navigate('/players/valorant')} className="back-btn">
                    ← Back to Search
                </button>
            </div>
        );
    }

    return (
        <div className="valorant-profile-page">
            {/* 🎨 Hero Section with Banner */}
            <div
                className="profile-hero"
                style={{
                    backgroundImage: profile.banner_url
                        ? `url(${profile.banner_url})`
                        : 'linear-gradient(135deg, #1a0033 0%, #0f001f 100%)'
                }}
            >
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    {/* 👤 User Info (DYNA) */}
                    <div className="user-section">
                        <div className="user-avatar">
                            {userData.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                            <h1 className="dyna-username">{userData.user_name}</h1>
                            <p className="dyna-email">{userData.email}</p>
                        </div>
                    </div>

                    {/* 🎮 Valorant Info */}
                    <div className="valorant-section">
                        <h2 className="player-name">{profile.player_name}</h2>
                        <p className="riot-id">{profile.full_riot_id}</p>

                        {/* 🏆 Rank Badges */}
                        <div className="rank-badges">
                            <div className="rank-badge current">
                                <span className="badge-label">Current</span>
                                <span className="badge-rank">{profile.current_rank}</span>
                                <span className="badge-season">
                                    {profile.current_act.season} Act {profile.current_act.act_number}
                                </span>
                            </div>
                            <div className="rank-badge peak">
                                <span className="badge-label">Peak</span>
                                <span className="badge-rank">{profile.peak_rank}</span>
                                <span className="badge-season">
                                    {profile.peak_act.season} Act {profile.peak_act.act_number}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ✏️ Edit/Delete Buttons (Owner Only) */}
                    {isOwner && (
                        <div className="owner-controls">
                            <button
                                className="edit-mode-btn"
                                onClick={toggleEditMode}
                            >
                                {isEditMode ? '✅ Done Editing' : '✏️ Edit Profile'}
                            </button>
                            <button
                                className="delete-btn"
                                onClick={() => setShowDeleteModal(true)}
                            >
                                🗑️ Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 📊 Profile Content */}
            <div className="profile-content">

                {/* 📈 Core Stats Section */}
                <section className="stats-section">
                    <h2 className="section-title">⚡ Performance Stats</h2>
                    <div className="stats-grid">
                        <StatCard
                            icon="🎯"
                            label="K/D Ratio"
                            value={profile.kd.toFixed(2)}
                            color="#00F5A0"
                            isOwner={isOwner}
                            isEditMode={isEditMode}
                            onSave={(val) => saveField('kd', parseFloat(val))}
                        />
                        <StatCard
                            icon="🏆"
                            label="Win Rate"
                            value={`${profile.win_rate.toFixed(1)}%`}
                            color="#B832FF"
                            isOwner={isOwner}
                            isEditMode={isEditMode}
                            onSave={(val) => saveField('win_rate', parseFloat(val))}
                        />
                        <StatCard
                            icon="🎮"
                            label="Total Matches"
                            value={profile.total_matches.toString()}
                            color="#7C4DFF"
                            isOwner={isOwner}
                            isEditMode={isEditMode}
                            onSave={(val) => saveField('total_matches', parseInt(val))}
                        />
                        <StatCard
                            icon="⏱️"
                            label="Hours Played"
                            value={profile.hours_played.toString()}
                            color="#00F5A0"
                            isOwner={isOwner}
                            isEditMode={isEditMode}
                            onSave={(val) => saveField('hours_played', parseFloat(val))}
                        />
                    </div>
                </section>

                {/* 🎯 Playstyle Section */}
                <section className="playstyle-section">
                    <h2 className="section-title">🎮 Playstyle Analysis</h2>
                    <div className="playstyle-card">
                        <div className="playstyle-header">
                            <span className="role-badge">{profile.main_role}</span>
                            {isOwner && isEditMode && (
                                <button className="edit-icon" title="Edit">✏️</button>
                            )}
                        </div>
                        <p className="playstyle-description">{profile.playstyle_description}</p>

                        <div className="playstyle-bars">
                            <StatBar label="Aggressiveness" value={profile.aggressiveness} />
                            <StatBar label="Utility Usage" value={profile.utility_usage} />
                            <StatBar label="Entry Confidence" value={profile.entry_confidence} />
                            <StatBar label="Lurking Skill" value={profile.lurking_skill} />
                            <StatBar label="Anchoring Skill" value={profile.anchoring_skill} />
                        </div>
                    </div>
                </section>

                {/* 🦸 Agents Section */}
                <section className="agents-section">
                    <h2 className="section-title">🦸 Agent Pool</h2>
                    <div className="agents-grid">
                        {/* Best Agent - Featured */}
                        <div className="best-agent-card">
                            <div className="best-badge">⭐ BEST</div>
                            <div
                                className="agent-icon-large"
                                style={{
                                    background: `linear-gradient(135deg, ${getAgentColor(profile.best_agent)}88, ${getAgentColor(profile.best_agent)}44)`
                                }}
                            >
                                {profile.best_agent[0]}
                            </div>
                            <h3 className="agent-name">{profile.best_agent}</h3>
                        </div>

                        {/* Top Agents */}
                        {profile.top_agents.map((agent, idx) => (
                            <div
                                key={idx}
                                className="agent-card"
                                style={{
                                    borderColor: getAgentColor(agent)
                                }}
                            >
                                <div
                                    className="agent-icon"
                                    style={{
                                        background: `linear-gradient(135deg, ${getAgentColor(agent)}88, ${getAgentColor(agent)}44)`
                                    }}
                                >
                                    {agent[0]}
                                </div>
                                <span className="agent-name">{agent}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 👥 Team Section */}
                {(profile.in_team || profile.been_in_team_before) && (
                    <section className="team-section">
                        <h2 className="section-title">👥 Team Information</h2>

                        {profile.in_team && profile.current_team && (
                            <div className="current-team-card">
                                <h3>Current Team</h3>
                                <p className="team-name">{profile.current_team}</p>
                                {profile.role_in_team && (
                                    <p className="team-role">Role: {profile.role_in_team}</p>
                                )}
                            </div>
                        )}

                        {profile.team_history && profile.team_history.length > 0 && (
                            <div className="team-history">
                                <h3>Team History</h3>
                                <div className="teams-list">
                                    {profile.team_history.map((team, idx) => (
                                        <div key={idx} className="team-item">
                                            <div className="team-item-header">
                                                <span className="team-item-name">{team.team_name}</span>
                                                {team.website && (
                                                    <a href={team.website} target="_blank" rel="noopener noreferrer" className="team-link">
                                                        🔗
                                                    </a>
                                                )}
                                            </div>
                                            <p className="team-dates">
                                                {new Date(team.joined_at).toLocaleDateString()} -
                                                {team.left_at ? new Date(team.left_at).toLocaleDateString() : 'Present'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* 🏆 Tournaments Section */}
                {profile.tournaments && profile.tournaments.length > 0 && (
                    <section className="tournaments-section">
                        <h2 className="section-title">🏆 Tournament History</h2>
                        <div className="tournaments-list">
                            {profile.tournaments.map((tournament, idx) => (
                                <div key={idx} className="tournament-card">
                                    <h3>{tournament.name}</h3>
                                    {tournament.organizer && <p className="tournament-organizer">by {tournament.organizer}</p>}
                                    <div className="tournament-details">
                                        <span className="tournament-year">{tournament.year}</span>
                                        {tournament.placement && (
                                            <span className="tournament-placement">{tournament.placement}</span>
                                        )}
                                        {tournament.role_in_tournament && (
                                            <span className="tournament-role">{tournament.role_in_tournament}</span>
                                        )}
                                    </div>
                                    {tournament.notes && <p className="tournament-notes">{tournament.notes}</p>}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 🎬 Media Clips Section */}
                {profile.media_clips && profile.media_clips.length > 0 && (
                    <section className="media-section">
                        <h2 className="section-title">🎬 Highlight Clips</h2>
                        <div className="media-grid">
                            {profile.media_clips.map((clip, idx) => (
                                <div key={idx} className="media-item">
                                    <video controls className="media-video">
                                        <source src={clip} type="video/mp4" />
                                    </video>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 📝 Bio Section */}
                {profile.bio && (
                    <section className="bio-section">
                        <h2 className="section-title">📝 About</h2>
                        <div className="bio-card">
                            <p>{profile.bio}</p>
                        </div>
                    </section>
                )}
            </div>

            {/* 🗑️ Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>⚠️ Delete Profile?</h3>
                        <p>This action cannot be undone. Your Valorant profile will be permanently deleted.</p>
                        <div className="modal-actions">
                            <button onClick={() => setShowDeleteModal(false)} className="cancel-btn">
                                Cancel
                            </button>
                            <button onClick={deleteProfile} className="confirm-delete-btn">
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ValorantProfilePage;