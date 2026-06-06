"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

export interface UserProfile {
  id: string;
  login: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  gender?: string;
  role: string;
  avatarUrl?: string;
  originalAvatarUrl?: string;
}

interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  useEffect(() => {
    const storedToken = localStorage.getItem("userToken");
    if (storedToken) {
      setToken(storedToken);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const isAuthPage = pathname === "/login" || pathname === "/register";

    if (!token && !isAuthPage) {
      router.push("/login");
    } else if (token && isAuthPage) {
      router.push("/");
    }
  }, [token, isInitialized, pathname, router]);

  const login = (newToken: string) => {
    localStorage.setItem("userToken", newToken);
    setToken(newToken);
    router.push("/");
  };

  const logout = () => {
    localStorage.removeItem("userToken");
    setToken(null);
    // Очищаем кэш React Query при выходе
    queryClient.clear();
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      <div
        style={{
          visibility: isInitialized ? "visible" : "hidden",
          minHeight: "100vh",
        }}
      >
        {children}
      </div>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
