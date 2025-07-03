import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
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
import Footer from './components/Footer'; // ✅ Import Footer component
import './App.css';
import {
  FaHome,
  FaShoppingCart,
  FaBoxOpen,
  FaUserCircle,
  FaSignInAlt,
  FaRegUser,
} from 'react-icons/fa';

function App() {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // ⛔️ Hide navbar and footer on login, register, and admin dashboard
  const hideUI =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/admin';

  return (
    <div className="app-container">
      {!hideUI && (
        <>
          <nav className="navbar">
            <div className="nav-left">
              <Link to="/" className="nav-link">
                <FaHome /> Home
              </Link>
              <Link to="/cart" className="nav-link">
                <FaShoppingCart /> Cart
                {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
              </Link>
              <Link to="/orders" className="nav-link">
                <FaBoxOpen /> Orders
              </Link>
              <Link to="/profile" className="nav-link">
                <FaUserCircle /> Profile
              </Link>
            </div>
            <div className="nav-right">
              {user ? (
                <>
                  <span className="welcome-text">Hi, {user.name}</span>
                  <button className="logout-btn" onClick={handleLogout}>
                    <FaSignInAlt /> Logout
                  </button>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="nav-link">
                      <FaUserCircle /> Admin
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-link">
                    <FaSignInAlt /> Login
                  </Link>
                  <Link to="/register" className="nav-link">
                    <FaRegUser /> Register
                  </Link>
                </>
              )}
            </div>
          </nav>

          <h1 className="page-title">E-commerce Store</h1>
        </>
      )}

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </main>

      {/* ✅ Show Footer unless on login/register/admin */}
      {!hideUI && <Footer />}
    </div>
  );
}

export default App;
