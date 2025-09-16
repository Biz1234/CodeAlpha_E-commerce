// src/pages/Cart.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';
import { CartContext } from '../context/CartContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Cart.css';
import config from '../config';

const Cart = () => {
  const { user } = useContext(AuthContext) || {};
  const { cart = [], updateQuantity, removeFromCart } = useContext(CartContext) || {};
  const navigate = useNavigate();

  // Handle Quantity Change
  const handleQuantityChange = (item, value) => {
    const newQty = Math.max(1, Math.min(Number(value), item.product?.stock || 10));
    if (!updateQuantity) {
      toast.error('Unable to update quantity!', { position: 'top-right', autoClose: 1500 });
      return;
    }
    updateQuantity(item.productId, newQty);
  };

  // Handle Remove Item
  const handleRemoveItem = async (item) => {
    if (!removeFromCart) {
      toast.error('Unable to remove item!', { position: 'top-right', autoClose: 1500 });
      return;
    }
    try {
      await removeFromCart(item.productId);
      toast.success('Item removed successfully!', { position: 'top-right', autoClose: 1200 });
    } catch (err) {
      console.error('Error removing item:', err);
      toast.error('Error removing item!', { position: 'top-right', autoClose: 1500 });
    }
  };

  // Calculate total price
  const totalPrice = cart.reduce(
    (total, item) => total + (item.product?.price || 0) * item.quantity,
    0
  );

  // Empty Cart
  if (cart.length === 0) {
    return (
      <div className="cart-container">
        <h2>Your cart is empty</h2>
        <ToastContainer />
        <Link to="/" className="back-shop-btn">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2>{user ? `${user.name}'s Cart` : 'Your Cart'}</h2>

      <div className="cart-items">
        {cart.map((item, index) => {
          const product = item.product || {};
          const uniqueKey = product._id || `cart-item-${index}`;
          const subtotal = (product.price || 0) * item.quantity;

          return (
            <div key={uniqueKey} className="cart-item">
              <img
                src={product.image ? `${config.API_BASE_URL}${product.image}` : '/placeholder.jpg'}
                alt={product.name || 'Product'}
                onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.jpg'; }}
              />
              <div className="cart-item-details">
                <h3>{product.name || 'Unknown Product'}</h3>
                <p>Price: ETB {product.price?.toFixed(2) || '0.00'}</p>

                <p>
                  Quantity:
                  <input
                    type="number"
                    min="1"
                    max={product.stock || 10}
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item, e.target.value)}
                  />
                </p>

                <p>Subtotal: ETB {subtotal.toFixed(2)}</p>

                <button className="remove-btn" onClick={() => handleRemoveItem(item)}>
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="cart-summary">
        <h3>Total: ETB {totalPrice.toFixed(2)}</h3>
        <button
          className="checkout-btn"
          onClick={() => {
            toast.info('Redirecting to checkout...', { position: 'top-right', autoClose: 1200 });
            navigate('/checkout');
          }}
        >
          Proceed to Checkout
        </button>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Cart;
