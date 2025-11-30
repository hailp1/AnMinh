import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PageTransition from './components/PageTransition';
import Login from './pages/Login';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Map from './pages/Map';
import StationDetail from './pages/StationDetail';
import CreatePharmacy from './pages/CreatePharmacy';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Chat from './pages/Chat';
import CreateOrder from './pages/CreateOrder';
import OrderSummary from './pages/OrderSummary';
import OrderInvoice from './pages/OrderInvoice';
import Customers from './pages/Customers';
import Visit from './pages/Visit';
import EditCustomer from './pages/EditCustomer';

// Admin imports
import AdminLogin from './pages/admin/AdminLogin';
import AdminWrapper from './pages/admin/AdminWrapper';
import AdminDashboardPage from './pages/admin/AdminDashboard';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminRoutes from './pages/admin/AdminRoutes';
import AdminMap from './pages/admin/AdminMap';
import AdminReports from './pages/admin/AdminReports';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminReset from './pages/admin/AdminReset';
import AdminPromotions from './pages/admin/AdminPromotions';
import AdminLoyalty from './pages/admin/AdminLoyalty';
import AdminCustomerSegments from './pages/admin/AdminCustomerSegments';
import AdminTradeActivities from './pages/admin/AdminTradeActivities';
import AdminKPI from './pages/admin/AdminKPI';
import AdminApprovals from './pages/admin/AdminApprovals';

import './styles-production.css';

function AppContent() {
  const location = useLocation();
  const isOnboarding = location.pathname === '/';
  const isAuthPage = location.pathname === '/forgot-password' || location.pathname === '/reset-password' || location.pathname === '/login-simple';
  const isAdminPage = location.pathname.startsWith('/admin');

  // Admin routes
  if (isAdminPage) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminWrapper><AdminDashboardPage /></AdminWrapper>} />
        <Route path="/admin/customers" element={<AdminWrapper><AdminCustomers /></AdminWrapper>} />
        <Route path="/admin/routes" element={<AdminWrapper><AdminRoutes /></AdminWrapper>} />
        <Route path="/admin/map" element={<AdminWrapper><AdminMap /></AdminWrapper>} />
        <Route path="/admin/reports" element={<AdminWrapper><AdminReports /></AdminWrapper>} />
        <Route path="/admin/orders" element={<AdminWrapper><AdminOrders /></AdminWrapper>} />
        <Route path="/admin/products" element={<AdminWrapper><AdminProducts /></AdminWrapper>} />
        <Route path="/admin/users" element={<AdminWrapper><AdminUsers /></AdminWrapper>} />
        <Route path="/admin/settings" element={<AdminWrapper><AdminSettings /></AdminWrapper>} />
        <Route path="/admin/reset" element={<AdminWrapper><AdminReset /></AdminWrapper>} />
        <Route path="/admin/promotions" element={<AdminWrapper><AdminPromotions /></AdminWrapper>} />
        <Route path="/admin/loyalty" element={<AdminWrapper><AdminLoyalty /></AdminWrapper>} />
        <Route path="/admin/customer-segments" element={<AdminWrapper><AdminCustomerSegments /></AdminWrapper>} />
        <Route path="/admin/trade-activities" element={<AdminWrapper><AdminTradeActivities /></AdminWrapper>} />
        <Route path="/admin/kpi" element={<AdminWrapper><AdminKPI /></AdminWrapper>} />
        <Route path="/admin/approvals" element={<AdminWrapper><AdminApprovals /></AdminWrapper>} />
      </Routes>
    );
  }

  return (
    <div className="App" style={{
      backgroundColor: '#1E4A8B',
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden'
    }}>
      <div style={{
        width: '480px',
        maxWidth: '100%',
        backgroundColor: '#fff',
        height: '87%', // Adjusted for zoom 1.15 (100/1.15 ~= 87)
        position: 'relative',
        boxShadow: '0 0 20px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        zoom: 1.15
      }}>
        {!isOnboarding && !isAuthPage && <Navbar isMobileMode={true} />}
        <div className={`main-content ${isOnboarding ? 'onboarding-mode' : ''} ${isAuthPage ? 'auth-mode' : ''}`} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', width: '100%' }}>
          <PageTransition>
            <Routes>
              <Route path="/" element={<Onboarding />} />
              <Route path="/login-simple" element={<Login />} />
              <Route path="/home" element={<Home />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/map" element={<Map />} />
              <Route path="/station/:id" element={<StationDetail />} />
              <Route path="/create-pharmacy" element={<CreatePharmacy />} />
              <Route path="/edit-pharmacy/:id" element={<CreatePharmacy />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />

              <Route path="/chat/:userId" element={<Chat />} />
              <Route path="/create-order" element={<CreateOrder />} />
              <Route path="/order/create/:id" element={<CreateOrder />} />
              <Route path="/order/invoice/:id" element={<OrderInvoice />} />
              <Route path="/visit/:id" element={<Visit />} />
              <Route path="/customer/edit/:id" element={<EditCustomer />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/order-summary" element={<OrderSummary />} />
            </Routes>
          </PageTransition>
        </div>
        <div style={{ flexShrink: 0, width: '100%', position: 'relative', zIndex: 1000 }}>
          {!isOnboarding && !isAuthPage && <Footer />}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;