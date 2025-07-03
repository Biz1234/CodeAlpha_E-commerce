import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode } from 'jwt-decode';
import '../../styles/AdminDashboard.css';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', price: '', description: '', stock: '', category: '' });
  const [image, setImage] = useState(null);
  const [editProductId, setEditProductId] = useState(null);
  const [bannerForm, setBannerForm] = useState({ message: '', link: '', expiresAt: '' });
  const [editBannerId, setEditBannerId] = useState(null);

  if (!user || user.role !== 'admin') return <div>Access denied. Admin only.</div>;

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          toast.error('Session expired. Please log in again.');
          logout();
          navigate('/login');
          return;
        }
      } catch (err) {
        toast.error('Invalid token. Please log in again.');
        logout();
        navigate('/login');
        return;
      }
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (activeTab === 'orders') {
          const res = await axios.get('http://localhost:5000/api/order', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setOrders(res.data);
        } else if (activeTab === 'products') {
          const res = await axios.get('http://localhost:5000/api/products', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setProducts(res.data);
        } else if (activeTab === 'banners') {
          const res = await axios.get('http://localhost:5000/api/banners', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setBanners(res.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || `Failed to load ${activeTab}`);
        toast.error(err.response?.data?.message || `Failed to load ${activeTab}`);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [activeTab, token, logout,navigate]);

const handleLogout = () => {
    logout();
    navigate('/login');
  };



  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/order/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders((prev) => prev.map((order) => (order._id === orderId ? res.data : order)));
      toast.success('Order status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(productForm).forEach(([key, value]) => formData.append(key, value));
    if (image) formData.append('image', image);
    try {
      if (editProductId) {
        const res = await axios.put(
          `http://localhost:5000/api/products/${editProductId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
        );
        setProducts((prev) => prev.map((p) => (p._id === editProductId ? res.data : p)));
        toast.success('Product updated');
      } else {
        const res = await axios.post('http://localhost:5000/api/products', formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        setProducts([...products, res.data]);
        toast.success('Product added');
      }
      setProductForm({ name: '', price: '', description: '', stock: '', category: '' });
      setImage(null);
      setEditProductId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      toast.success('Product deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editBannerId) {
        const res = await axios.put(
          `http://localhost:5000/api/banners/${editBannerId}`,
          bannerForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBanners((prev) => prev.map((b) => (b._id === editBannerId ? res.data : b)));
        toast.success('Banner updated');
      } else {
        const res = await axios.post('http://localhost:5000/api/banners', bannerForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBanners([...banners, res.data]);
        toast.success('Banner added');
      }
      setBannerForm({ message: '', link: '', expiresAt: '' });
      setEditBannerId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save banner');
    }
  };

  const deleteBanner = async (bannerId) => {
    try {
      await axios.delete(`http://localhost:5000/api/banners/${bannerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBanners((prev) => prev.filter((b) => b._id !== bannerId));
      toast.success('Banner deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete banner');
    }
  };

  const editProduct = (product) => {
    setProductForm({
      name: product.name,
      price: product.price,
      description: product.description,
      stock: product.stock,
      category: product.category,
    });
    setEditProductId(product._id);
    setImage(null);
  };

  const editBanner = (banner) => {
    setBannerForm({
      message: banner.message,
      link: banner.link,
      expiresAt: banner.expiresAt ? new Date(banner.expiresAt).toISOString().slice(0, 16) : '',
    });
    setEditBannerId(banner._id);
  };

  return (
    <div className="admin-dashboard">
        <div className="admin-topbar">
        <h2>Welcome, {user.name} (Admin)</h2>
        <button className="admin-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div className="tabs">
        <button onClick={() => setActiveTab('orders')} className={activeTab === 'orders' ? 'active' : ''}>
          Orders
        </button>
        <button onClick={() => setActiveTab('products')} className={activeTab === 'products' ? 'active' : ''}>
          Products
        </button>
        <button onClick={() => setActiveTab('banners')} className={activeTab === 'banners' ? 'active' : ''}>
          Banners
        </button>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}

      {activeTab === 'orders' && (
        <div>
          <h3>Manage Orders</h3>
          {orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>User</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id}</td>
                    <td>{order.userId?.name || 'Unknown User'}</td>
                    <td>${order.totalAmount.toFixed(2)}</td>
                    <td>{order.status}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <select
                        defaultValue={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'products' && (
        <div>
          <h3>Manage Products</h3>
          <form onSubmit={handleProductSubmit}>
            <input
              type="text"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              placeholder="Product Name"
              required
            />
            <input
  type="text"
  value={productForm.price}
  onChange={(e) => {
    const value = e.target.value;
   
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setProductForm({ ...productForm, price: value });
    }
  }}
  placeholder="Price (e.g., 99.99)"
  required
/>

            <textarea
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              placeholder="Description"
              required
            />
            <input
              type="number"
              value={productForm.stock}
              onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
              placeholder="Stock"
              required
              min="0"
            />
            <input
              type="text"
              value={productForm.category}
              onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
              placeholder="Category"
              required
            />
            <input
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              accept="image/jpeg,image/png"
              required={!editProductId}
            />
            <button type="submit">{editProductId ? 'Update Product' : 'Add Product'}</button>
          </form>
          <h4>Product List</h4>
          {products.length === 0 ? (
            <p>No products found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>{product.stock}</td>
                    <td>{product.category}</td>
                    <td>
                      <button onClick={() => editProduct(product)}>Edit</button>
                      <button onClick={() => deleteProduct(product._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'banners' && (
        <div>
          <h3>Manage Banners</h3>
          <form onSubmit={handleBannerSubmit}>
            <input
              type="text"
              value={bannerForm.message}
              onChange={(e) => setBannerForm({ ...bannerForm, message: e.target.value })}
              placeholder="Banner Message"
              required
            />
            <input
              type="text"
              value={bannerForm.link}
              onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })}
              placeholder="Link (e.g., /products)"
            />
            <input
              type="datetime-local"
              value={bannerForm.expiresAt}
              onChange={(e) => setBannerForm({ ...bannerForm, expiresAt: e.target.value })}
              placeholder="Expiration Date"
            />
            <button type="submit">{editBannerId ? 'Update Banner' : 'Add Banner'}</button>
          </form>
          <h4>Banner List</h4>
          {banners.length === 0 ? (
            <p>No banners found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Message</th>
                  <th>Link</th>
                  <th>Active</th>
                  <th>Expires</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((banner) => (
                  <tr key={banner._id}>
                    <td>{banner.message}</td>
                    <td>{banner.link}</td>
                    <td>{banner.isActive ? 'Yes' : 'No'}</td>
                    <td>{banner.expiresAt ? new Date(banner.expiresAt).toLocaleString() : '-'}</td>
                    <td>
                      <button onClick={() => editBanner(banner)}>Edit</button>
                      <button onClick={() => deleteBanner(banner._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default AdminDashboard;