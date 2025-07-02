import { Routes, Route } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
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
import './App.css';

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      {/* Wrap user routes inside UserLayout */}
      <Route
        path="/"
        element={
          <UserLayout>
            <Products />
          </UserLayout>
        }
      />
      <Route
        path="/product/:id"
        element={
          <UserLayout>
            <ProductDetails />
          </UserLayout>
        }
      />
      <Route
        path="/cart"
        element={
          <UserLayout>
            <Cart />
          </UserLayout>
        }
      />
      <Route
        path="/login"
        element={
          <UserLayout>
            <Login />
          </UserLayout>
        }
      />
      <Route
        path="/register"
        element={
          <UserLayout>
            <Register />
          </UserLayout>
        }
      />
      <Route
        path="/checkout"
        element={
          <UserLayout>
            <Checkout />
          </UserLayout>
        }
      />
      <Route
        path="/orders"
        element={
          <UserLayout>
            <Orders />
          </UserLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <UserLayout>
            <Profile />
          </UserLayout>
        }
      />

      {/* Admin Dashboard - no layout */}
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        }
      />
    </Routes>
  );
}

export default App;
