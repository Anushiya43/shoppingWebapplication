import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AuthSuccess from './components/auth/AuthSuccess';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory" element={<Dashboard />} />
        <Route path="/categories" element={<Dashboard />} />
        <Route path="/orders" element={<Dashboard />} />
        <Route path="/users" element={<Dashboard />} />
        <Route path="/banners" element={<Dashboard />} />
        <Route path="/coupons" element={<Dashboard />} />
        <Route path="/auth-success" element={<AuthSuccess />} />
      </Routes>
    </Router>
  );
}

export default App;
