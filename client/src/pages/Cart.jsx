
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import '../styles/Cart.css';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart } = useContext(CartContext);

  const totalPrice = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  if (cart.length === 0) {
    return <div className="cart-container"><h2>Your cart is empty</h2></div>;
  }

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      <div className="cart-items">
        {cart.map((item) => (
          <div key={item.productId} className="cart-item">
            <img src={item.product.image} alt={item.product.name} />
            <div className="cart-item-details">
              <h3>{item.product.name}</h3>
              <p>Price: ${item.product.price.toFixed(2)}</p>
              <p>
                Quantity:
                <input
                  type="number"
                  min="1"
                  max={item.product.stock}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                />
              </p>
              <p>Subtotal: ${(item.product.price * item.quantity).toFixed(2)}</p>
              <button
                onClick={() => removeFromCart(item.productId)}
                className="remove-btn"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <h3>Total: ${totalPrice.toFixed(2)}</h3>
      <button className="checkout-btn">Proceed to Checkout</button>
    </div>
  );
};

export default Cart;






