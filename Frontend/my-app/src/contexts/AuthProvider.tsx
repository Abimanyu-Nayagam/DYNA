import { useState, useEffect, useCallback, type ReactNode } from "react";
import { AuthContext, type User } from "./AuthContext";
import { authAPI } from "../services/api";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  useEffect(() => {
    const init = async () => {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        setLoading(false);
        return;
      }

      setToken(storedToken);

      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          const parsed: User = JSON.parse(storedUser);
          setUser(parsed);
          setLoading(false);

          try {
            const current = await authAPI.getCurrentUser();
            setUser(current);
            localStorage.setItem("user", JSON.stringify(current));
          } catch (e) {
            console.error("Token verification failed:", e);
          }

          return;
        } catch {
          localStorage.removeItem("user");
        }
      }

      try {
        const current = await authAPI.getCurrentUser();
        setUser(current);
        localStorage.setItem("user", JSON.stringify(current));
      } catch (e) {
        console.log(e);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [clearAuth]);

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    clearAuth();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
