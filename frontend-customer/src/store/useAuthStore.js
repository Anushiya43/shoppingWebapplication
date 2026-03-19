import { create } from 'zustand';
import { getProfile, googleLoginUrl, requestOtp, verifyOtp } from '../api/auth';

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,

  setTokens: (accessToken, refreshToken, userId) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    if (userId) localStorage.setItem('user_id', userId);
  },

  initAuth: async () => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      try {
        set({ loading: true });
        const res = await getProfile();
        set({ user: res.data, loading: false });
      } catch (err) {
        console.error('Session expired', err);
        get().logout();
        set({ loading: false });
      }
    } else {
      set({ loading: false });
    }
  },

  loginWithGoogle: () => {
    window.location.href = googleLoginUrl;
  },

  loginWithPhone: async (phoneNumber) => {
    return await requestOtp(phoneNumber);
  },

  verifyPhoneOtp: async (phoneNumber, otp, firstName, lastName) => {
    const res = await verifyOtp(phoneNumber, otp, firstName, lastName);
    if (res.data.access_token) {
      get().setTokens(res.data.access_token, res.data.refresh_token, res.data.user.id);
      set({ user: res.data.user });
      return res.data;
    }
    throw new Error('Verification failed');
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    set({ user: null });
  },

  setUser: (user) => set({ user }),
}));

export default useAuthStore;
