import { createContext, useContext } from "react";

export interface User {
  user_id: number;
  user_name: string;
  email: string;
  provider?: string;
  provider_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, authToken: string) => void;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
