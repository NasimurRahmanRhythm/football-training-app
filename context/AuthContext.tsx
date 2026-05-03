"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  userType: "COACH" | "PLAYER";
  token: string;
}
interface Ctx {
  user: AuthUser | null;
  isLoading: boolean;
  login: (u: Omit<AuthUser, "token">, token: string) => void;
  logout: () => void;
}
const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    try {
      const s = localStorage.getItem("ft_auth");
      if (s) setUser(JSON.parse(s));
    } catch {
      localStorage.removeItem("ft_auth");
    } finally {
      setIsLoading(false);
    }
  }, []);
  const login = useCallback((u: Omit<AuthUser, "token">, token: string) => {
    const full: AuthUser = { ...u, token };
    setUser(full);
    localStorage.setItem("ft_auth", JSON.stringify(full));
  }, []);
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("ft_auth");
  }, []);
  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
