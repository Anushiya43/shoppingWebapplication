import React, { useState, useEffect } from 'react';
import { Package, BarChart3, AlertCircle } from 'lucide-react';
import { getStats } from '../../api/analytics';

const DashboardHome = () => {
  const [stats, setStats] = useState([
    { label: 'Total Revenue', value: '₹0', change: '--', icon: '💰', trend: 'up' },
    { label: 'Active Orders', value: '0', change: '--', icon: '📦', trend: 'up' },
    { label: 'Total Users', value: '0', change: '--', icon: '👥', trend: 'up' },
  ]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(Array(12).fill(0));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await getStats();
      const data = res.data;

      setStats([
        { 
          label: 'Total Revenue', 
          value: `₹${data.totalRevenue.toLocaleString()}`, 
          change: 'Real-time', 
          icon: '💰', 
          trend: 'up' 
        },
        { 
          label: 'Active Orders', 
          value: data.activeOrders.toString(), 
          change: 'Current', 
          icon: '📦', 
          trend: 'up' 
        },
        { 
          label: 'Total Users', 
          value: data.totalUsers.toLocaleString(), 
          change: 'Verified', 
          icon: '👥', 
          trend: 'up' 
        },
      ]);
      setMonthlyRevenue(data.monthlyRevenue);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      setError('Failed to load real-time analytics');
    } finally {
      setLoading(false);
    }
  };

  const maxRevenue = Math.max(...monthlyRevenue, 1);

  return (
    <div className="animate-in fade-in duration-500">
      {/* Stats Grid */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 animate-in slide-in-from-top-4">
          <AlertCircle size={20} />
          <p className="text-sm font-bold">{error}</p>
          <button onClick={fetchDashboardData} className="ml-auto text-xs underline font-bold">Retry</button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className={`p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden ${loading ? 'animate-pulse' : ''}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                {stat.icon}
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                  stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-[10px] text-text-muted font-medium mt-1">live data</span>
              </div>
            </div>
            <div>
              <p className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-text-main tracking-tight">
                {loading ? <div className="h-8 bg-slate-100 rounded w-24"></div> : stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Chart & Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-lg text-text-main">Revenue Analytics</h3>
              <p className="text-xs text-text-muted font-medium">Monthly performance tracking</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-text-muted">
                <div className="w-2 h-2 bg-accent-blue rounded-full"></div> Current
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-text-muted">
                <div className="w-2 h-2 bg-slate-300 rounded-full"></div> Previous
              </div>
            </div>
          </div>
          <div className="h-64 flex items-end gap-3 px-2">
            {monthlyRevenue.map((rev, i) => (
              <div key={i} className="flex-1 group/bar relative">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-text-main text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10">
                  ₹{rev.toLocaleString()}
                </div>
                <div className="w-full bg-slate-50 rounded-t-lg h-60 flex flex-col justify-end overflow-hidden">
                  <div 
                    className="bg-accent-blue/10 w-full rounded-t-lg transition-all duration-700 group-hover/bar:bg-accent-blue/40" 
                    style={{ height: `${(rev / maxRevenue) * 100}%` }}
                  ></div>
                </div>
                <div className="mt-3 text-[10px] font-bold text-text-muted text-center uppercase tracking-tighter">
                  {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="mb-8">
            <h3 className="font-bold text-lg text-text-main">Operational Health</h3>
            <p className="text-xs text-text-muted font-medium">Key performance indicators</p>
          </div>
          <div className="space-y-8">
            <div className="space-y-3">
               <div className="flex justify-between text-xs font-bold">
                 <span className="text-text-main">Stock Availability</span>
                 <span className="text-accent-blue">84%</span>
               </div>
               <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-accent-blue rounded-full w-[84%]"></div>
               </div>
               <p className="text-[10px] text-text-muted font-medium">12 items currently low in stock</p>
            </div>
            
            <div className="space-y-3">
               <div className="flex justify-between text-xs font-bold">
                 <span className="text-text-main">Fulfillment Rate</span>
                 <span className="text-emerald-500">98.2%</span>
               </div>
               <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 rounded-full w-[98.2%]"></div>
               </div>
               <p className="text-[10px] text-text-muted font-medium">Average 1.2 days per order</p>
            </div>

            <div className="space-y-3">
               <div className="flex justify-between text-xs font-bold text-slate-400">
                 <span>Returns Progress</span>
                 <span>2.4%</span>
               </div>
               <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-slate-300 rounded-full w-[24%]"></div>
               </div>
               <p className="text-[10px] text-text-muted font-medium">Stable compared to last week</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
