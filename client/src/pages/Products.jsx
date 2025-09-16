import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaCartPlus } from 'react-icons/fa';
import { CartContext } from '../context/CartContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Products.css';
import { fetchCategories, fetchProducts, fetchBanner } from '../api';
import config from '../config';

const Products = () => {
  const { addToCart } = useContext(CartContext) || {};
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banner, setBanner] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        const { data } = await fetchCategories();
        setCategories(data);
      } catch {
        setError('Failed to fetch categories');
      }
    };
    fetchCategoriesData();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProductsData = async () => {
      setLoading(true);
      try {
        const { data } = await fetchProducts(search, category);
        setProducts(data);
      } catch {
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    fetchProductsData();
  }, [search, category]);

  // Fetch banner
  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        const { data } = await fetchBanner();
        setBanner(data);
      } catch (err) {
        console.error('Failed to fetch banner:', err);
      }
    };
    fetchBannerData();
  }, []);

  // Add to cart handler
  const handleAddToCart = (product) => {
    if (!addToCart) {
      toast.error('Cart functionality unavailable!', { autoClose: 2000 });
      return;
    }
    if (!product._id || !product.price) {
      toast.error('Invalid product data!', { autoClose: 2000 });
      return;
    }
    addToCart(product, 1);
    toast.success('Added to cart!', { autoClose: 2000 });
  };

  return (
    <div className="products-page">
      {/* Banner */}
      {banner && (
        <div className="banner">
          <span>{banner.message}</span>
          <Link to={banner.link} className="banner-btn">Shop Now →</Link>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero">
        <h1>Explore Our Latest Products</h1>
        <p>Handpicked items for you at the best prices!</p>
      </section>

      {/* Filters */}
      <section className="filters">
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
          <button
            className="clear-btn"
            onClick={() => {
              setSearch('');
              setCategory('');
            }}
          >
            Clear Filters
          </button>
        )}
      </section>

      {/* Products Grid */}
      <section className="products-grid">
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : products.length === 0 ? (
          <div className="no-products">No products found.</div>
        ) : (
          products.map((product) => (
            <div key={product._id} className="product-card">
              <div className="image-wrapper">
                <img
                  src={product.image ? `${config.API_BASE_URL}${product.image}` : '/fallback.jpg'}
                  alt={product.name}
                  onError={(e) => { e.target.onerror = null; e.target.src = '/fallback.jpg'; }}
                />
                {product.isNew && <span className="badge new">New</span>}
                {product.discount && <span className="badge sale">Sale</span>}
              </div>
              <div className="product-info">
                <h3 title={product.name}>
                  {product.name.length > 50 ? product.name.slice(0, 50) + '...' : product.name}
                </h3>
                <p className="price">ETB {product.price}</p>
                <p className="description">{product.description?.slice(0, 70)}...</p>
                <div className="actions">
                  <Link to={`/product/${product._id}`} className="details-btn">Details</Link>
                  <button
                    className="add-btn"
                    onClick={() => handleAddToCart(product)}
                  >
                    <FaCartPlus />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      <ToastContainer />
    </div>
  );
};

export default Products;
