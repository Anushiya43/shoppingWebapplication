import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { googleLoginUrl } from '../api/auth';
import { ShieldAlert, LogIn, Smartphone, LogOut, ShoppingCart } from 'lucide-react';
import AdminLayout from './layout/AdminLayout';
import LoginModal from './auth/LoginModal';
import CategoriesPage from './CategoriesPage';
import InventoryPage from './InventoryPage';
import OrdersManagementPage from './OrdersManagementPage';
import UserManagementPage from './UserManagementPage';
import DashboardHome from './dashboard/DashboardHome';
import BannersPage from './BannersPage';
import CouponsPage from './CouponsPage';

const Dashboard = () => {
  const { user, logout, loading, initAuth } = useAuthStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(5);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  const currentPath = location.pathname;
  const error = searchParams.get('error');

  const loginWithGoogle = () => {
    window.location.href = googleLoginUrl;
  };

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if ((user && user.role !== 'ADMIN') || error === 'admin_only') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            logout();
            navigate('/');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [user, logout, error, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-slate flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent-blue/10 rounded-full blur-[100px] -ml-48 -mt-48"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-cyan/10 rounded-full blur-[100px] -mr-48 -mb-48"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-accent-blue border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-text-muted font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Synchronizing Session</p>
        </div>
      </div>
    );
  }

  if (!user && error !== 'admin_only') {
    return (
      <div className="min-h-screen bg-bg-slate flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent-blue/10 rounded-full blur-[100px] -ml-48 -mt-48"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-cyan/10 rounded-full blur-[100px] -mr-48 -mb-48"></div>
        
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} />
        <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-[3rem] p-10 shadow-2xl border border-white/50 text-center relative z-10">
          <div className="w-20 h-20 bg-primary-indigo/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
            <ShieldAlert className="text-primary-indigo" size={40} />
          </div>
          <h1 className="text-3xl font-black mb-2 tracking-tight">Modern<span className="text-accent-blue">Shop</span></h1>
          <p className="text-slate-500 font-medium mb-10">Authorized Admin Access Only</p>

          <div className="space-y-4">
            <button
              onClick={loginWithGoogle}
              className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-primary-indigo text-white rounded-[2rem] font-black hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-primary-indigo/30"
            >
              <LogIn size={22} />
              Continue with Google
            </button>
            <button
              onClick={() => setLoginModalOpen(true)}
              className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-white border-2 border-slate-100 text-slate-900 rounded-[2rem] font-black hover:bg-slate-50 transition-all active:scale-95"
            >
              <Smartphone size={22} />
              Continue with Phone
            </button>
          </div>
        </div>
      </div>
    );
  }

  if ((user && user.role !== 'ADMIN') || error === 'admin_only') {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-xl w-full bg-white/5 backdrop-blur-2xl rounded-[3rem] p-10 shadow-2xl border border-white/10 text-center relative z-10">
          <div className="mb-8 relative group">
            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
              <ShieldAlert className="text-red-500 animate-bounce" size={48} />
            </div>
          </div>

          <div className="space-y-4 mb-10 text-center flex flex-col items-center">
            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight">
              Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 text-6xl block mt-2">Only Access</span>
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-red-50 to-orange-500 mx-auto rounded-full mt-4"></div>
            <p className="text-slate-400 text-lg max-w-sm mx-auto leading-relaxed mt-4">
              You do not have administrative privileges. Redirecting back to login in <span className="text-white font-bold text-2xl ml-1">{countdown}s</span>
            </p>
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-1000 ease-linear"
                style={{ width: `${(countdown / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={user ? logout : () => setLoginModalOpen(true)}
              className="flex items-center justify-center gap-3 px-8 py-5 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-100 transition-all active:scale-95 shadow-xl"
            >
              {user ? <LogOut size={20} /> : <LogIn size={20} />}
              {user ? 'Logout Now' : 'Login Admin'}
            </button>
            <a
              href={import.meta.env.VITE_STOREFRONT_URL}
              className="flex items-center justify-center gap-3 px-8 py-5 bg-white/10 text-white border border-white/10 rounded-2xl font-bold hover:bg-white/15 transition-all active:scale-95 backdrop-blur-md"
            >
              <ShoppingCart size={20} />
              Storefront
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout user={user}>
      {currentPath === '/' && <DashboardHome />}
      {currentPath === '/categories' && <CategoriesPage />}
      {currentPath === '/inventory' && <InventoryPage />}
      {currentPath === '/orders' && <OrdersManagementPage />}
      {currentPath === '/users' && <UserManagementPage />}
      {currentPath === '/banners' && <BannersPage />}
      {currentPath === '/coupons' && <CouponsPage />}
    </AdminLayout>
  );
};

export default Dashboard;
