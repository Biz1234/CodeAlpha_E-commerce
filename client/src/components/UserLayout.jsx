// src/layouts/UserLayout.jsx
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

import {
  FaHome,
  FaShoppingCart,
  FaBoxOpen,
  FaUserCircle,
  FaSignInAlt,
  FaRegUser,
  FaTimes,
} from 'react-icons/fa';

const UserLayout = ({ children }) => {
  const authContext = useContext(AuthContext);
  const cartContext = useContext(CartContext);
  
  const { user = null, logout = () => {} } = authContext || {};
  const { cart = [] } = cartContext || {};
  
  const navigate = useNavigate();

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    closeMobileMenu();
  };

  const cartItemCount = cart.reduce((total, item) => total + (item.quantity || 0), 0);

  return (
    <div className="app-container">
      <nav className="navbar">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          <span>E-</span>
          <span className="navbar-logo-accent">Store</span>
        </Link>

        {/* Left navigation (desktop) */}
        <div className="nav-left">
          <Link to="/" className="nav-link">
            <FaHome /> Home
          </Link>
          <Link to="/cart" className="nav-link">
            <FaShoppingCart />
            {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>} cart
          </Link>
          <Link to="/orders" className="nav-link">
            <FaBoxOpen /> Orders
          </Link>
          <Link to="/profile" className="nav-link">
            <FaUserCircle /> Profile
          </Link>
        </div>

        {/* Right navigation (desktop) */}
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

        {/* Mobile menu toggle */}
        <button 
          className="mobile-menu-toggle" 
          onClick={toggleMobileMenu}
          aria-label="Open menu"
        >
          ☰
        </button>
      </nav>

      {/* Mobile left sidebar */}
      <div className={`nav-left ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
        <button className="mobile-close-btn" onClick={closeMobileMenu}>
          <FaTimes />
        </button>
        
        <Link to="/" className="nav-link" onClick={closeMobileMenu}>
          <FaHome /> Home
        </Link>
        <Link to="/cart" className="nav-link" onClick={closeMobileMenu}>
          <FaShoppingCart />
          {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>} cart
        </Link>
        <Link to="/orders" className="nav-link" onClick={closeMobileMenu}>
          <FaBoxOpen /> Orders
        </Link>
        <Link to="/profile" className="nav-link" onClick={closeMobileMenu}>
          <FaUserCircle /> Profile
        </Link>
        
        {/* User section in mobile menu */}
        <div className="mobile-user-section">
          {user ? (
            <>
              <div className="mobile-user-info">
                <FaUserCircle />
                <span>Hi, {user.name}</span>
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                <FaSignInAlt /> Logout
              </button>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link" onClick={closeMobileMenu}>
                  <FaUserCircle /> Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={closeMobileMenu}>
                <FaSignInAlt /> Login
              </Link>
              <Link to="/register" className="nav-link" onClick={closeMobileMenu}>
                <FaRegUser /> Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile overlay */}
      <div 
        className={`mobile-nav-overlay ${isMobileMenuOpen ? 'active' : ''}`} 
        onClick={closeMobileMenu}
      ></div>

      <main className="main-content">
        <h1 className="page-title">E-commerce Store</h1>
        {children}
      </main>
    </div>
  );
};

export default UserLayout;
