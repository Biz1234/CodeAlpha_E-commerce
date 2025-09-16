import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

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

  const login = async (email, password, endpoint = '/api/auth/login') => {
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const { token, user } = await response.json();

      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return user;
    } catch (err) {
      console.error('AuthContext - Login Error:', err);
      throw err;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const { token, user } = await response.json();

      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return user;
    } catch (err) {
      console.error('AuthContext - Register Error:', err);
      throw err;
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


