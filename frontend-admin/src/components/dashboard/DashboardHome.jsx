import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, BarChart3, AlertCircle, TrendingUp, Users, ShoppingBag, Target, Star, MoreHorizontal } from 'lucide-react';
import { getStats } from '../../api/analytics';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';

const DashboardHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    { label: 'Total Revenue', value: '₹0', change: '--', icon: <TrendingUp size={20} className="text-emerald-500" />, trend: 'up', color: 'bg-emerald-50' },
    { label: 'Active Orders', value: '0', change: '--', icon: <ShoppingBag size={20} className="text-accent-blue" />, trend: 'up', color: 'bg-blue-50' },
    { label: 'Total Users', value: '0', change: '--', icon: <Users size={20} className="text-indigo-500" />, trend: 'up', color: 'bg-indigo-50' },
  ]);
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [advancedStats, setAdvancedStats] = useState({ 
    repeatCustomerRate: 0, 
    avgOrderValue: 0 
  });
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
          icon: <TrendingUp size={20} className="text-emerald-500" />, 
          trend: 'up',
          color: 'bg-emerald-50'
        },
        { 
          label: 'Active Orders', 
          value: data.activeOrders.toString(), 
          change: 'Current', 
          icon: <ShoppingBag size={20} className="text-accent-blue" />, 
          trend: 'up',
          color: 'bg-blue-50'
        },
        { 
          label: 'Total Users', 
          value: data.totalUsers.toLocaleString(), 
          change: 'Verified', 
          icon: <Users size={20} className="text-indigo-500" />, 
          trend: 'up',
          color: 'bg-indigo-50'
        },
      ]);
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const formattedChartData = data.monthlyRevenue.map((rev, i) => ({
        name: months[i],
        revenue: rev
      }));
      setChartData(formattedChartData);
      setTopProducts(data.topProducts || []);
      setAdvancedStats({
        repeatCustomerRate: data.repeatCustomerRate || 0,
        avgOrderValue: data.avgOrderValue || 0
      });
      setError(null);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      setError('Failed to load real-time analytics');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="animate-in fade-in duration-500 pb-20 text-left">
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
              <div className={`w-12 h-12 ${stat.color} border border-slate-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm`}>
                {stat.icon}
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${
                  stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1 opacity-40">Live Feed</span>
              </div>
            </div>
            <div>
              <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-70">{stat.label}</p>
              <h3 className="text-3xl font-black text-text-main tracking-tighter">
                {loading ? <div className="h-8 bg-slate-100 rounded w-24"></div> : stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Primary Chart: Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3 p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="font-black text-xl text-text-main uppercase tracking-tight">Revenue Matrix</h3>
              <p className="text-xs text-text-muted font-bold opacity-60">High-fidelity monthly performance metrics</p>
            </div>
          </div>
          <div className="h-80 w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }}
                  tickFormatter={(val) => `₹${val >= 1000 ? (val/1000).toFixed(0)+'k' : val}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                    fontSize: '11px',
                    fontWeight: '900',
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    padding: '12px 16px'
                  }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{ stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '4 4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8b5cf6" 
                  strokeWidth={5}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Stats Card */}
        <div className="lg:col-span-1 p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-black text-lg text-white uppercase tracking-wider mb-2">Efficiency</h3>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-8">Key Performance Index</p>
            
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/60">
                  <span>Customer Retention</span>
                  <span className="text-emerald-400">{advancedStats.repeatCustomerRate}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${advancedStats.repeatCustomerRate}%` }}></div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/60">
                  <span>Logistics Health</span>
                  <span className="text-accent-blue">98.4%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-accent-blue rounded-full transition-all duration-1000" style={{ width: '98.4%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Avg. Ticket Size</p>
            <h4 className="text-4xl font-black text-white tracking-tighter">₹{advancedStats.avgOrderValue.toLocaleString()}</h4>
          </div>
        </div>
      </div>

      {/* Bottom Row: Top Products & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-lg text-text-main uppercase tracking-tight">Top Performance</h3>
            <button 
              onClick={() => navigate('/inventory')}
              className="text-accent-blue text-[10px] font-black uppercase tracking-widest hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {topProducts.length > 0 ? topProducts.map((product, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-black text-slate-400 text-xs">
                  0{i + 1}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-text-main truncate">{product.name}</h4>
                  <p className="text-[10px] font-bold text-text-muted uppercase opacity-60">₹{Number(product.price).toLocaleString()} • {product.sales} units sold</p>
                </div>
                <TrendingUp size={14} className="text-emerald-500" />
              </div>
            )) : (
              <div className="py-10 text-center text-slate-300 font-bold uppercase tracking-widest text-[10px]">No sales data recorded yet</div>
            )}
          </div>
        </div>

        <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <Target className="text-accent-blue" size={20} />
            <h3 className="font-black text-lg text-text-main uppercase tracking-tight">Market Intelligence</h3>
          </div>
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Opportunity Detected</span>
              </div>
              <p className="text-xs text-text-main font-bold leading-relaxed mb-4">
                Repeat customer rate is up {advancedStats.repeatCustomerRate}%. Loyalty programs might have high impact this quarter.
              </p>
              <div className="flex items-center gap-4">
                 <div className="flex -space-x-2">
                   {[1,2,3].map(i => <div key={i} className={`w-6 h-6 rounded-full border-2 border-white bg-slate-${i*100+100}`}></div>)}
                 </div>
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">+12 new verified accounts</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                 <Star size={16} className="text-indigo-500 mb-2" />
                 <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Satisfaction</h5>
                 <p className="text-xl font-black text-indigo-900 tracking-tighter">4.8/5.0</p>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl relative group overflow-hidden">
                 <MoreHorizontal size={16} className="text-amber-500 mb-2" />
                 <h5 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Stock Alerts</h5>
                 <p className="text-xl font-black text-amber-900 tracking-tighter">14 SKU</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
