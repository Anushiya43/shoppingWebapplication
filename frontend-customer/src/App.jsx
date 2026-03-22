import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import useCartStore from './store/useCartStore';

// Contexts
import { NotificationProvider } from './context/NotificationContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import ProductDetailPage from './pages/ProductDetailPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import OffersPage from './pages/OffersPage';
import ProfilePage from './pages/ProfilePage';
import AddressManagement from './pages/AddressManagement';
import SupportPage from './pages/SupportPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

// AuthSuccess removed in favor of direct store tokens if needed,
// but keeping it simple for now if the user actually uses it for redirect flows.
// The persist middleware handles the tokens now.
const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const setTokens = useAuthStore(state => state.setTokens);
  const initAuth = useAuthStore(state => state.initAuth);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const userId = searchParams.get('user_id');

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken, userId);
      initAuth().then(() => navigate('/'));
    } else if (searchParams.get('error')) {
      navigate(`/login?error=${searchParams.get('error')}`);
    }
  }, [searchParams, setTokens, initAuth, navigate]);

  return <div className="min-h-screen flex items-center justify-center">Authenticating...</div>;
};

function App() {
  const { initAuth, loading, user } = useAuthStore();
  const fetchCart = useCartStore(state => state.fetchCart);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Fetch cart separately bits by bits after auth is ready or if user exists
  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user, fetchCart]);

  return (
    <NotificationProvider>
      <Router>
        {loading ? (
          <div key="loading-barrier" className="min-h-screen flex items-center justify-center bg-surface-bg flex-col gap-6 p-8 text-center animate-in fade-in duration-500">
            <div className="w-16 h-16 border-[5px] border-primary-900/5 border-t-accent-blue rounded-full animate-spin"></div>
            <div className="space-y-2">
              <p className="font-black text-primary-900 uppercase tracking-[0.2em] text-xs">Modern Shop</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Restoring Secure Session...</p>
            </div>
          </div>
        ) : (
          <React.Suspense fallback={null}>
            <Routes key={user ? 'auth' : 'guest'}>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth-success" element={<AuthSuccess />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="/order-success/:orderId" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/orders/:id/track" element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />
              <Route path="/offers" element={<OffersPage />} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/addresses" element={<ProtectedRoute><AddressManagement /></ProtectedRoute>} />
              <Route path="/support" element={<SupportPage />} />
            </Routes>
          </React.Suspense>
        )}
      </Router>
    </NotificationProvider>
  );
}

export default App;
