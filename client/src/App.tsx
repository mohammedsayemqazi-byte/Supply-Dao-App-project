import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { DeliveryAreaProvider } from './context/DeliveryAreaContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import SupplierDirectory from './pages/SupplierDirectory';
import SupplierProfile from './pages/SupplierProfile';
import Cart from './pages/buyer/Cart';
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import SupplierDashboard from './pages/supplier/SupplierDashboard';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, profile, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e2006a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (roles && profile && !roles.includes(profile.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/suppliers" element={<Layout><SupplierDirectory /></Layout>} />
      <Route path="/suppliers/:id" element={<Layout><SupplierProfile /></Layout>} />
      <Route path="/cart" element={<ProtectedRoute><Layout><Cart /></Layout></ProtectedRoute>} />
      <Route path="/bookings" element={<ProtectedRoute><Layout><BuyerDashboard /></Layout></ProtectedRoute>} />
      <Route path="/supplier/dashboard" element={
        <ProtectedRoute roles={['supplier']}>
          <Layout><SupplierDashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <DeliveryAreaProvider>
            <AppRoutes />
          </DeliveryAreaProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
