import { createContext, useContext, useState, useEffect } from 'react';
import { getProfile, googleLoginUrl, requestOtp, verifyOtp } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const initAuth = async () => {
    const accessToken = localStorage.getItem('access_token_admin');
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

  const loginWithPhone = async (phoneNumber) => {
    return await requestOtp(phoneNumber);
  };

  const verifyPhoneOtp = async (phoneNumber, otp, firstName, lastName) => {
    const res = await verifyOtp(phoneNumber, otp, firstName, lastName);
    if (res.data.access_token) {
      setTokens(res.data.access_token, res.data.refresh_token, res.data.user.id);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error('Verification failed');
  };

  const logout = () => {
    localStorage.removeItem('access_token_admin');
    localStorage.removeItem('refresh_token_admin');
    localStorage.removeItem('user_id_admin');
    setUser(null);
  };

  const setTokens = (accessToken, refreshToken, userId) => {
    localStorage.setItem('access_token_admin', accessToken);
    localStorage.setItem('refresh_token_admin', refreshToken);
    if (userId) localStorage.setItem('user_id_admin', userId);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      loginWithGoogle, 
      loginWithPhone, 
      verifyPhoneOtp, 
      logout, 
      setTokens, 
      setUser, 
      initAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
