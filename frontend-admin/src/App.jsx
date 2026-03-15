import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useSearchParams, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LogIn, LayoutDashboard, Package, ShoppingCart, Users, BarChart3, LogOut, ShieldAlert, Smartphone, Hash, X, CheckCircle2 } from 'lucide-react'

const AuthSuccess = () => {
  const [searchParams] = useSearchParams()
  const { setTokens } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      navigate(`/?error=${error}`)
      return
    }

    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    const userId = searchParams.get('user_id')

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken, userId)
      navigate('/')
      window.location.reload()
    }
  }, [searchParams, setTokens, navigate])

  return <div className="min-h-screen flex items-center justify-center">Authenticating Admin...</div>;
};

const LoginModal = ({ isOpen, onClose }) => {
    const { loginWithGoogle, loginWithPhone, verifyPhoneOtp } = useAuth();
    const [step, setStep] = useState('choice'); // choice, phone, otp
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isNewUser, setIsNewUser] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await loginWithPhone(phoneNumber);
            setIsNewUser(res.data.isNewUser);
            setStep('otp');
        } catch (err) {
            setError('Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await verifyPhoneOtp(phoneNumber, otp, firstName, lastName);
            onClose();
        } catch (err) {
            setError('Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
                    <X size={20} />
                </button>

                <div className="p-10 text-center">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">
                            {step === 'otp' && isNewUser ? 'Admin Setup' : 'Admin Login'}
                        </h2>
                        <p className="text-slate-500">
                            {step === 'otp' && isNewUser ? 'Complete your admin profile.' : 'Secure access to your dashboard.'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium flex items-center gap-3">
                            <X size={16} /> {error}
                        </div>
                    )}

                    {step === 'choice' && (
                        <div className="space-y-4">
                            <button 
                                onClick={loginWithGoogle}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95"
                            >
                                <LogIn size={20} /> Continue with Google
                            </button>
                            <button 
                                onClick={() => setStep('phone')}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95"
                            >
                                <Smartphone size={20} /> Continue with Phone
                            </button>
                        </div>
                    )}

                    {step === 'phone' && (
                        <form onSubmit={handlePhoneSubmit} className="space-y-6 text-left">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
                                <div className="relative">
                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input 
                                        type="tel" 
                                        required
                                        placeholder="+1 234 567 890"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Send OTP'}
                            </button>
                            <button 
                                type="button"
                                onClick={() => setStep('choice')}
                                className="w-full text-slate-500 text-sm font-medium hover:text-slate-900 transition-colors"
                            >
                                Go Back
                            </button>
                        </form>
                    )}

                    {step === 'otp' && (
                        <form onSubmit={handleOtpSubmit} className="space-y-6 text-left">
                            {isNewUser && (
                                <div className="grid grid-cols-2 gap-4 auto-cols-auto">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">First Name</label>
                                        <input 
                                            type="text" 
                                            required
                                            placeholder="John"
                                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Last Name</label>
                                        <input 
                                            type="text" 
                                            required
                                            placeholder="Doe"
                                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="space-y-2 text-center">
                                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl text-sm font-medium inline-block mb-2">
                                    OTP sent to {phoneNumber}
                                </div>
                                <div className="relative">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input 
                                        type="text" 
                                        required
                                        maxLength={6}
                                        placeholder="Enter 6-digit code"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-center tracking-[0.5em] font-bold text-xl"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'Verifying...' : (isNewUser ? 'Complete Setup' : 'Verify OTP')}
                            </button>
                            <button 
                                type="button"
                                onClick={() => setStep('phone')}
                                className="w-full text-slate-500 text-sm font-medium hover:text-slate-900 transition-colors text-center"
                            >
                                Change Phone Number
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
  const { user, loginWithGoogle, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  
  const [stats] = useState([
    { label: 'Total Revenue', value: '$12,450', change: '+12%', icon: '💰' },
    { label: 'Active Orders', value: '48', change: '+5', icon: '📦' },
    { label: 'Total Users', value: '1,204', change: '+18', icon: '👥' },
  ])

  const error = searchParams.get('error');

  useEffect(() => {
    if ((user && user.role !== 'ADMIN') || error === 'admin_only') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            logout();
            navigate('/'); // Clear search params to return to login UI
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [user, logout, error, navigate]);

  if (!user && error !== 'admin_only') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} />
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="text-blue-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Admin Panel</h1>
          <p className="text-slate-500 mb-8">Please login with your authorized account to access the dashboard.</p>
          
          <div className="space-y-4">
            <button
                onClick={loginWithGoogle}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
            >
                <LogIn size={20} />
                Continue with Google
            </button>
            <button
                onClick={() => setLoginModalOpen(true)}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95"
            >
                <Smartphone size={20} />
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
        {/* Animated Background Orbs */}
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
              href="http://localhost:3001"
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex text-left relative overflow-x-hidden">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 w-64 bg-slate-900 text-white p-6 z-50 transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between mb-10 lg:block">
          <div className="text-2xl font-bold text-blue-400">AdminPanel</div>
          <button className="lg:hidden p-2 text-slate-400" onClick={() => setSidebarOpen(false)}>
            <ShieldAlert size={24} /> {/* Using an icon since X isn't imported yet, I'll add Menu/X later */}
          </button>
        </div>
        <nav className="flex flex-col gap-2">
          <a href="#" className="p-3 bg-blue-600 rounded-xl font-medium flex items-center gap-3">
            <LayoutDashboard size={20} /> Dashboard
          </a>
          <a href="#" className="p-3 hover:bg-white/5 rounded-xl transition-colors flex items-center gap-3 text-slate-400">
            <Package size={20} /> Inventory
          </a>
          <a href="#" className="p-3 hover:bg-white/5 rounded-xl transition-colors flex items-center gap-3 text-slate-400">
            <ShoppingCart size={20} /> Orders
          </a>
          <a href="#" className="p-3 hover:bg-white/5 rounded-xl transition-colors flex items-center gap-3 text-slate-400">
            <Users size={20} /> Users
          </a>
          <a href="#" className="p-3 hover:bg-white/5 rounded-xl transition-colors flex items-center gap-3 text-slate-400">
            <BarChart3 size={20} /> Analytics
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full min-w-0">
        <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md border-b border-slate-100 p-4 lg:p-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50"
              onClick={() => setSidebarOpen(true)}
            >
              <LayoutDashboard size={20} />
            </button>
            <div className="truncate">
              <h1 className="text-lg lg:text-3xl font-bold truncate">Hi, {user.firstName}</h1>
              <p className="hidden md:block text-slate-500">Here's what's happening today.</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="px-4 lg:px-6 py-2 bg-white border border-slate-200 rounded-full font-medium shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
          </button>
        </header>

        <div className="p-4 lg:p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
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
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
