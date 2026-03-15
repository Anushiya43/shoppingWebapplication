import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LogIn, User, ShoppingBag, Search, Menu, LogOut } from 'lucide-react';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const { setTokens, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const userId = searchParams.get('user_id');

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken, userId);
      // In a real app, you'd fetch the user profile here or decode the token
      navigate('/');
      window.location.reload(); // Quick way to trigger AuthContext init
    }
  }, [searchParams, setTokens, navigate, setUser]);

  return <div className="min-h-screen flex items-center justify-center">Logging you in...</div>;
};

const HomePage = () => {
    const { user, loginWithGoogle, logout } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Header */}
            <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="text-2x1 font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            LuxeStore
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium">Hi, {user.firstName}</span>
                                <button onClick={logout} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={loginWithGoogle}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-all active:scale-95"
                            >
                                <LogIn size={16} />
                                Login with Google
                            </button>
                        )}
                        <button className="p-2 hover:bg-slate-50 rounded-full transition-colors relative">
                            <ShoppingBag size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
                <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 aspect-[16/9] md:aspect-[21/9] flex items-center">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10"></div>
                    <div className="relative z-20 px-8 md:px-16 max-w-2xl">
                        <span className="text-blue-400 font-semibold tracking-wider uppercase text-sm mb-4 block">New Collection 2026</span>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"> Elevate Your Style with Luxury </h1>
                        <p className="text-slate-300 text-lg mb-8 max-w-lg"> Experience the pinnacle of design and comfort with our curated luxury collection. </p>
                        <button className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold hover:bg-blue-50 transition-all flex items-center gap-3 group">
                            Explore Now
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
                                →
                            </div>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
