import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import '../styles/Checkout.css';

const Checkout = () => {
  const { user, token } = useContext(AuthContext);
  const { cart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  // Filter out invalid cart items
  const validCartItems = cart.filter((item) => item.productId && item.price && item.quantity > 0);

  // Calculate total price
  const totalPrice = validCartItems.reduce((total, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return total + price * quantity;
  }, 0);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      if (validCartItems.length === 0) {
        throw new Error('Your cart is empty or contains invalid items.');
      }

      // Build items array for order
      const items = validCartItems.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        price: Number(item.price),
      }));

      const response = await fetch('http://localhost:5000/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items, // Changed from 'products' to 'items' to match order.js
          totalAmount: totalPrice,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place order');
      }

      alert('Order placed successfully!');
      clearCart();
      navigate('/orders');
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (validCartItems.length === 0) {
    return (
      <div className="checkout-container">
        <h2>Your cart is empty or contains invalid items</h2>
        <p>Please add some products to proceed.</p>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      {error && <p className="error">Error: {error}</p>}

      <div className="checkout-items">
        {validCartItems.map((item, index) => (
          <div key={`${item.productId}-${index}`} className="checkout-item">
            <img
              src={`http://localhost:5000${item.product?.image || '/fallback.jpg'}`}
              alt={item.product?.name || 'Product'}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/fallback.jpg';
              }}
            />
            <div>
              <h3>{item.product?.name || 'Unknown Product'}</h3>
              <p>Price: ETB {Number(item.price).toFixed(2)}</p>
              <p>Quantity: {Number(item.quantity)}</p>
              <p>Subtotal: ETB {(Number(item.price) * Number(item.quantity)).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      <h3>Total: ETB {totalPrice.toFixed(2)}</h3>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="checkout-btn"
      >
        {loading ? 'Processing...' : 'Place Order'}
      </button>
    </div>
  );
};

export default Checkout;