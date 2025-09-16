import React, { useContext, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';
import { CartContext } from '../context/CartContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Checkout.css';
import { placeOrder } from '../api';
import config from '../config';

const Checkout = () => {
  const { user, token } = useContext(AuthContext) || {};
  const { cart = [], clearCart } = useContext(CartContext) || {};
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  // Filter valid items
  const validCartItems = useMemo(
    () => cart.filter(item => item.productId && item.price && item.quantity > 0),
    [cart]
  );

  // Calculate total price
  const totalPrice = useMemo(
    () =>
      validCartItems.reduce(
        (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
        0
      ),
    [validCartItems]
  );

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      if (validCartItems.length === 0) throw new Error('Your cart is empty.');

      if (!clearCart) throw new Error('Cart functionality unavailable.');

      const items = validCartItems.map(item => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        price: Number(item.price),
      }));

      await placeOrder(items, totalPrice, token);

      toast.success('Order placed successfully!', {
        position: 'top-right',
        autoClose: 2000,
        onClose: () => {
          clearCart();
          navigate('/orders');
        },
      });
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || err.message || 'Failed to place order';
      setError(message);
      toast.error(message, { position: 'top-right', autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  if (validCartItems.length === 0) {
    return (
      <div className="checkout-container">
        <h2>Your cart is empty</h2>
        <p>Add products to proceed to checkout.</p>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-items-container">
        <h2>Checkout</h2>
        {error && <p className="error">{error}</p>}

        {validCartItems.map((item, index) => (
          <div key={`${item.productId}-${index}`} className="checkout-card">
            <img
              src={item.product?.image ? `${config.API_BASE_URL}${item.product.image}` : '/fallback.jpg'}
              alt={item.product?.name || 'Product'}
              onError={e => (e.target.src = '/fallback.jpg')}
            />
            <div className="checkout-card-details">
              <h3>{item.product?.name || 'Unknown Product'}</h3>
              <p>Price: ETB {Number(item.price).toFixed(2)}</p>
              <p>Quantity: {item.quantity}</p>
              <p>Subtotal: ETB {(Number(item.price) * item.quantity).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="checkout-summary">
        <h3>Order Summary</h3>
        <p>Total: ETB {totalPrice.toFixed(2)}</p>
        <button
          onClick={handleCheckout}
          disabled={loading || !clearCart}
          className="checkout-btn"
        >
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Checkout;
