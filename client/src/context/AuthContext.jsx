import  { createContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log('JWT Decoded:', decoded); // Debug: Log JWT payload
        setUser({ _id: decoded.userId, role: decoded.role || 'user' });
        localStorage.setItem('token', token);
      } catch (err) {
        console.error('JWT Decode Error:', err);
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      setUser(null);
      localStorage.removeItem('user');
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      const { token, user } = await response.json();
      console.log('Login Response User:', user); // Debug: Log user object
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (err) {
      console.error('Login Error:', err);
      throw new Error(err.message);
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      const { token, user } = await response.json();
      console.log('Register Response User:', user); // Debug: Log user object
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (err) {
      console.error('Register Error:', err);
      throw new Error(err.message);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};