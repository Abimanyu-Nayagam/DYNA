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
  createStats: async (data: Omit<PubgStatsData, 'id' | 'user_id' | 'ishidden' | 'created_at' | 'updated_at'>) => {
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

export default api;
