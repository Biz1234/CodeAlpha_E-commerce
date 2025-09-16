import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthProvider';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import {
  fetchAllOrders,
  updateOrderStatus,
  fetchAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../../api';
import '../../styles/AdminDashboard.css';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (!user || user.role !== 'admin') return <div className="access-denied">Access denied. Admin only.</div>;

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          toast.error('Session expired. Please log in again.', {
            position: 'top-right',
            autoClose: 3000,
          });
          logout();
          navigate('/login');
          return;
        }
      } catch (err) {
        toast.error('Invalid token. Please log in again.', {
          position: 'top-right',
          autoClose: 3000,
        });
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
          const { data } = await fetchAllOrders(token);
          setOrders(data);
        } else if (activeTab === 'products') {
          const { data } = await fetchAllProducts(token);
          setProducts(data);
        } else if (activeTab === 'banners') {
          const { data } = await fetchAllBanners(token);
          setBanners(data);
        }
      } catch (err) {
        setError(err.response?.data?.message || `Failed to load ${activeTab}`);
        toast.error(err.response?.data?.message || `Failed to load ${activeTab}`, {
          position: 'top-right',
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [activeTab, token, logout, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const updateOrderStatusHandler = async (orderId, newStatus) => {
    try {
      const { data } = await updateOrderStatus(orderId, newStatus, token);
      setOrders((prev) => prev.map((order) => (order._id === orderId ? data : order)));
      toast.success('Order status updated', {
        position: 'top-right',
        autoClose: 2000,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(productForm).forEach(([key, value]) => formData.append(key, value));
    if (image) formData.append('image', image);
    try {
      if (editProductId) {
        const { data } = await updateProduct(editProductId, formData, token);
        setProducts((prev) => prev.map((p) => (p._id === editProductId ? data : p)));
        toast.success('Product updated', {
          position: 'top-right',
          autoClose: 2000,
        });
      } else {
        const { data } = await createProduct(formData, token);
        setProducts([...products, data]);
        toast.success('Product added', {
          position: 'top-right',
          autoClose: 2000,
        });
      }
      setProductForm({ name: '', price: '', description: '', stock: '', category: '' });
      setImage(null);
      setEditProductId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const deleteProductHandler = async (productId) => {
    try {
      await deleteProduct(productId, token);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      toast.success('Product deleted', {
        position: 'top-right',
        autoClose: 2000,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editBannerId) {
        const { data } = await updateBanner(editBannerId, bannerForm, token);
        setBanners((prev) => prev.map((b) => (b._id === editBannerId ? data : b)));
        toast.success('Banner updated', {
          position: 'top-right',
          autoClose: 2000,
        });
      } else {
        const { data } = await createBanner(bannerForm, token);
        setBanners([...banners, data]);
        toast.success('Banner added', {
          position: 'top-right',
          autoClose: 2000,
        });
      }
      setBannerForm({ message: '', link: '', expiresAt: '' });
      setEditBannerId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save banner', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const deleteBannerHandler = async (bannerId) => {
    try {
      await deleteBanner(bannerId, token);
      setBanners((prev) => prev.filter((b) => b._id !== bannerId));
      toast.success('Banner deleted', {
        position: 'top-right',
        autoClose: 2000,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete banner', {
        position: 'top-right',
        autoClose: 3000,
      });
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="admin-dashboard">
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h3>Admin Panel</h3>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <i className={`fas ${isSidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
          </button>
        </div>
        <nav className="sidebar-nav">
          <button
            onClick={() => setActiveTab('orders')}
            className={activeTab === 'orders' ? 'active' : ''}
          >
            <i className="fas fa-box icon"></i>
            {isSidebarOpen && <span>Orders</span>}
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={activeTab === 'products' ? 'active' : ''}
          >
            <i className="fas fa-shopping-cart icon"></i>
            {isSidebarOpen && <span>Products</span>}
          </button>
          <button
            onClick={() => setActiveTab('banners')}
            className={activeTab === 'banners' ? 'active' : ''}
          >
            <i className="fas fa-bullhorn icon"></i>
            {isSidebarOpen && <span>Banners</span>}
          </button>
          <button onClick={handleLogout} className="sidebar-logout">
            <i className="fas fa-sign-out-alt icon"></i>
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </nav>
      </div>
      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="admin-topbar">
          <h2>Welcome {user.name}</h2>
        </div>

        {loading && <div className="loading">Loading...</div>}
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
                      <td>ETB {order.totalAmount.toFixed(2)}</td>
                      <td>{order.status}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        <select
                          defaultValue={order.status}
                          onChange={(e) => updateOrderStatusHandler(order._id, e.target.value)}
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
                placeholder="Price (e.g. 99.99)"
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
                      <td>ETB {product.price.toFixed(2)}</td>
                      <td>{product.stock}</td>
                      <td>{product.category}</td>
                      <td>
                        <button onClick={() => editProduct(product)}>Edit</button>
                        <button className="del" onClick={() => deleteProductHandler(product._id)}>
                          Delete
                        </button>
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
                        <button className="del" onClick={() => deleteBannerHandler(banner._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default AdminDashboard;