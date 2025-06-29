import  { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Admin.css';

const Admin = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    stock: '',
    category: ''
  });
  const [image, setImage] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      console.log('Admin - Redirecting to /admin-login, user:', user);
      navigate('/admin-login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const productsRes = await fetch('http://localhost:5000/api/products');
        if (!productsRes.ok) throw new Error('Failed to fetch products');
        const productsData = await productsRes.json();
        setProducts(productsData);

        try {
          const ordersRes = await fetch('http://localhost:5000/api/orders', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!ordersRes.ok) throw new Error(`Failed to fetch orders: ${ordersRes.status}`);
          const ordersData = await ordersRes.json();
          setOrders(ordersData);
        } catch (err) {
          console.error('Orders fetch error:', err.message);
          setOrders([]);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('price', formData.price);
      data.append('description', formData.description);
      data.append('stock', formData.stock);
      data.append('category', formData.category);
      if (image) data.append('image', image);

      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add product');
      }

      const newProduct = await response.json();
      setProducts([...products, newProduct]);
      setFormData({ name: '', price: '', description: '', stock: '', category: '' });
      setImage(null);
      alert('Product added successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProductId(product._id);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      stock: product.stock,
      category: product.category
    });
    setImage(null);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('price', formData.price);
      data.append('description', formData.description);
      data.append('stock', formData.stock);
      data.append('category', formData.category);
      if (image) data.append('image', image);

      const response = await fetch(`http://localhost:5000/api/products/${editingProductId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: data
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product');
      }

      const updatedProduct = await response.json();
      setProducts(products.map((p) => (p._id === editingProductId ? updatedProduct : p)));
      setEditingProductId(null);
      setFormData({ name: '', price: '', description: '', stock: '', category: '' });
      setImage(null);
      alert('Product updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete product');
      }
      setProducts(products.filter((p) => p._id !== productId));
      alert('Product deleted successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order');
      }
      const updatedOrder = await response.json();
      setOrders(orders.map((o) => (o._id === orderId ? updatedOrder : o)));
      alert('Order status updated!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="admin-container"><p className="error">{error}</p></div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="tabs">
        <button
          className={activeTab === 'products' ? 'active' : ''}
          onClick={() => setActiveTab('products')}
        >
          Manage Products
        </button>
        <button
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => setActiveTab('orders')}
        >
          Manage Orders
        </button>
      </div>

      {activeTab === 'products' && (
        <>
          <h3>{editingProductId ? 'Edit Product' : 'Add New Product'}</h3>
          <form onSubmit={editingProductId ? handleUpdateProduct : handleAddProduct}>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Price:</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label>Description:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Stock:</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                min="0"
              />
            </div>
            <div>
              <label>Category:</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Image:</label>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleImageChange}
                required={!editingProductId}
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Processing...' : editingProductId ? 'Update Product' : 'Add Product'}
            </button>
            {editingProductId && (
              <button
                type="button"
                onClick={() => {
                  setEditingProductId(null);
                  setFormData({ name: '', price: '', description: '', stock: '', category: '' });
                  setImage(null);
                }}
              >
                Cancel
              </button>
            )}
          </form>
          <h3>Product List</h3>
          <div className="products-grid">
            {products.length === 0 ? (
              <p>No products found</p>
            ) : (
              products.map((product) => (
                <div key={product._id} className="product-card">
                  <img src={`http://localhost:5000${product.image}`} alt={product.name} />
                  <h4>{product.name}</h4>
                  <p>Price: ${product.price.toFixed(2)}</p>
                  <p>Category: {product.category}</p>
                  <p>Stock: {product.stock}</p>
                  <button onClick={() => handleEditProduct(product)}>Edit</button>
                  <button onClick={() => handleDeleteProduct(product._id)}>Delete</button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === 'orders' && (
        <>
          <h3>Manage Orders</h3>
          {orders.length === 0 ? (
            <p>No orders found</p>
          ) : (
            <div className="orders-grid">
              {orders.map((order) => (
                <div key={order._id} className="order-card">
                  <p>Order ID: {order._id}</p>
                  <p>User: {order.userId?.name || 'Unknown'} ({order.userId?.email || 'Unknown'})</p>
                  <p>Total: ${order.totalAmount?.toFixed(2) || '0.00'}</p>
                  <p>Status: {order.status}</p>
                  <p>Products:</p>
                  <ul>
                    {order.products?.map((item) => (
                      <li key={item.productId?._id || item._id}>
                        {item.productId?.name || 'Unknown'} x {item.quantity}
                      </li>
                    )) || <li>No products</li>}
                  </ul>
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Admin;