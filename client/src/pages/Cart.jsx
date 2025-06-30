import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import '../styles/Cart.css';

const Cart = () => {
  const { user } = useContext(AuthContext);
  const { cart, updateQuantity, removeFromCart } = useContext(CartContext);

  const totalPrice = cart.reduce(
    (total, item) => total + (item.product?.price || 0) * item.quantity,
    0
  );

  if (cart.length === 0) {
    return (
      <div className="cart-container">
        <h2>Your cart is empty</h2>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2>{user ? `${user.name}'s Cart` : 'Your Cart'}</h2>
      <div className="cart-items">
        {cart.map((item, index) => {
          // Use productId + index to ensure uniqueness
          const uniqueKey = item.productId ? `${item.productId}-${index}` : `cart-item-${index}`;

          return (
            <div key={uniqueKey} className="cart-item">
              <img
                src={
                  item.product?.image
                    ? `http://localhost:5000${item.product.image}`
                    : '/placeholder.jpg'
                }
                alt={item.product?.name || 'Product'}
              />
              <div className="cart-item-details">
                <h3>{item.product?.name || 'Unknown Product'}</h3>
                <p>Price: ${item.product?.price?.toFixed(2) || '0.00'}</p>
                <p>
                  Quantity:
                  <input
                    type="number"
                    min="1"
                    max={item.product?.stock || 10}
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.productId, Number(e.target.value))
                    }
                  />
                </p>
                <p>
                  Subtotal: $
                  {((item.product?.price || 0) * item.quantity).toFixed(2)}
                </p>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="remove-btn"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <h3>Total: ${totalPrice.toFixed(2)}</h3>
      <Link to="/checkout" className="checkout-btn">
        Proceed to Checkout
      </Link>
    </div>
  );
};

export default Cart;