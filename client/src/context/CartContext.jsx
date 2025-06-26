import { createContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [sessionId] = useState(() => localStorage.getItem('sessionId') || uuidv4());

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('sessionId', sessionId);
  }, [cart, sessionId]);

  const addToCart = async (product, quantity) => {
    try {
      // Validate with backend
      await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id, quantity, sessionId })
      }).then((res) => {
        if (!res.ok) throw new Error('Failed to add to cart');
        return res.json();
      });

      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.productId === product._id);
        if (existingItem) {
          return prevCart.map((item) =>
            item.productId === product._id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prevCart, { productId: product._id, product, quantity }];
      });
    } catch (err) {
      alert('Error adding to cart: ' + err.message);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await fetch(`http://localhost:5000/api/cart/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity, sessionId })
      }).then((res) => {
        if (!res.ok) throw new Error('Failed to update quantity');
        return res.json();
      });

      if (quantity < 1) {
        removeFromCart(productId);
      } else {
        setCart((prevCart) =>
          prevCart.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          )
        );
      }
    } catch (err) {
      alert('Error updating quantity: ' + err.message);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await fetch(`http://localhost:5000/api/cart/${productId}?sessionId=${sessionId}`, {
        method: 'DELETE'
      }).then((res) => {
        if (!res.ok) throw new Error('Failed to remove item');
        return res.json();
      });

      setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
    } catch (err) {
      alert('Error removing item: ' + err.message);
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, sessionId }}>
      {children}
    </CartContext.Provider>
  );
};