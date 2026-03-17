import { BrowserRouter as Router, Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

// Pages
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import LoginPage from './pages/LoginPage';
import OrderSuccessPage from './pages/OrderSuccessPage';

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

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth-success" element={<AuthSuccess />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
            </Routes>
          </Router>
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
