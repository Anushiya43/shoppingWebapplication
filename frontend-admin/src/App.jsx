import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AuthSuccess from './components/auth/AuthSuccess';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<Dashboard />} />
          <Route path="/categories" element={<Dashboard />} />
          <Route path="/brands" element={<Dashboard />} />
          <Route path="/orders" element={<Dashboard />} />
          <Route path="/users" element={<Dashboard />} />
          <Route path="/banners" element={<Dashboard />} />
          <Route path="/coupons" element={<Dashboard />} />
          <Route path="/reviews" element={<Dashboard />} />
          <Route path="/bulk-inventory" element={<Dashboard />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;
