import { Routes, Route, Link, useNavigate } from 'react-router-dom';
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
     import Admin from './pages/Admin';
     import AdminLogin from './pages/AdminLogin';
      import ProtectedAdminRoute from './components/ProtectedAdminRoute';
     import './App.css';

     function App() {
       const { user, logout } = useContext(AuthContext);
       const { cart } = useContext(CartContext);
       const navigate = useNavigate();

       const handleLogout = () => {
         logout();
         navigate(user && user.role === 'admin' ? '/admin-login' : '/');
       };

       const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

       // Admin layout: only show Admin page
       if (user && user.role === 'admin') {
         return (
           <div>
             <Routes>
               <Route path="/admin" element={<Admin />} />
               <Route path="*" element={<Admin />} /> {/* Redirect all routes to /admin for admins */}
             </Routes>
           </div>
         );
       }

       // User layout: show navbar and user routes
       return (
         <div>
           <nav className="navbar">
             <Link to="/">Home</Link>
             <Link to="/cart">
               Cart {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
             </Link>
             <Link to="/orders">Orders</Link>
             <Link to="/profile">Profile</Link>
             {user ? (
               <>
                 <span>Welcome, {user.name}</span>
                 <button onClick={handleLogout}>Logout</button>
               </>
             ) : (
               <>
                 <Link to="/login">Login</Link>
                 <Link to="/register">Register</Link>
                 <Link to="/admin-login">Admin Login</Link> {/* Allow access to admin login */}
               </>
             )}
           </nav>
           <h1>E-commerce Store</h1>
           <Routes>
             <Route path="/" element={<Products />} />
             <Route path="/product/:id" element={<ProductDetails />} />
             <Route path="/cart" element={<Cart />} />
             <Route path="/login" element={<Login />} />
             <Route path="/register" element={<Register />} />
             <Route path="/checkout" element={<Checkout />} />
             <Route path="/orders" element={<Orders />} />
             <Route path="/profile" element={<Profile />} />
             <Route path="/admin-login" element={<AdminLogin />} />
             <Route path="/admin" element={<ProtectedAdminRoute><Admin /></ProtectedAdminRoute>} />
           </Routes>
         </div>
       );
     }

     export default App;