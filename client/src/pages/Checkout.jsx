import React, { useContext, useState } from 'react';
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

  if (!user) {
    navigate('/login');
    return null;
  }

  // ✅ Calculate total amount safely
  const totalPrice = cart.reduce((total, item) => {
    const price = item.product?.price || 0;
    const quantity = item.quantity || 0;
    return total + price * quantity;
  }, 0);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      // ✅ Ensure cart has items
      if (!cart || cart.length === 0) {
        throw new Error('Your cart is empty');
      }

      // ✅ Build products array
      const products = cart.map((item) => ({
        productId: item.product?._id,
        quantity: item.quantity,
        price: item.product?.price,
      }));

      // ✅ Make sure no undefined values are sent
      for (const product of products) {
        if (!product.productId || product.quantity <= 0 || isNaN(product.price)) {
          throw new Error('Invalid product data in cart');
        }
      }

      // ✅ Send request
      const response = await fetch('http://localhost:5000/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          products,
          totalAmount: totalPrice, // ✅ Now correctly defined
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="checkout-container">
        <h2>Your cart is empty</h2>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      {error && <p className="error">Error: {error}</p>}

      <div className="checkout-items">
        {cart.map((item, index) => (
          <div key={`${item.product._id}-${index}`} className="checkout-item">
            <img
              src={`http://localhost:5000${item.product.image}`}
              alt={item.product.name}
            />
            <div>
              <h3>{item.product.name}</h3>
              <p>Price: ${item.product.price?.toFixed(2) || '0.00'}</p>
              <p>Quantity: {item.quantity}</p>
              <p>
                Subtotal: $
                {(item.product.price * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <h3>Total: ${totalPrice.toFixed(2)}</h3>
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