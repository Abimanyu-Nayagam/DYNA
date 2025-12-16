import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface SignupPayload {
  user_name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface PubgStatsData {
  id: number;
  user_id: number;
  username: string;
  in_game_id: string;
  fd_ratio: number | null;
  current_rank: string | null;
  highest_rank: string | null;
  headshot_rate: number | null;
  headshots: number | null;
  eliminations: number | null;
  most_eliminations: number | null;
  matches_played: number | null;
  wins: number | null;
  top_10: number | null;
  avg_damage: number | null;
  avg_survival_time: number | null;
  ishidden: boolean;
  video_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// API
export const authAPI = {
  signup: async (data: SignupPayload) => {
    const response = await api.post("/auth/signup", data);
    return response.data;
  },

  login: async (data: LoginPayload) => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/user");
    return response.data;
  },

  updateCurrentUser: async (data: Record<string, unknown>) => {
    const response = await api.put("/auth/user", data);
    return response.data;
  },
};

export const pubgAPI = {
  createStats: async (data: Omit<PubgStatsData, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const response = await api.post("/games/pubg/stats", data);
    return response.data;
  },

  getAllStats: async (): Promise<PubgStatsData[]> => {
    const response = await api.get("/games/pubg/");
    return response.data;
  },

  getStatsByUser: async (userId: number): Promise<PubgStatsData> => {
    const response = await api.get(`/games/pubg/stats/${userId}`);
    return response.data;
  },

  updateStats: async (statsId: number, data: Partial<PubgStatsData>) => {
    const response = await api.patch(`/games/pubg/stats/${statsId}`, data);
    return response.data;
  },
};

export interface CsgoStatsData {
  id: number;
  user_id: number;
  username: string;
  in_game_id: string;
  video_url:string|null;


  current_rank: string|null;
  highest_rank: string|null;
  mm_rank: string|null;
  faceit_level: number | null;
  elo: number | null;


  kd_ratio: number | null;
  headshot_percentage: number | null;
  kills: number  |null;
  deaths: number |null;
  assists: number|null;
  mvps: number|null;

  matches_played: number | string|null;
  wins: number | string |null;
  win_rate: number |null;
  
  avg_damage_per_round: number | string|null;
  avg_kills_per_round: number | string |null;
  rounds_played: number | string |null;

  bomb_plants: number | string|null;
  bomb_defuses: number | string |null;
  flash_assists: number | string |null;
}

export const csgoAPI = {
  createStats: async (data: Omit<CsgoStatsData, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const response = await api.post("/games/csgo/stats", data);
    return response.data;
  },

  getAllStats: async (): Promise<CsgoStatsData[]> => {
    const response = await api.get("/games/csgo/");
    return response.data;
  },

  getStatsByUser: async (userId: number): Promise<CsgoStatsData> => {
    const response = await api.get(`/games/csgo/stats/${userId}`);
    console.log(response);
    
    return response.data;
  },

  updateStats: async (statsId: number, data: Partial<CsgoStatsData>) => {
    const response = await api.patch(`/games/csgo/stats/${statsId}`, data);
    return response.data;
  },
};




export interface ValorantProfileData {
  id: number;
  user_id: number;
  player_name: string;
  riot_id: string;
  tagline: string;
  full_riot_id: string;
  region: string;
  server: string;
  current_rank: string;
  peak_rank: string;
  kd: number;
  win_rate: number;
  total_matches: number;
  hours_played: number;
  main_role: string;
  best_agent: string;
  top_agents: string[];
  is_public: boolean;
  // Add more fields as needed
}

export interface ValorantSearchResult {
  player_name: string;
  riot_id: string;
  tagline: string;
  current_rank: string;
  region: string;
  best_agent: string;
  user_name: string; // DYNA username to link to profile
}

export const valorantAPI = {
  // Search public profiles
  searchProfiles: async (query: string): Promise<ValorantSearchResult[]> => {
    const response = await api.get(`/api/valorant/search?query=${query}`);
    return response.data.results || [];
  },

  // Get public profile by username
  getPublicProfile: async (userName: string): Promise<ValorantProfileData> => {
    const response = await api.get(`/api/valorant/${userName}`);
    return response.data;
  },

  // Get own profile
  getMyProfile: async (): Promise<{
    exists: boolean;
    data?: any;
  }> => {
    const res = await api.get("/api/valorant/me");
    return res.data;
  },

  // Create profile
  createProfile: async (data: any) => {
    const response = await api.post('/api/valorant', data);
    return response.data;
  },

  // Update profile (PATCH for partial updates)
  updateProfile: async (data: any) => {
    const response = await api.patch('/api/valorant/me', data);
    return response.data;
  },

  // Delete profile
  deleteProfile: async () => {
    const response = await api.delete('/api/valorant/me');
    return response.data;
  },
};

export const userAPI = {
  // Get user profile with all games
  getUserProfile: async (username: string) => {
    const response = await api.get(`/players/${username}`);
    return response.data;
  },
};

export default api;
