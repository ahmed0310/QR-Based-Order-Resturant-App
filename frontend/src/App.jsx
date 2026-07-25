import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MasterLogin from './pages/MasterLogin';
import ShopLogin from './pages/ShopLogin';
import PrivateRoute from './components/PrivateRoute';
import MasterLayout from './components/MasterLayout';
import ShopLayout from './components/ShopLayout';
import MasterDashboard from './pages/master/MasterDashboard';
import ManageShopsPage from './pages/master/ManageShopsPage';
import CreateShop from './pages/master/CreateShop';
import CreateMasterAdmin from './pages/master/CreateMasterAdmin';
import ShopDashboard from './pages/shop/ShopDashboard';
import ShopProfile from './pages/shop/ShopProfile';
import ManageMenu from './pages/shop/ManageMenu';
import ManageTables from './pages/shop/ManageTables';
import QRCode from './pages/shop/QRCode';
import PublicMenu from './pages/public/PublicMenu';
import PublicOrder from './pages/public/PublicOrder';
import QRLanding from './pages/customer/QRLanding';
import CustomerMenu from './pages/customer/CustomerMenu';
import CustomerCheckout from './pages/customer/CustomerCheckout';
import OrderStatus from './pages/customer/OrderStatus';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to master login */}
        <Route path="/" element={<Navigate to="/login/master" replace />} />
        
        {/* Login Routes */}
        <Route path="/login/master" element={<MasterLogin />} />
        <Route path="/login/shop" element={<ShopLogin />} />
        
        {/* Public Routes */}
        <Route path="/menu/:shopId" element={<PublicMenu />} />
        <Route path="/order/:shopId" element={<PublicOrder />} />
        
        {/* Customer Routes */}
        <Route path="/table/:qrCode" element={<QRLanding />} />
        <Route path="/customer/menu/:shopId/:tableId" element={<CustomerMenu />} />
        <Route path="/customer/checkout/:shopId/:tableId" element={<CustomerCheckout />} />
        <Route path="/customer/order-status/:orderId/:phoneNumber" element={<OrderStatus />} />
        
        {/* Master Admin Routes */}
        <Route
          path="/master"
          element={
            <PrivateRoute allowedRole="master">
              <MasterLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/master/dashboard" replace />} />
          <Route path="dashboard" element={<MasterDashboard />} />
          <Route path="shops" element={<ManageShopsPage />} />
          <Route path="create-shop" element={<CreateShop />} />
          <Route path="create-admin" element={<CreateMasterAdmin />} />
        </Route>
        
        {/* Shop Admin Routes */}
        <Route
          path="/shop"
          element={
            <PrivateRoute allowedRole="shop">
              <ShopLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/shop/dashboard" replace />} />
          <Route path="dashboard" element={<ShopDashboard />} />
          <Route path="profile" element={<ShopProfile />} />
          <Route path="menu" element={<ManageMenu />} />
          <Route path="tables" element={<ManageTables />} />
          <Route path="qr-code" element={<QRCode />} />
        </Route>
        
        {/* 404 Route */}
        <Route path="*" element={<div className="min-h-screen flex items-center justify-center bg-background"><h1 className="text-2xl text-foreground">404 - Page Not Found</h1></div>} />
      </Routes>
    </Router>
  );
}

export default App;
