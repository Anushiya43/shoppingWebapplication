import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getProfile, googleLoginUrl, requestOtp, verifyOtp } from '../api/auth';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      userId: null,
      loading: false, // Start false, initAuth will set it to true if needed

      setAccessToken: (token) => set({ accessToken: token }),
      
      setTokens: (accessToken, refreshToken, userId) => {
        set({ accessToken, refreshToken, userId });
      },

      initAuth: async () => {
        const { accessToken } = get();
        if (!accessToken) {
          set({ loading: false });
          return;
        }

        try {
          set({ loading: true });
          const res = await getProfile();
          set({ user: res.data, loading: false });
        } catch (err) {
          console.error('Session restoration failed:', err);
          // 401s are handled by Axios interceptor calling logout()
          // But we catch generic failures here too
          if (err.response?.status === 401) {
            get().logout();
          }
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
        set({ 
          user: null, 
          accessToken: null, 
          refreshToken: null, 
          userId: null,
          loading: false 
        });
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'modern-shop-auth',
      partialize: (state) => ({ 
        accessToken: state.accessToken, 
        refreshToken: state.refreshToken, 
        userId: state.userId,
        user: state.user 
      }),
    }
  )
);

export default useAuthStore;
