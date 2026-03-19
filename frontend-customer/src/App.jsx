import { BrowserRouter as Router, Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
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

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const setTokens = useAuthStore(state => state.setTokens);
  const initAuth = useAuthStore(state => state.initAuth);
  const fetchCart = useCartStore(state => state.fetchCart);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const userId = searchParams.get('user_id');

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken, userId);
      // Use initAuth and fetchCart instead of refresh
      const syncAuth = async () => {
        await initAuth();
        await fetchCart();
        navigate('/');
      };
      syncAuth();
    }
  }, [searchParams, setTokens, initAuth, fetchCart, navigate]);

  return <div className="min-h-screen flex items-center justify-center">Logging you in...</div>;
};

function App() {
  const initAuth = useAuthStore(state => state.initAuth);
  const fetchCart = useCartStore(state => state.fetchCart);

  useEffect(() => {
    const init = async () => {
      await initAuth();
      await fetchCart();
    };
    init();
  }, [initAuth, fetchCart]);

  return (
    <NotificationProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/orders/:id/track" element={<OrderTrackingPage />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;
