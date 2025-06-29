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
        console.log('AuthContext - JWT Decoded:', decoded);
        const userData = { _id: decoded.userId, role: decoded.role || 'user', name: decoded.name, email: decoded.email };
        console.log('AuthContext - Setting user:', userData);
        setUser(userData);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (err) {
        console.error('AuthContext - JWT Decode Error:', err);
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      console.log('AuthContext - No token, clearing user');
      setUser(null);
      localStorage.removeItem('user');
    }
  }, [token]);

  const login = async (email, password, endpoint = '/api/auth/login') => {
    try {
      console.log('AuthContext - Logging in with endpoint:', endpoint);
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('AuthContext - Login Error Response:', errorData);
        throw new Error(errorData.message || 'Login failed');
      }
      const { token, user } = await response.json();
      console.log('AuthContext - Login Response User:', user);
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (err) {
      console.error('AuthContext - Login Error:', err);
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
      console.log('AuthContext - Register Response User:', user);
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (err) {
      console.error('AuthContext - Register Error:', err);
      throw new Error(err.message);
    }
  };

  const logout = () => {
    console.log('AuthContext - Logging out');
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