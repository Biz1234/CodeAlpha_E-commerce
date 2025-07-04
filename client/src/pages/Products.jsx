import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCartPlus } from 'react-icons/fa'; // Import cart icon from react-icons
import { CartContext } from '../context/CartContext';
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS
import '../styles/Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [banner, setBanner] = useState(null);
  const { addToCart } = useContext(CartContext); // Access addToCart from CartContext
  const navigate = useNavigate();

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products/categories');
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        setError('Failed to fetch categories');
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (search) query.append('search', search);
        if (category) query.append('category', category);
        const res = await fetch(`http://localhost:5000/api/products?${query}`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [search, category]);

  // Fetch active banner
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/banners/active');
        const data = await res.json();
        setBanner(data);
      } catch (err) {
        console.error('Failed to fetch banner:', err);
      }
    };
    fetchBanner();
  }, []);

  const handleAddToCart = (product) => {
    if (!product._id || !product.price) {
      toast.error('Invalid product data!', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }
    addToCart(product, 1); // Use existing addToCart from CartContext with quantity 1
    toast.success('Added successfully!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    // Removed navigate('/cart') to avoid redirection
  };

  return (
    <div className="products-page">
      {/* 🔥 Flash Sale Banner (Dynamic) */}
      {banner && (
        <div className="flash-sale-banner">
          <span>{banner.message}</span>
          <Link to={banner.link} className="shop-now-btn">
            Shop Now →
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero">
        <h1>Explore Our Latest Products</h1>
        <p>Find the best items handpicked for you!</p>
      </section>

      {/* Filters */}
      <section className="filters-section">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="category-select"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>

        {(search || category) && (
          <button className="clear-filters-btn" onClick={() => {
            setSearch('');
            setCategory('');
          }}>
            Clear Filters
          </button>
        )}
      </section>

      {/* Product Grid */}
      <section className="products-grid">
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : products.length === 0 ? (
          <div className="no-products">No products found.</div>
        ) : (
          products.map((product) => (
            <article key={product._id} className="product-card">
              <div className="product-image-wrapper">
                <img
                  src={`http://localhost:5000${product.image}`}
                  alt={product.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/fallback.jpg';
                  }}
                  className="product-image"
                />
                {/* Product Badges */}
                {product.isNew && <span className="product-badge new">New</span>}
                {product.discount && <span className="product-badge sale">Sale</span>}
              </div>
              <div className="product-info">
                <h3 title={product.name}>
                  {product.name.length > 40 ? product.name.slice(0, 40) + '...' : product.name}
                </h3>
                <p className="product-price">ETB {product.price}</p>
                <p className="product-desc">
                  {product.description?.slice(0, 60)}...
                </p>
                <div className="product-actions">
                  <Link to={`/product/${product._id}`} className="view-details-btn">
                    View Details
                  </Link>
                  <button className="add-to-cart-btn" onClick={() => handleAddToCart(product)}>
                    <FaCartPlus /> 
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
      <ToastContainer /> {/* Add ToastContainer for notifications */}
    </div>
  );
};

export default Products;