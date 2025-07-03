import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import '../styles/Cart.css';

const Cart = () => {
  const { user } = useContext(AuthContext);
  const { cart, updateQuantity, removeFromCart } = useContext(CartContext);
  const navigate = useNavigate();

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
  onClick={() => {
    console.log('Removing product ID:', item.productId);
    removeFromCart(item.productId)
      .then(() => {
        toast.success('Removed successfully!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      })
      .catch((err) => {
        console.error('Error removing item:', err);
        toast.error('Error removing item!', {
          position: 'top-right',
          autoClose: 3000,
        });
      });
  }}
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
      <Link
        to="/checkout"
        className="checkout-btn"
        onClick={(e) => {
          e.preventDefault(); 
          toast.info('Redirecting to checkout...', {
            position: 'top-right',
            autoClose: 2000, 
            onClose: () => navigate('/checkout'), 
          });
        }}
      >
        Proceed to Checkout
      </Link>
      <ToastContainer /> 
    </div>
  );
};

export default Cart;