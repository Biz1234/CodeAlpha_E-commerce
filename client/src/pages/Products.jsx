import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const categories = ['electronics', 'clothing', 'books']; // Adjust based on your products

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const query = new URLSearchParams();
        if (search) query.append('search', search);
        if (category) query.append('category', category);
        const response = await fetch(`http://localhost:5000/api/products?${query.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchProducts();
  }, [search, category]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="products-container">
      <h2>Products</h2>
      <div className="filters">
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
      </div>
      <div className="products-grid">
        {products.length === 0 ? (
          <p>No products found</p>
        ) : (
          products.map((product) => (
            <div key={product._id} className="product-card">
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              <p>${product.price.toFixed(2)}</p>
              <Link to={`/product/${product._id}`}>View Details</Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Products;