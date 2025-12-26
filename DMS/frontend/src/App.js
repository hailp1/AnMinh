import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
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
import KPI from './pages/KPI';
import Promotions from './pages/Promotions';
import ProductCatalog from './pages/ProductCatalog';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import Reports from './pages/Reports';

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
import AdminCategories from './pages/admin/AdminCategories';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminReset from './pages/admin/AdminReset';
import AdminPromotions from './pages/admin/AdminPromotions';
import AdminLoyalty from './pages/admin/AdminLoyalty';
import AdminCustomerSegments from './pages/admin/AdminCustomerSegments';
import AdminTradeActivities from './pages/admin/AdminTradeActivities';
import AdminKPI from './pages/admin/AdminKPI';
import AdminApprovals from './pages/admin/AdminApprovals';
import AdminInventory from './pages/admin/AdminInventory';
import BizReview from './pages/admin/BizReview';
import OrgStructure from './pages/admin/OrgStructure';
import AdminAOP from './pages/admin/AdminAOP';

const AppContent = () => {
  const location = useLocation();
  const isOnboarding = location.pathname === '/';
  const isAuthPage = ['/login', '/login-simple', '/forgot-password', '/reset-password'].includes(location.pathname);
  const isAdminRoute = location.pathname.startsWith('/Anminh/admin');
  const isOldAdminRoute = location.pathname.startsWith('/admin') && !location.pathname.startsWith('/Anminh/admin');

  // Redirect old /admin routes to /Anminh/admin
  if (isOldAdminRoute) {
    const newPath = location.pathname.replace('/admin', '/Anminh/admin');
    window.location.replace(newPath);
    return null;
  }

  // Handle Admin Routes
  if (isAdminRoute) {
    // Check if it's exactly /Anminh/admin (login page)
    if (location.pathname === '/Anminh/admin') {
      return <AdminLogin />;
    }

    // Otherwise, it's an admin dashboard route
    return (
      <AdminWrapper>
        <Routes>
          <Route path="/Anminh/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/Anminh/admin/customers" element={<AdminCustomers />} />
          <Route path="/Anminh/admin/routes" element={<AdminRoutes />} />
          <Route path="/Anminh/admin/map" element={<AdminMap />} />
          <Route path="/Anminh/admin/reports" element={<AdminReports />} />
          <Route path="/Anminh/admin/orders" element={<AdminOrders />} />
          <Route path="/Anminh/admin/products" element={<AdminProducts />} />
          <Route path="/Anminh/admin/categories" element={<AdminCategories />} />
          <Route path="/Anminh/admin/users" element={<AdminUsers />} />
          <Route path="/Anminh/admin/settings" element={<AdminSettings />} />
          <Route path="/Anminh/admin/reset" element={<AdminReset />} />
          <Route path="/Anminh/admin/promotions" element={<AdminPromotions />} />
          <Route path="/Anminh/admin/loyalty" element={<AdminLoyalty />} />
          <Route path="/Anminh/admin/segments" element={<AdminCustomerSegments />} />
          <Route path="/Anminh/admin/trade-activities" element={<AdminTradeActivities />} />
          <Route path="/Anminh/admin/kpi" element={<AdminKPI />} />
          <Route path="/Anminh/admin/approvals" element={<AdminApprovals />} />
          <Route path="/Anminh/admin/inventory" element={<AdminInventory />} />
          <Route path="/Anminh/admin/biz-review" element={<BizReview />} />
          <Route path="/Anminh/admin/org-structure" element={<OrgStructure />} />
          <Route path="/Anminh/admin/aop-planning" element={<AdminAOP />} />
        </Routes>
      </AdminWrapper>
    );
  }

  // Handle User App Routes (Mobile Layout)
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      backgroundColor: '#e0e5ec',
      overflow: 'hidden'
    }}>
      <div className="app-frame">
        {!isOnboarding && !isAuthPage && <Navbar isMobileMode={true} />}

        <div className="app-content scroll-container" style={{
          paddingBottom: (!isOnboarding && !isAuthPage) ? '90px' : '0'
        }}>

          <PageTransition>
            <Routes>
              <Route path="/" element={<Onboarding />} />
              <Route path="/login" element={<Login />} />
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
              <Route path="/order/edit/:orderId" element={<CreateOrder />} />
              <Route path="/order/invoice/:id" element={<OrderInvoice />} />
              <Route path="/visit/:id" element={<Visit />} />
              <Route path="/customer/edit/:id" element={<EditCustomer />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/order-summary" element={<OrderSummary />} />
              <Route path="/kpi" element={<KPI />} />
              <Route path="/promotions" element={<Promotions />} />
              <Route path="/products" element={<ProductCatalog />} />
              <Route path="/dashboard" element={<AnalyticsDashboard />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </PageTransition>
        </div>

        {/* Bottom Navigation - Hide on pages with custom footers */}
        {!isOnboarding && !isAuthPage && !location.pathname.includes('/order/create') && !location.pathname.includes('/visit/') && <BottomNav />}
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