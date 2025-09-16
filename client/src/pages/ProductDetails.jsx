import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/ProductDetails.css';
import { fetchProductById } from '../api';
import config from '../config';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext) || {};
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await fetchProductById(id);
        setProduct(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!addToCart) {
      toast.error('Cart functionality is unavailable!', { autoClose: 3000 });
      return;
    }
    if (product && quantity > 0) {
      addToCart(product, quantity);
      toast.success('Added to cart!', {
        autoClose: 2000,
        onClose: () => navigate('/cart'),
      });
    }
  };

  const handleQuantityChange = (e) => {
    let value = Number(e.target.value);
    if (value < 1) value = 1;
    if (value > product.stock) value = product.stock;
    setQuantity(value);
  };

  if (loading) return <div className="loading">Loading product...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!product) return <div className="error-message">Product not found</div>;

  const { name, image, description, price, category, stock, isNew, discount } = product;

  return (
    <div className="product-details-wrapper">
      <div className="product-image-section">
        <img
          src={image ? `${config.API_BASE_URL}${image}` : '/fallback.jpg'}
          alt={name}
          onError={(e) => { e.target.onerror = null; e.target.src = '/fallback.jpg'; }}
          className="product-image"
        />
        {isNew && <span className="badge new">New</span>}
        {discount && <span className="badge sale">Sale</span>}
      </div>

      <div className="product-info-section">
        <h2 className="product-name">{name}</h2>
        <p className="product-category">Category: {category}</p>
        <p className="product-description">{description}</p>
        <p className="product-price">Price: ETB {price.toFixed(2)}</p>
        <p className={`product-stock ${stock === 0 ? 'out-of-stock' : ''}`}>
          {stock > 0 ? `In Stock: ${stock}` : 'Out of Stock'}
        </p>

        {stock > 0 && (
          <div className="purchase-section">
            <input
              type="number"
              min="1"
              max={stock}
              value={quantity}
              onChange={handleQuantityChange}
              className="quantity-input"
            />
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
          </div>
        )}
      </div>

      <ToastContainer />
    </div>
  );
};

export default ProductDetails;
