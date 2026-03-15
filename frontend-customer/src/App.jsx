import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LogIn, User, ShoppingBag, Search, Menu, LogOut, Smartphone, Hash, X, CheckCircle2 } from 'lucide-react';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const { setTokens } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const userId = searchParams.get('user_id');

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken, userId);
      navigate('/');
      window.location.reload(); 
    }
  }, [searchParams, setTokens, navigate]);

  return <div className="min-h-screen flex items-center justify-center">Logging you in...</div>;
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

                <div className="p-10">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">
                            {step === 'otp' && isNewUser ? 'Create Account' : 'Welcome Back'}
                        </h2>
                        <p className="text-slate-500">
                            {step === 'otp' && isNewUser ? 'Please provide your details to complete signup.' : 'Please choose a login method to continue.'}
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
                        <form onSubmit={handlePhoneSubmit} className="space-y-6">
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
                        <form onSubmit={handleOtpSubmit} className="space-y-6">
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
                                {loading ? 'Verifying...' : (isNewUser ? 'Complete Signup' : 'Verify OTP')}
                            </button>
                            <button 
                                type="button"
                                onClick={() => setStep('phone')}
                                className="w-full text-slate-500 text-sm font-medium hover:text-slate-900 transition-colors"
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

const HomePage = () => {
    const { user, logout } = useAuth();
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} />
            
            {/* Header */}
            <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            LuxeStore
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium">Hi, {user.firstName || 'User'}</span>
                                <button onClick={logout} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-600">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setLoginModalOpen(true)}
                                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                            >
                                <LogIn size={18} />
                                Sign In
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
            <main className="pt-32 pb-12 px-4 max-w-7xl mx-auto">
                <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 min-h-[500px] flex items-center">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10"></div>
                    <div className="relative z-20 px-8 md:px-16 max-w-2xl py-20">
                        <div className="flex items-center gap-2 text-blue-400 font-bold tracking-widest uppercase text-xs mb-6 px-3 py-1 bg-blue-500/10 rounded-full w-fit border border-blue-500/20">
                             <CheckCircle2 size={12} /> New Collection 2026
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight tracking-tight"> 
                            Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Style</span> with Luxury 
                        </h1>
                        <p className="text-slate-300 text-xl font-medium mb-10 max-w-lg leading-relaxed"> 
                            Experience the pinnacle of design and comfort with our curated luxury collection. Crafted for those who demand excellence. 
                        </p>
                        <button className="px-10 py-5 bg-white text-slate-900 rounded-full font-black hover:bg-blue-50 transition-all flex items-center gap-4 group shadow-xl">
                            Explore Now
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white group-hover:translate-x-1.5 transition-all shadow-lg shadow-blue-500/30">
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
