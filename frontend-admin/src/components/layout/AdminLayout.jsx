import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3,
  LogOut, ShieldAlert, X, LayoutGrid, Menu, ArrowLeft, Image as ImageIcon,
  Ticket, Building2, Star, Layers
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-bg-main text-text-main font-sans flex text-left relative overflow-x-hidden">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 w-64 bg-sidebar-navy text-white p-6 z-50 transition-all duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between mb-10 lg:block">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-accent-blue rounded-lg flex items-center justify-center shadow-lg shadow-accent-blue/20">
              < ShieldAlert size={20} className="text-white" />
            </div>
            <div className="text-xl font-bold tracking-tight">Modern<span className="text-accent-blue">Shop</span></div>
          </div>
          <button className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="flex flex-col gap-1.5">
          {[
            { label: 'Dashboard', path: '/', icon: LayoutDashboard },
            { label: 'Inventory', path: '/inventory', icon: Package },
            { label: 'Banners', path: '/banners', icon: ImageIcon },
            { label: 'Promotions', path: '/coupons', icon: Ticket },
            { label: 'Brands', path: '/brands', icon: Building2 },
            { label: 'Categories', path: '/categories', icon: LayoutGrid },
            { label: 'Orders', path: '/orders', icon: ShoppingCart },
            { label: 'Users', path: '/users', icon: Users },
            { label: 'Reviews', path: '/reviews', icon: Star },
            { label: 'Bulk Tools', path: '/bulk-inventory', icon: Layers },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`p-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all duration-200 relative group ${
                currentPath === item.path 
                  ? 'bg-accent-blue text-white shadow-md' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={18} className={currentPath === item.path ? '' : 'group-hover:scale-105 transition-transform'} />
              {item.label}
            </Link>
          ))}
          <div className="h-px bg-white/5 my-4"></div>
          <p className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Management</p>
          <Link to="/" className="p-3 hover:bg-white/5 rounded-xl transition-all flex items-center gap-3 text-slate-400 text-sm font-semibold hover:text-white group">
            <BarChart3 size={18} className="group-hover:scale-105 transition-transform" /> Analytics
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full min-w-0 bg-bg-main">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 lg:px-10 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 bg-slate-50 border border-slate-200 rounded-lg shadow-sm hover:bg-slate-100 transition-colors"
              onClick={() => currentPath === '/' ? setSidebarOpen(true) : navigate(-1)}
            >
              <Menu size={20} className="text-text-main" />
            </button>
            <div>
              <h1 className="text-lg lg:text-xl font-bold tracking-tight flex items-center gap-2">
                {currentPath === '/' ? `Welcome back, ${user?.firstName || 'Admin'}` : currentPath.split('/')[1].charAt(0).toUpperCase() + currentPath.split('/')[1].slice(1)}
              </h1>
              <p className="hidden md:block text-text-muted font-medium text-xs">Admin Control Center</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end border-r border-slate-200 pr-4 mr-1">
              <span className="text-xs font-bold text-text-main">{user?.firstName || 'Logged'} {user?.lastName || 'In'}</span>
              <span className="text-[10px] font-semibold text-accent-blue uppercase tracking-wider">Administrator</span>
            </div>
            <button
              onClick={logout}
              className="p-2 lg:px-4 lg:py-2 bg-slate-100 text-text-main rounded-lg font-bold text-xs hover:bg-slate-200 transition-all flex items-center gap-2 active:scale-95 border border-slate-200"
            >
              <LogOut size={14} /> 
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
