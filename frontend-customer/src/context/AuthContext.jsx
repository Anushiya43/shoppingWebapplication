import { createContext, useContext, useState, useEffect } from 'react';
import { getProfile, googleLoginUrl } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const initAuth = async () => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      try {
        const res = await getProfile();
        setUser(res.data);
      } catch (err) {
        console.error('Session expired', err);
        logout();
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    initAuth();
  }, []);

  const loginWithGoogle = () => {
    window.location.href = googleLoginUrl;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    setUser(null);
  };

  const setTokens = (accessToken, refreshToken, userId) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    if (userId) localStorage.setItem('user_id', userId);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, setTokens, setUser, initAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
