import { Routes, Route, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthProvider';
import { CartContext } from './context/CartContext'; 
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import UserLayout from './components/UserLayout';
import Footer from './components/Footer';
import './App.css';

function App() {
  const authContext = useContext(AuthContext);
  const cartContext = useContext(CartContext);
  const location = useLocation(); // 👈 get current route

  const { user = null } = authContext || {};
  const { cart = [] } = cartContext || {};

  // Check if current route starts with /admin
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="app-container">
      {/* Render UserLayout only if not admin */}
      { !isAdminRoute && (
        <UserLayout>
          <Routes>
            <Route path="/" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </UserLayout>
      )}

      {/* Admin routes separate without UserLayout/Footer */}
      { isAdminRoute && (
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      )}

      {/* Footer visible only for non-admin */}
      { !isAdminRoute && <Footer /> }
    </div>
  );
}

export default App;
