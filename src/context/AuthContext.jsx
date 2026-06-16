import { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on application initialization
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  // Register
  const register = async (data) => {
    const res = await API.post("/auth/register", data);
    const { token, user: userProfile } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userProfile || res.data));

    const finalUser = userProfile || res.data;
    setUser(finalUser);
    return finalUser;
  };

  // Login
  const login = async (data) => {
    const res = await API.post("/auth/login", data);
    // Destructure user nested object if it exists, otherwise fall back to raw response data
    const { token, user: userProfile } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userProfile || res.data));

    const finalUser = userProfile || res.data;
    setUser(finalUser);
    return finalUser; 
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);