// src/layouts/UserLayout.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import {
  FaHome,
  FaShoppingCart,
  FaBoxOpen,
  FaUserCircle,
  FaSignInAlt,
  FaRegUser,
} from 'react-icons/fa';

const UserLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="app-container">
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

      <main className="main-content">
        <h1 className="page-title">E-commerce Store</h1>
        {children}
      </main>
    </div>
  );
};

export default UserLayout;
