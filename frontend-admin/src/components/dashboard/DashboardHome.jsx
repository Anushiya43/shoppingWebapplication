import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { getStats, exportStats } from '../../api/analytics';
import { getLowStock } from '../../api/products';
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
  const [range, setRange] = useState('all');
  const [advancedStats, setAdvancedStats] = useState({ 
    repeatCustomerRate: 0, 
    avgOrderValue: 0,
    momGrowth: 0,
    categoryRevenue: [],
    abandonedCarts: 0,
    conversionRate: 0,
    locationStats: []
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchDashboardData();
  }, [range]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await getStats(range);
      const data = res.data;

      setStats([
        { 
          label: 'Total Revenue', 
          value: `₹${data.totalRevenue.toLocaleString()}`, 
          change: `${data.momGrowth > 0 ? '+' : ''}${data.momGrowth}%`, 
          icon: <TrendingUp size={20} className="text-emerald-500" />, 
          trend: data.momGrowth >= 0 ? 'up' : 'down',
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
        avgOrderValue: data.avgOrderValue || 0,
        momGrowth: data.momGrowth || 0,
        categoryRevenue: data.categoryRevenue || [],
        abandonedCarts: data.abandonedCarts || 0,
        conversionRate: data.conversionRate || 0,
        locationStats: data.locationStats || []
      });

      const lowStockRes = await getLowStock();
      setLowStockItems(lowStockRes.data || []);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      showNotification('error', 'Failed to load real-time analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      showNotification('info', 'Preparing your professional report...');
      const response = await exportStats(range);
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-report-${range}-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      showNotification('success', 'Report downloaded successfully');
    } catch (err) {
      console.error('Export failed:', err);
      showNotification('error', 'Failed to generate export report');
    }
  };


  return (
    <div className="animate-in fade-in duration-500 pb-12 text-left">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-black text-text-main tracking-tight uppercase">Executive Overview</h2>
          <p className="text-[10px] text-text-muted font-bold opacity-60 uppercase tracking-widest">Real-time enterprise metrics</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <Download size={14} />
            Export CSV
          </button>

          <div className="flex bg-slate-100/50 p-1 rounded-xl border border-slate-200/60 backdrop-blur-sm shadow-inner">
          {['7d', '30d', 'all'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.12em] transition-all duration-300 ${
                range === r 
                  ? 'bg-white text-primary-900 shadow-[0_4px_12px_-4px_rgba(15,23,42,0.12)] ring-1 ring-slate-900/5' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {r === 'all' ? 'Yearly' : `Last ${r.toUpperCase()}`}
            </button>
          ))}
        </div>
      </div>
    </div>

    {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className={`p-4 bg-white border border-slate-200/60 rounded-2xl shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_16px_-6px_rgba(0,0,0,0.08)] transition-all duration-500 group relative overflow-hidden ${loading ? 'animate-pulse' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 ${stat.color} border border-slate-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                  {stat.icon}
                </div>
                <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${
                  stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.15em] mb-1 opacity-60">{stat.label}</p>
              <h3 className="text-2xl font-black text-text-main tracking-tight italic">
                {loading ? <div className="h-6 bg-slate-100 rounded w-20"></div> : stat.value}
              </h3>
            </div>
          ))}
        </div>

        {/* New Mini Cards: Conversion & Abandoned */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl hover:shadow-[0_15px_30px_-10px_rgba(15,23,42,0.3)] transition-all duration-700 group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-blue/20 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
            <Target className="text-accent-blue mb-4 relative z-10" size={24} />
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.15em] mb-1 relative z-10">Purchase Matrix</p>
            <h3 className="text-2xl font-black text-white tracking-tighter relative z-10 italic">{advancedStats.conversionRate}%</h3>
            <div className="mt-4 flex flex-col gap-1.5 relative z-10">
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-gradient-to-r from-accent-blue to-accent-cyan rounded-full transition-all duration-1000" style={{ width: `${advancedStats.conversionRate}%` }}></div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-200/60 rounded-2xl shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)] transition-all duration-500 group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
             <AlertCircle className="text-red-500 mb-4 relative z-10" size={24} />
             <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.15em] mb-1 relative z-10">Leaking Revenue</p>
             <h3 className="text-2xl font-black text-text-main tracking-tighter relative z-10 italic">
                {advancedStats.abandonedCarts}
                <span className="text-[10px] font-bold text-slate-300 ml-1.5 uppercase not-italic tracking-widest">Units</span>
             </h3>
             <p className="text-[9px] font-black text-red-500/60 uppercase tracking-widest mt-2 relative z-10 flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-red-500 animate-ping"></div>
                Alert
             </p>
          </div>
        </div>
      </div>

      {/* Primary Chart: Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="lg:col-span-3 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-black text-lg text-text-main uppercase tracking-tight">Revenue Matrix</h3>
              <p className="text-[10px] text-text-muted font-bold opacity-60 uppercase tracking-widest">({range === 'all' ? 'Yearly' : `Last ${range.toUpperCase()}`})</p>
            </div>
          </div>
          <div className="h-72 w-full -ml-4">
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
                  viewBox={{ x: 0, y: 0, width: 200, height: 100 }}
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
        <div className="lg:col-span-1 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-black text-lg text-white uppercase tracking-wider mb-2">Efficiency</h3>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-6">Loyalty Index</p>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/60">
                  <span>Retention</span>
                  <span className="text-emerald-400">{advancedStats.repeatCustomerRate}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${advancedStats.repeatCustomerRate}%` }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/60">
                  <span>Loyalty</span>
                  <span className="text-accent-blue">High</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-accent-blue rounded-full transition-all duration-1000" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Avg. Order</p>
            <h4 className="text-3xl font-black text-white tracking-tighter">₹{advancedStats.avgOrderValue.toLocaleString()}</h4>
          </div>
        </div>
      </div>

      {/* Bottom Row: Top Products & Categories & Regions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Products */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-base text-text-main uppercase tracking-tight">Best Sellers</h3>
            <Package className="text-slate-200" size={20} />
          </div>
          <div className="space-y-3">
            {topProducts.length > 0 ? topProducts.map((product, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-black text-slate-400 text-[10px]">
                  0{i + 1}
                </div>
                <div className="flex-1">
                  <h4 className="text-[13px] font-black text-text-main truncate">{product.name}</h4>
                  <p className="text-[9px] font-bold text-text-muted uppercase opacity-60">{product.sales} sold</p>
                </div>
              </div>
            )) : (
              <div className="py-8 text-center text-slate-200 font-extrabold uppercase tracking-widest text-[9px]">No data</div>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm lg:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="text-accent-blue" size={18} />
            <h3 className="font-black text-base text-text-main uppercase tracking-tight">Split</h3>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={advancedStats.categoryRevenue} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 800, fill: '#64748b' }}
                  width={70}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    fontSize: '9px',
                    fontWeight: '800'
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {advancedStats.categoryRevenue.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'][index % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Reach (Locations) */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm lg:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <Users className="text-indigo-500" size={18} />
            <h3 className="font-black text-base text-text-main uppercase tracking-tight">Geographic</h3>
          </div>
          <div className="space-y-4">
            {advancedStats.locationStats.length > 0 ? advancedStats.locationStats.map((loc, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-text-main uppercase tracking-widest">
                  <span>{loc.name}</span>
                  <span className="text-indigo-500">{loc.value} users</span>
                </div>
                <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${(loc.value / stats[2].value.replace(/,/g, '')) * 100 || 0}%` }}
                  ></div>
                </div>
              </div>
            )) : (
              <div className="py-12 text-center text-slate-200 font-extrabold uppercase tracking-widest text-[9px]">No data</div>
            )}
            <p className="text-[9px] text-text-muted font-bold text-center mt-2 opacity-40 uppercase tracking-widest">Expansion tracking</p>
          </div>
        </div>
      </div>

      {/* Critical Stock Alert - Full Width Section */}
      {lowStockItems.length > 0 && (
        <div className="mt-6 bg-red-50 border border-red-100 rounded-[2rem] p-8 relative overflow-hidden group shadow-lg shadow-red-500/5">
           <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
           <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-md animate-bounce duration-[2000ms]">
                    <AlertCircle className="text-red-500" size={32} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-red-900 uppercase tracking-tight">Critical Inventory Breach</h3>
                    <p className="text-[10px] text-red-600 font-bold uppercase tracking-[0.2em] mt-1 italic">
                       {lowStockItems.length} Products have fallen below threshold constraints
                    </p>
                 </div>
              </div>
              <button 
                 onClick={() => navigate('/bulk-inventory')}
                 className="px-8 py-4 bg-red-500 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 active:scale-95"
              >
                 Enter Logistics Control
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
