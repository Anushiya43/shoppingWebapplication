import { useState } from 'react'

export default function App() {
  const [stats] = useState([
    { label: 'Total Revenue', value: '$12,450', change: '+12%', icon: '💰' },
    { label: 'Active Orders', value: '48', change: '+5', icon: '📦' },
    { label: 'Total Users', value: '1,204', change: '+18', icon: '👥' },
  ])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex text-left">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white min-h-screen p-6 hidden lg:block">
        <div className="text-2xl font-bold mb-10 text-blue-400">AdminPanel</div>
        <nav className="flex flex-col gap-2">
          <a href="#" className="p-3 bg-blue-600 rounded-xl font-medium">Dashboard</a>
          <a href="#" className="p-3 hover:bg-white/5 rounded-xl transition-colors">Inventory</a>
          <a href="#" className="p-3 hover:bg-white/5 rounded-xl transition-colors">Orders</a>
          <a href="#" className="p-3 hover:bg-white/5 rounded-xl transition-colors">Users</a>
          <a href="#" className="p-3 hover:bg-white/5 rounded-xl transition-colors">Analytics</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Good morning, Admin</h1>
            <p className="text-slate-500">Here's what's happening today.</p>
          </div>
          <button className="px-6 py-2 bg-white border border-slate-200 rounded-full font-medium shadow-sm hover:bg-slate-50 transition-colors">
            Logout
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, i) => (
            <div key={i} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl">
                  {stat.icon}
                </div>
                <span className="text-green-600 font-bold text-sm bg-green-50 px-3 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <div className="text-slate-500 text-sm font-medium mb-1">{stat.label}</div>
              <div className="text-3xl font-bold">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Chart Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-8 bg-white border border-slate-100 rounded-3xl h-64 flex flex-col justify-center items-center">
            <div className="text-slate-400 mb-2">Sales Analytics Chart</div>
            <div className="h-1 bg-slate-100 w-full rounded-full relative overflow-hidden">
               <div className="absolute left-0 top-0 h-full bg-blue-500 w-2/3"></div>
            </div>
            <p className="mt-4 text-sm text-slate-500">Feature: Coming soon in feature/analytics</p>
          </div>
          <div className="p-8 bg-white border border-slate-100 rounded-3xl h-64 flex flex-col justify-center items-center text-center">
             <div className="text-slate-400 mb-2">Top Best-selling Products</div>
             <div className="space-y-3 w-full">
                <div className="h-8 bg-slate-50 rounded-xl animate-pulse"></div>
                <div className="h-8 bg-slate-50 rounded-xl animate-pulse"></div>
                <div className="h-8 bg-slate-50 rounded-xl animate-pulse w-3/4 mx-auto"></div>
             </div>
          </div>
        </div>
      </main>
    </div>
  )
}
