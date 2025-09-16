

// src/context/AuthProvider.jsx
import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { login, register } from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);

        if (!decoded || !decoded.userId) {
          throw new Error('Invalid token payload');
        }

        const storedUser = localStorage.getItem('user');

        if (storedUser) {
          const parsedStoredUser = JSON.parse(storedUser);
          if (parsedStoredUser._id === decoded.userId) {
            setUser(parsedStoredUser);
            return;
          }
        }

        const userData = {
          _id: decoded.userId,
          role: decoded.role || 'user',
          name: decoded.name || '',
          email: decoded.email || '',
          iat: decoded.iat,
          exp: decoded.exp,
        };

        const serializedUserData = JSON.stringify(userData);
        if (localStorage.getItem('user') !== serializedUserData) {
          localStorage.setItem('user', serializedUserData);
        }

        setUser(userData);
      } catch (err) {
        console.error('AuthContext - JWT Decode Error:', err);
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

  const loginUser = async (email, password, endpoint = '/api/auth/login') => {
    try {
      const { data } = await login(email, password);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      console.error('AuthContext - Login Error:', err);
      throw err.response?.data?.message || 'Login failed';
    }
  };

  const registerUser = async (name, email, password) => {
    try {
      const { data } = await register(name, email, password);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      console.error('AuthContext - Register Error:', err);
      throw err.response?.data?.message || 'Registration failed';
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login: loginUser, register: registerUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};