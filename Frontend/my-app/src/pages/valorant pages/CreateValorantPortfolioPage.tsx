import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { valorantAPI } from '@/services/api';
import '@/styles/valorant/valorantCreatePortfolio.css';

// 📋 Interfaces
interface ValorantFormData {
    riot_id: string;
    tagline: string;
    region: string;
    server: string;
    started_playing: string;
    current_rank: string;
    current_season: string;
    current_act_number: number | string;
    peak_rank: string;
    peak_season: string;
    peak_act_number: number | string;
    peak_rank_date: string;
    kd: number | string;
    win_rate: number | string;
    total_matches: number | string;
    hours_played: number | string;
    main_role: string;
    playstyle_description: string;
    aggressiveness: number | string;
    utility_usage: number | string;
    anchoring_skill: number | string;
    lurking_skill: number | string;
    entry_confidence: number | string;
    best_agent: string;
    top_agents: string[];
    in_team: boolean;
    current_team: string;
    role_in_team: string;
    been_in_team_before: boolean;
    bio: string;
    is_public: boolean;
}

interface TeamHistoryItem {
    team_name: string;
    joined_at: string;
    left_at: string;
    website: string;
}

interface TournamentItem {
    name: string;
    organizer: string;
    year: number | string;
    placement: string;
    role_in_tournament: string;
    notes: string;
}

// 🌍 Constants
const REGION_SERVERS: Record<string, string[]> = {
    "North America": ["Virginia", "Oregon", "Texas", "California"],
    "Europe": ["Frankfurt", "London", "Amsterdam"],
    "Asia-Pacific": ["Mumbai", "Singapore", "Manila"],
    "Korea": ["Seoul"],
    "Japan": ["Tokyo", "Osaka"],
    "Brazil": ["Sao Paulo"],
    "LATAM": ["Texas", "California"],
    "MEA": ["Dubai", "Frankfurt"]
};

const AGENTS = [
    'Astra', 'Breach', 'Brimstone', 'Chamber', 'Cypher', 'Deadlock',
    'Fade', 'Gekko', 'Harbor', 'Iso', 'Jett', 'KAY/O', 'Killjoy',
    'Neon', 'Omen', 'Phoenix', 'Raze', 'Reyna', 'Sage', 'Skye',
    'Sova', 'Viper', 'Yoru', 'Waylay', 'Veto', 'Tejo'
] as const;

const RANKS = ['Iron 1', 'Iron 2', 'Iron 3', 'Bronze 1', 'Bronze 2', 'Bronze 3',
    'Silver 1', 'Silver 2', 'Silver 3', 'Gold 1', 'Gold 2', 'Gold 3',
    'Platinum 1', 'Platinum 2', 'Platinum 3', 'Diamond 1', 'Diamond 2', 'Diamond 3',
    'Ascendant 1', 'Ascendant 2', 'Ascendant 3', 'Immortal 1', 'Immortal 2', 'Immortal 3', 'Radiant'];

const SEASONS = ['EP01', 'EP02', 'EP03', 'EP04', 'EP05', 'EP06', 'EP07', 'EP08', 'EP09', 'V24', 'V25'];

// 🛠️ Helper: Get max acts based on season
const getMaxActsForSeason = (season: string): number => {
    return season.startsWith('EP') ? 3 : 6;
};

// 🎯 Main Component
const CreateValorantPortfolioPage = () => {
    const navigate = useNavigate();
    const { user, token, loading } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<ValorantFormData>({
        riot_id: '',
        tagline: '',
        region: 'Asia-Pacific',
        server: 'Mumbai',
        started_playing: '',
        current_rank: 'Iron 1',
        current_season: 'EP09',
        current_act_number: 1,
        peak_rank: 'Iron 1',
        peak_season: 'EP09',
        peak_act_number: 1,
        peak_rank_date: '',
        kd: '',
        win_rate: '',
        total_matches: '',
        hours_played: '',
        main_role: 'Duelist',
        playstyle_description: '',
        aggressiveness: 5,
        utility_usage: 5,
        anchoring_skill: 5,
        lurking_skill: 5,
        entry_confidence: 5,
        best_agent: 'Jett',
        top_agents: [],
        in_team: false,
        current_team: '',
        role_in_team: '',
        been_in_team_before: false,
        bio: '',
        is_public: false
    });

    const [teamHistory, setTeamHistory] = useState<TeamHistoryItem[]>([]);
    const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profileExists, setProfileExists] = useState(false);

    const availableServers = REGION_SERVERS[formData.region] || [];
    const maxCurrentActs = getMaxActsForSeason(formData.current_season);
    const maxPeakActs = getMaxActsForSeason(formData.peak_season);

    // 📄 Check auth & existing profile
    useEffect(() => {
        if (!loading && !user) {
            alert('Please login to create a portfolio');
            navigate('/login');
            return;
        }
        if (!loading && user) {
            checkExistingProfile();
        }
    }, [user, loading, navigate]);

    const checkExistingProfile = async () => {
        try {
            const profile = await valorantAPI.getMyProfile();
            if (profile && profile.exists) {
                setProfileExists(true);
                alert('You already have a Valorant profile!');
                navigate('/players/valorant/me');
            }
        } catch (error) {
            console.log('No existing profile, proceed with creation');
        }
    };

    // 🧪 Validation
    const validateRiotId = (value: string): string | null => {
        if (value.length < 3 || value.length > 16) {
            return 'Riot ID must be between 3-16 characters';
        }
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
            return 'Riot ID can only contain letters, numbers, and underscores';
        }
        return null;
    };

    const validateTagline = (value: string): string | null => {
        if (value.length < 1 || value.length > 6) {
            return 'Tagline must be 1-6 characters';
        }
        if (!/^[A-Za-z0-9]+$/.test(value)) {
            return 'Tagline can only contain letters and numbers';
        }
        return null;
    };

    // 📝 Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (name === 'region') {
            const newServers = REGION_SERVERS[value] || [];
            setFormData(prev => ({
                ...prev,
                region: value,
                server: newServers[0] || ''
            }));
        } else if (name === 'current_season') {
            const maxActs = getMaxActsForSeason(value);
            setFormData(prev => ({
                ...prev,
                current_season: value,
                current_act_number: Math.min(Number(prev.current_act_number) || 1, maxActs)
            }));
        } else if (name === 'peak_season') {
            const maxActs = getMaxActsForSeason(value);
            setFormData(prev => ({
                ...prev,
                peak_season: value,
                peak_act_number: Math.min(Number(prev.peak_act_number) || 1, maxActs)
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));

            // Real-time validation
            if (name === 'riot_id') {
                const error = validateRiotId(value);
                if (error) {
                    setErrors(prev => ({ ...prev, riot_id: error }));
                } else {
                    setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.riot_id;
                        return newErrors;
                    });
                }
            } else if (name === 'tagline') {
                const error = validateTagline(value);
                if (error) {
                    setErrors(prev => ({ ...prev, tagline: error }));
                } else {
                    setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.tagline;
                        return newErrors;
                    });
                }
            }
        }

        // Clear error on change
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // 🎮 Agent selection
    const handleAgentSelect = (agent: string) => {
        setFormData(prev => {
            const agents = [...prev.top_agents];
            if (agents.includes(agent)) {
                return { ...prev, top_agents: agents.filter(a => a !== agent) };
            } else if (agents.length < 5) {
                return { ...prev, top_agents: [...agents, agent] };
            }
            return prev;
        });
    };

    // ➕/➖ Team history
    const addTeam = () => {
        setTeamHistory([...teamHistory, {
            team_name: '',
            joined_at: '',
            left_at: '',
            website: ''
        }]);
    };

    const removeTeam = (index: number) => {
        setTeamHistory(teamHistory.filter((_, i) => i !== index));
    };

    const handleTeamChange = (index: number, field: string, value: string) => {
        const updated = [...teamHistory];
        updated[index] = { ...updated[index], [field]: value };

        // Validate dates
        if (field === 'left_at' || field === 'joined_at') {
            const team = updated[index];
            if (team.joined_at && team.left_at && team.left_at < team.joined_at) {
                setErrors(prev => ({
                    ...prev,
                    [`team_${index}_left_at`]: 'Leave date cannot be earlier than join date'
                }));
            } else {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[`team_${index}_left_at`];
                    return newErrors;
                });
            }
        }

        setTeamHistory(updated);
    };

    // ➕/➖ Tournaments
    const addTournament = () => {
        setTournaments([...tournaments, {
            name: '',
            organizer: '',
            year: new Date().getFullYear(),
            placement: '',
            role_in_tournament: '',
            notes: ''
        }]);
    };

    const removeTournament = (index: number) => {
        setTournaments(tournaments.filter((_, i) => i !== index));
    };

    const handleTournamentChange = (index: number, field: string, value: string | number) => {
        const updated = [...tournaments];
        updated[index] = { ...updated[index], [field]: value };
        setTournaments(updated);
    };

    // 🎬 Media upload
    const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const validFiles = files.filter(file => {
                // Only allow video files
                if (!file.type.startsWith('video/')) {
                    return false;
                }
                // Max 50MB per file
                if (file.size > 50 * 1024 * 1024) {
                    return false;
                }
                return true;
            });

            if (files.length !== validFiles.length) {
                alert('Some files were skipped (not videos or exceed 50MB limit).');
            }

            setUploadedFiles(prev => [...prev, ...validFiles]);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeUploadedFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    // 📤 Submit handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !user) {
            alert('Please login to create a portfolio');
            navigate('/login');
            return;
        }

        // Final validation
        const validationErrors: Record<string, string> = {};

        const riotIdError = validateRiotId(formData.riot_id);
        if (riotIdError) validationErrors.riot_id = riotIdError;

        const taglineError = validateTagline(formData.tagline);
        if (taglineError) validationErrors.tagline = taglineError;

        if (formData.top_agents.length === 0) {
            validationErrors.top_agents = 'Please select at least 1 agent';
        }

        teamHistory.forEach((team, idx) => {
            if (team.joined_at && team.left_at && team.left_at < team.joined_at) {
                validationErrors[`team_${idx}_left_at`] = 'Leave date cannot be earlier than join date';
            }
        });

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            alert('❌ Please fix the validation errors below');
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            const payload: any = {
                riot_id: formData.riot_id.trim(),
                tagline: formData.tagline.trim(),
                region: formData.region,
                server: formData.server,
                started_playing: formData.started_playing,
                current_rank: formData.current_rank,
                current_season: formData.current_season,
                current_act_number: parseInt(formData.current_act_number.toString()),
                peak_rank: formData.peak_rank,
                peak_season: formData.peak_season,
                peak_act_number: parseInt(formData.peak_act_number.toString()),
                peak_rank_date: formData.peak_rank_date,
                kd: parseFloat(formData.kd.toString()),
                win_rate: parseFloat(formData.win_rate.toString()),
                total_matches: parseInt(formData.total_matches.toString()),
                hours_played: parseFloat(formData.hours_played.toString()),
                main_role: formData.main_role,
                playstyle_description: formData.playstyle_description.trim(),
                aggressiveness: parseInt(formData.aggressiveness.toString()),
                utility_usage: parseInt(formData.utility_usage.toString()),
                anchoring_skill: parseInt(formData.anchoring_skill.toString()),
                lurking_skill: parseInt(formData.lurking_skill.toString()),
                entry_confidence: parseInt(formData.entry_confidence.toString()),
                best_agent: formData.best_agent,
                top_agents: formData.top_agents,
                in_team: formData.in_team,
                current_team: formData.current_team || null,
                role_in_team: formData.role_in_team || null,
                been_in_team_before: formData.been_in_team_before,
                bio: formData.bio || null,
                is_public: formData.is_public,
            };

            if (teamHistory.length > 0 && formData.been_in_team_before) {
                payload.team_history = teamHistory.map(t => ({
                    team_name: t.team_name,
                    joined_at: t.joined_at,
                    left_at: t.left_at || null,
                    website: t.website || null
                }));
            }

            if (tournaments.length > 0) {
                payload.tournaments = tournaments.map(t => ({
                    name: t.name,
                    organizer: t.organizer || null,
                    year: parseInt(t.year.toString()),
                    placement: t.placement || null,
                    role_in_tournament: t.role_in_tournament || null,
                    notes: t.notes || null
                }));
            }

            await valorantAPI.createProfile(payload, uploadedFiles);
            alert('✅ Profile created successfully!');
            navigate(`/players/valorant/me`);

        } catch (error: any) {
            console.error('Error creating profile:', error);
            if (error.response?.data?.details) {
                const backendErrors: Record<string, string> = {};
                error.response.data.details.forEach((err: any) => {
                    const field = err.loc[err.loc.length - 1];
                    backendErrors[field] = err.msg;
                });
                setErrors(backendErrors);
                alert('❌ Please fix the validation errors below');
            } else {
                alert('❌ Failed to create profile. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // ⏳ Loading state
    if (loading || profileExists) {
        return (
            <div className="valo-create-page">
                <div className="valo-loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="valo-create-page">
            <div className="valo-page-container">
                <div className="valo-page-header">
                    <h1>Create Valorant Portfolio</h1>
                    <button className="valo-back-btn" onClick={() => navigate('/players/valorant')}>
                        ← Back to Search
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="valo-portfolio-form">
                    {/* 🚨 Error Banner */}
                    {Object.keys(errors).length > 0 && (
                        <div className="valo-error-banner">
                            ⚠️ Please fix the following errors:
                            <ul>
                                {Object.entries(errors).map(([field, message]) => (
                                    <li key={field}><strong>{field}:</strong> {message}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* 🎯 Identity */}
                    <div className="valo-form-section">
                        <h3>🎮 Identity</h3>
                        <div className="valo-form-row">
                            <div className="valo-form-group">
                                <label htmlFor="riot_id">Riot ID * (without #)</label>
                                <input
                                    type="text"
                                    id="riot_id"
                                    name="riot_id"
                                    value={formData.riot_id}
                                    onChange={handleChange}
                                    required
                                    placeholder="YourName"
                                />
                                {errors.riot_id && <span className="valo-field-error">{errors.riot_id}</span>}
                            </div>
                            <div className="valo-form-group">
                                <label htmlFor="tagline">Tagline * (without #)</label>
                                <input
                                    type="text"
                                    id="tagline"
                                    name="tagline"
                                    value={formData.tagline}
                                    onChange={handleChange}
                                    required
                                    placeholder="1234"
                                    maxLength={6}
                                />
                                {errors.tagline && <span className="valo-field-error">{errors.tagline}</span>}
                                <small className="valo-help-text">Full Riot ID will be: {formData.riot_id}#{formData.tagline}</small>
                            </div>
                        </div>
                    </div>

                    {/* 🌍 Region & Server */}
                    <div className="valo-form-section">
                        <h3>🌍 Region & Server</h3>
                        <div className="valo-form-row">
                            <div className="valo-form-group">
                                <label htmlFor="region">Region *</label>
                                <select id="region" name="region" value={formData.region} onChange={handleChange} required>
                                    <option value="North America">North America</option>
                                    <option value="Europe">Europe</option>
                                    <option value="Asia-Pacific">Asia-Pacific</option>
                                    <option value="Korea">Korea</option>
                                    <option value="Japan">Japan</option>
                                    <option value="Brazil">Brazil</option>
                                    <option value="LATAM">LATAM</option>
                                    <option value="MEA">MEA</option>
                                </select>
                            </div>
                            <div className="valo-form-group">
                                <label htmlFor="server">Server *</label>
                                <select id="server" name="server" value={formData.server} onChange={handleChange} required>
                                    {availableServers.map(server => (
                                        <option key={server} value={server}>{server}</option>
                                    ))}
                                </select>
                                <small className="valo-help-text">Available servers for {formData.region}</small>
                            </div>
                        </div>
                        <div className="valo-form-row">
                            <div className="valo-form-group">
                                <label htmlFor="started_playing">Started Playing *</label>
                                <input
                                    type="date"
                                    id="started_playing"
                                    name="started_playing"
                                    value={formData.started_playing}
                                    onChange={handleChange}
                                    required
                                    min="2020-06-02"
                                    max={new Date().toISOString().split('T')[0]}
                                />
                                {errors.started_playing && <span className="valo-field-error">{errors.started_playing}</span>}
                                <small className="valo-help-text">Valorant released June 2, 2020</small>
                            </div>
                        </div>
                    </div>

                    {/* 🏆 Current Rank */}
                    <div className="valo-form-section">
                        <h3>🏆 Current Rank</h3>
                        <div className="valo-form-row">
                            <div className="valo-form-group">
                                <label htmlFor="current_rank">Current Rank *</label>
                                <select id="current_rank" name="current_rank" value={formData.current_rank} onChange={handleChange} required>
                                    {RANKS.map(rank => (
                                        <option key={rank} value={rank}>{rank}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="valo-form-group">
                                <label htmlFor="current_season">Current Season *</label>
                                <select id="current_season" name="current_season" value={formData.current_season} onChange={handleChange} required>
                                    {SEASONS.map(season => (
                                        <option key={season} value={season}>{season}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="valo-form-group">
                                <label htmlFor="current_act_number">Act Number *</label>
                                <select
                                    id="current_act_number"
                                    name="current_act_number"
                                    value={formData.current_act_number}
                                    onChange={handleChange}
                                    required
                                >
                                    {Array.from({ length: maxCurrentActs }, (_, i) => i + 1).map(act => (
                                        <option key={act} value={act}>Act {act}</option>
                                    ))}
                                </select>
                                <small className="valo-help-text">{formData.current_season} has {maxCurrentActs} acts</small>
                            </div>
                        </div>
                    </div>

                    {/* 👑 Peak Rank */}
                    <div className="valo-form-section">
                        <h3>👑 Peak Rank</h3>
                        <div className="valo-form-row">
                            <div className="valo-form-group">
                                <label htmlFor="peak_rank">Peak Rank *</label>
                                <select id="peak_rank" name="peak_rank" value={formData.peak_rank} onChange={handleChange} required>
                                    {RANKS.map(rank => (
                                        <option key={rank} value={rank}>{rank}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="valo-form-group">
                                <label htmlFor="peak_season">Peak Season *</label>
                                <select id="peak_season" name="peak_season" value={formData.peak_season} onChange={handleChange} required>
                                    {SEASONS.map(season => (
                                        <option key={season} value={season}>{season}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="valo-form-group">
                                <label htmlFor="peak_act_number">Peak Act *</label>
                                <select
                                    id="peak_act_number"
                                    name="peak_act_number"
                                    value={formData.peak_act_number}
                                    onChange={handleChange}
                                    required
                                >
                                    {Array.from({ length: maxPeakActs }, (_, i) => i + 1).map(act => (
                                        <option key={act} value={act}>Act {act}</option>
                                    ))}
                                </select>
                                <small className="valo-help-text">{formData.peak_season} has {maxPeakActs} acts</small>
                            </div>
                        </div>
                        <div className="valo-form-row">
                            <div className="valo-form-group">
                                <label htmlFor="peak_rank_date">Peak Rank Date *</label>
                                <input
                                    type="date"
                                    id="peak_rank_date"
                                    name="peak_rank_date"
                                    value={formData.peak_rank_date}
                                    onChange={handleChange}
                                    required
                                    min="2020-06-02"
                                    max={new Date().toISOString().split('T')[0]}
                                />
                                {errors.peak_rank_date && <span className="valo-field-error">{errors.peak_rank_date}</span>}
                            </div>
                        </div>
                    </div>

                    {/* 📊 Core Stats */}
                    <div className="valo-form-section">
                        <h3>📊 Core Statistics</h3>
                        <div className="valo-form-row">
                            <div className="valo-form-group">
                                <label htmlFor="kd">K/D Ratio *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    id="kd"
                                    name="kd"
                                    value={formData.kd}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    placeholder="1.25"
                                />
                                {errors.kd && <span className="valo-field-error">{errors.kd}</span>}
                            </div>
                            <div className="valo-form-group">
                                <label htmlFor="win_rate">Win Rate (%) *</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    id="win_rate"
                                    name="win_rate"
                                    value={formData.win_rate}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    max="100"
                                    placeholder="55.5"
                                />
                                {errors.win_rate && <span className="valo-field-error">{errors.win_rate}</span>}
                            </div>
                        </div>
                        <div className="valo-form-row">
                            <div className="valo-form-group">
                                <label htmlFor="total_matches">Total Matches *</label>
                                <input
                                    type="number"
                                    id="total_matches"
                                    name="total_matches"
                                    value={formData.total_matches}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    placeholder="500"
                                />
                                {errors.total_matches && <span className="valo-field-error">{errors.total_matches}</span>}
                            </div>
                            <div className="valo-form-group">
                                <label htmlFor="hours_played">Hours Played *</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    id="hours_played"
                                    name="hours_played"
                                    value={formData.hours_played}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    placeholder="1200"
                                />
                                {errors.hours_played && <span className="valo-field-error">{errors.hours_played}</span>}
                            </div>
                        </div>
                    </div>

                    {/* 🎮 Playstyle */}
                    <div className="valo-form-section">
                        <h3>🎮 Playstyle & Role</h3>
                        <div className="valo-form-row">
                            <div className="valo-form-group">
                                <label htmlFor="main_role">Main Role *</label>
                                <select id="main_role" name="main_role" value={formData.main_role} onChange={handleChange} required>
                                    <option value="Duelist">Duelist</option>
                                    <option value="Initiator">Initiator</option>
                                    <option value="Controller">Controller</option>
                                    <option value="Sentinel">Sentinel</option>
                                </select>
                            </div>
                        </div>
                        <div className="valo-form-row">
                            <div className="valo-form-group valo-full-width">
                                <label htmlFor="playstyle_description">Playstyle Description * (max 300 chars)</label>
                                <textarea
                                    id="playstyle_description"
                                    name="playstyle_description"
                                    value={formData.playstyle_description}
                                    onChange={handleChange}
                                    required
                                    maxLength={300}
                                    rows={3}
                                    placeholder="Describe your playstyle..."
                                />
                                <small className="valo-char-count">{formData.playstyle_description.length}/300</small>
                                {errors.playstyle_description && <span className="valo-field-error">{errors.playstyle_description}</span>}
                            </div>
                        </div>
                        <div className="valo-playstyle-sliders">
                            {[
                                { name: 'aggressiveness', label: 'Aggressiveness' },
                                { name: 'utility_usage', label: 'Utility Usage' },
                                { name: 'anchoring_skill', label: 'Anchoring Skill' },
                                { name: 'lurking_skill', label: 'Lurking Skill' },
                                { name: 'entry_confidence', label: 'Entry Confidence' }
                            ].map(skill => (
                                <div key={skill.name} className="valo-slider-group">
                                    <label htmlFor={skill.name}>{skill.label}: {formData[skill.name as keyof ValorantFormData]}/10</label>
                                    <input
                                        type="range"
                                        id={skill.name}
                                        name={skill.name}
                                        min="0"
                                        max="10"
                                        value={formData[skill.name as keyof ValorantFormData] as number}
                                        onChange={handleChange}
                                        className="valo-slider"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 🦸 Agents */}
                    <div className="valo-form-section">
                        <h3>🦸 Agents</h3>
                        <div className="valo-form-row">
                            <div className="valo-form-group">
                                <label htmlFor="best_agent">Best Agent *</label>
                                <select id="best_agent" name="best_agent" value={formData.best_agent} onChange={handleChange} required>
                                    {AGENTS.map(agent => (
                                        <option key={agent} value={agent}>{agent}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="valo-form-group valo-full-width">
                            <label>Top 5 Agents * (select 1-5)</label>
                            <div className="valo-agent-grid">
                                {AGENTS.map(agent => (
                                    <button
                                        key={agent}
                                        type="button"
                                        className={`valo-agent-btn ${formData.top_agents.includes(agent) ? 'selected' : ''}`}
                                        onClick={() => handleAgentSelect(agent)}
                                    >
                                        {agent}
                                    </button>
                                ))}
                            </div>
                            <small className="valo-help-text">Selected: {formData.top_agents.length}/5</small>
                            {errors.top_agents && <span className="valo-field-error">{errors.top_agents}</span>}
                        </div>
                    </div>

                    {/* 👥 Team Info */}
                    <div className="valo-form-section">
                        <h3>👥 Team Information</h3>
                        <div className="valo-checkbox-group">
                            <input
                                type="checkbox"
                                id="in_team"
                                name="in_team"
                                checked={formData.in_team}
                                onChange={handleChange}
                            />
                            <label htmlFor="in_team">Currently in a team</label>
                        </div>
                        {formData.in_team && (
                            <div className="valo-form-row">
                                <div className="valo-form-group">
                                    <label htmlFor="current_team">Current Team Name</label>
                                    <input
                                        type="text"
                                        id="current_team"
                                        name="current_team"
                                        value={formData.current_team}
                                        onChange={handleChange}
                                        placeholder="Team Name"
                                        maxLength={150}
                                    />
                                </div>
                                <div className="valo-form-group">
                                    <label htmlFor="role_in_team">Role in Team</label>
                                    <input
                                        type="text"
                                        id="role_in_team"
                                        name="role_in_team"
                                        value={formData.role_in_team}
                                        onChange={handleChange}
                                        placeholder="e.g., Entry Fragger, IGL"
                                        maxLength={120}
                                    />
                                </div>
                            </div>
                        )}
                        <div className="valo-checkbox-group">
                            <input
                                type="checkbox"
                                id="been_in_team_before"
                                name="been_in_team_before"
                                checked={formData.been_in_team_before}
                                onChange={handleChange}
                            />
                            <label htmlFor="been_in_team_before">Have been in teams before</label>
                        </div>
                        {formData.been_in_team_before && (
                            <div className="valo-team-history">
                                <button type="button" className="valo-add-btn" onClick={addTeam}>+ Add Team History</button>
                                {teamHistory.map((team, idx) => (
                                    <div key={idx} className="valo-team-item">
                                        <button type="button" className="valo-remove-btn-inline" onClick={() => removeTeam(idx)}>✕</button>
                                        <div className="valo-form-row">
                                            <div className="valo-form-group">
                                                <label>Team Name *</label>
                                                <input
                                                    type="text"
                                                    value={team.team_name}
                                                    onChange={(e) => handleTeamChange(idx, 'team_name', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="valo-form-group">
                                                <label>Joined Date *</label>
                                                <input
                                                    type="date"
                                                    value={team.joined_at}
                                                    onChange={(e) => handleTeamChange(idx, 'joined_at', e.target.value)}
                                                    required
                                                    min="2020-06-02"
                                                    max={new Date().toISOString().split('T')[0]}
                                                />
                                            </div>
                                            <div className="valo-form-group">
                                                <label>Left Date (optional)</label>
                                                <input
                                                    type="date"
                                                    value={team.left_at}
                                                    onChange={(e) => handleTeamChange(idx, 'left_at', e.target.value)}
                                                    min={team.joined_at || "2020-06-02"}
                                                    max={new Date().toISOString().split('T')[0]}
                                                />
                                                {errors[`team_${idx}_left_at`] && (
                                                    <span className="valo-field-error">{errors[`team_${idx}_left_at`]}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="valo-form-row">
                                            <div className="valo-form-group valo-full-width">
                                                <label>Team Website (optional)</label>
                                                <input
                                                    type="url"
                                                    value={team.website}
                                                    onChange={(e) => handleTeamChange(idx, 'website', e.target.value)}
                                                    placeholder="https://example.com"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 🏆 Tournaments */}
                    <div className="valo-form-section">
                        <h3>🏆 Tournament History (Optional)</h3>
                        <button type="button" className="valo-add-btn" onClick={addTournament}>+ Add Tournament</button>
                        {tournaments.map((tournament, idx) => (
                            <div key={idx} className="valo-tournament-item">
                                <button type="button" className="valo-remove-btn-inline" onClick={() => removeTournament(idx)}>✕</button>
                                <div className="valo-form-row">
                                    <div className="valo-form-group">
                                        <label>Tournament Name *</label>
                                        <input
                                            type="text"
                                            value={tournament.name}
                                            onChange={(e) => handleTournamentChange(idx, 'name', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="valo-form-group">
                                        <label>Year *</label>
                                        <input
                                            type="number"
                                            value={tournament.year}
                                            onChange={(e) => handleTournamentChange(idx, 'year', parseInt(e.target.value))}
                                            min="2020"
                                            max={new Date().getFullYear()}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="valo-form-row">
                                    <div className="valo-form-group">
                                        <label>Placement (optional)</label>
                                        <input
                                            type="text"
                                            value={tournament.placement}
                                            onChange={(e) => handleTournamentChange(idx, 'placement', e.target.value)}
                                            placeholder="e.g., 1st Place, Top 8"
                                        />
                                    </div>
                                    <div className="valo-form-group">
                                        <label>Your Role (optional)</label>
                                        <input
                                            type="text"
                                            value={tournament.role_in_tournament}
                                            onChange={(e) => handleTournamentChange(idx, 'role_in_tournament', e.target.value)}
                                            placeholder="e.g., Entry, IGL"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 🎬 Media Clips */}
                    <div className="valo-form-section">
                        <h3>🎬 Highlight Clips</h3>
                        <div className="valo-form-row">
                            <div className="valo-form-group valo-full-width">
                                <label>Upload Video Clips (MP4, WebM, AVI) — Max 50MB each</label>
                                <div className="valo-media-upload">
                                    <input
                                        type="file"
                                        multiple
                                        accept="video/*"
                                        onChange={handleMediaUpload}
                                        className="valo-file-input"
                                        ref={fileInputRef}
                                        id="mediaUpload"
                                    />
                                    <label htmlFor="mediaUpload" className="valo-upload-label">
                                        📎 Click to select videos or drag & drop here
                                    </label>
                                </div>
                                {errors.media_clips && <span className="valo-field-error">{errors.media_clips}</span>}
                            </div>
                        </div>

                        {uploadedFiles.length > 0 && (
                            <div className="valo-media-preview">
                                <h4>Selected Videos ({uploadedFiles.length})</h4>
                                {uploadedFiles.map((file, idx) => (
                                    <div key={idx} className="valo-media-item">
                                        <video controls className="valo-media-video">
                                            <source src={URL.createObjectURL(file)} type={file.type} />
                                        </video>
                                        <div className="valo-media-info">
                                            <span className="valo-media-name">{file.name}</span>
                                            <span className="valo-media-size">
                                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            className="valo-media-remove"
                                            onClick={() => removeUploadedFile(idx)}
                                        >
                                            ✕ Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 📝 Bio */}
                    <div className="valo-form-section">
                        <h3>📝 About You</h3>
                        <div className="valo-form-row">
                            <div className="valo-form-group valo-full-width">
                                <label htmlFor="bio">Bio (optional, max 1000 chars)</label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    maxLength={1000}
                                    rows={4}
                                    placeholder="Tell others about yourself..."
                                />
                                <small className="valo-char-count">{formData.bio.length}/1000</small>
                                {errors.bio && <span className="valo-field-error">{errors.bio}</span>}
                            </div>
                        </div>
                    </div>

                    {/* 🔒 Privacy */}
                    <div className="valo-form-section">
                        <h3>🔒 Privacy</h3>
                        <div className="valo-checkbox-group">
                            <input
                                type="checkbox"
                                id="is_public"
                                name="is_public"
                                checked={formData.is_public}
                                onChange={handleChange}
                            />
                            <label htmlFor="is_public">Make my profile public (others can find & view it)</label>
                        </div>
                    </div>

                    {/* ✅ Submit */}
                    <div className="valo-form-actions">
                        <button type="button" className="valo-cancel-btn" onClick={() => navigate('/players/valorant')}>
                            Cancel
                        </button>
                        <button type="submit" className="valo-submit-btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Portfolio'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateValorantPortfolioPage;