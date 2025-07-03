import React from 'react';
import '../styles/Footer.css';
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

      
        <div className="footer-section about">
          <h3>About Us</h3>
          <p>
            Welcome to our E-commerce store where you can find high-quality products at affordable prices.
          </p>
        </div>

      
        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/cart">Cart</a></li>
            <li><a href="/orders">Orders</a></li>
            <li><a href="/profile">Profile</a></li>
          </ul>
        </div>

        
        <div className="footer-section contact">
          <h3>Contact</h3>
          <p>Email: ansif7098@Gmail.com</p>
          <p>Phone: +251 932 367 491</p>
          <p>Location: Adama, Ethiopia</p>
        </div>

        
        <div className="footer-section social">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <a href="#"><FaFacebookF /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaLinkedinIn /></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} E-commerce Store. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
