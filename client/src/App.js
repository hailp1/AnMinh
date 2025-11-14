import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PageTransition from './components/PageTransition';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import QuickRegister from './pages/QuickRegister';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NearbyStations from './pages/NearbyStations';
import Map from './pages/Map';
import StationDetail from './pages/StationDetail';
import CreateStation from './pages/CreateStation';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import Chat from './pages/Chat';
import CreateOrder from './pages/CreateOrder';
import OrderSummary from './pages/OrderSummary';
import './styles-production.css';

function AppContent() {
  const location = useLocation();
  const isOnboarding = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/quick-register' || location.pathname === '/forgot-password' || location.pathname === '/reset-password';

  return (
    <div className="App">
      {!isOnboarding && !isAuthPage && <Navbar />}
      <div className={`main-content ${isOnboarding ? 'onboarding-mode' : ''} ${isAuthPage ? 'auth-mode' : ''}`}>
        <PageTransition>
          <Routes>
            <Route path="/" element={<Onboarding />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<QuickRegister />} />
            <Route path="/quick-register" element={<QuickRegister />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/nearby" element={<NearbyStations />} />
            <Route path="/map" element={<Map />} />
            <Route path="/station/:id" element={<StationDetail />} />
            <Route path="/create-station" element={<CreateStation />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/chat/:userId" element={<Chat />} />
            <Route path="/create-order" element={<CreateOrder />} />
            <Route path="/order-summary" element={<OrderSummary />} />
          </Routes>
        </PageTransition>
      </div>
      {!isOnboarding && !isAuthPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;