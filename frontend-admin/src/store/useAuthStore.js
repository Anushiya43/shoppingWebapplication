import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getProfile, logoutUser, requestOtp, verifyOtp } from '../api/auth';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: false,

      setLoading: (loading) => set({ loading }),
      setUser: (user) => set({ user }),

      initAuth: async () => {
        const token = localStorage.getItem('access_token_admin');
        if (!token) {
          set({ user: null, loading: false });
          return;
        }

        try {
          set({ loading: true });
          const res = await getProfile();
          set({ user: res.data, loading: false });
        } catch (err) {
          console.error('Session restoration failed:', err);
          get().logout();
          set({ loading: false });
        }
      },

      loginWithPhone: async (phoneNumber) => {
        return await requestOtp(phoneNumber);
      },

      verifyPhoneOtp: async (phoneNumber, otp, firstName, lastName) => {
        const res = await verifyOtp(phoneNumber, otp, firstName, lastName);
        if (res.data.access_token) {
          localStorage.setItem('access_token_admin', res.data.access_token);
          localStorage.setItem('refresh_token_admin', res.data.refresh_token);
          if (res.data.user?.id) localStorage.setItem('user_id_admin', res.data.user.id);
          
          set({ user: res.data.user });
          return res.data;
        }
        throw new Error('Verification failed');
      },

      logout: async () => {
        try {
          // Attempt graceful logout if backend supports it
          await logoutUser();
        } catch (err) {
          console.error('Logout error:', err);
        } finally {
          localStorage.removeItem('access_token_admin');
          localStorage.removeItem('refresh_token_admin');
          localStorage.removeItem('user_id_admin');
          set({ user: null });
        }
      },
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({ user: state.user }), // Only persist user object
    }
  )
);

export default useAuthStore;
