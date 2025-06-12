import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState();

  useEffect(() => {
    (async () => {
      const { data } = await axiosInstance.get("/auth/profile");
      setUser(data);
    })();
  }, []);

  const login = async (email, password) => {
    const userData = { email, password };
    try {
      const { data } = await axiosInstance.post("/auth/login", userData);
      setUser(data.user);
      return true;
    } catch (error) {
      console.log(error?.response?.data?.message);
    }
  };

  const register = async (name, email, password) => {
    const userData = { name, email, password };
    try {
      const { data } = await axiosInstance.post("/auth/register", userData);
      return true;
    } catch (error) {
      console.log(error?.response?.data?.message);
    }
  };

  const logout = async () => {
    await axiosInstance.post("/auth/logout");
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
