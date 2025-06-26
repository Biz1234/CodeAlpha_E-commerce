import React, { createContext, useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, token } = useContext(AuthContext);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [sessionId] = useState(() => localStorage.getItem('sessionId') || uuidv4());

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('sessionId', sessionId);
  }, [cart, sessionId]);

  useEffect(() => {
    // Sync localStorage cart with MongoDB when user logs in
    const syncCart = async () => {
      if (user && token && cart.length > 0) {
        try {
          for (const item of cart) {
            await fetch('http://localhost:5000/api/cart', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                productId: item.productId,
                quantity: item.quantity
              })
            }).then((res) => {
              if (!res.ok) throw new Error('Failed to sync cart');
            });
          }
          // Clear localStorage cart after syncing
          setCart([]);
          localStorage.removeItem('cart');
        } catch (err) {
          console.error('Cart sync error:', err);
        }
      }
    };
    syncCart();
  }, [user, token]);

  const addToCart = async (product, quantity) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (user && token) {
        headers.Authorization = `Bearer ${token}`;
      } else {
        headers.body = JSON.stringify({ productId: product._id, quantity, sessionId });
      }
      await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers,
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
      const headers = { 'Content-Type': 'application/json' };
      if (user && token) {
        headers.Authorization = `Bearer ${token}`;
      }
      await fetch(`http://localhost:5000/api/cart/${productId}`, {
        method: 'PUT',
        headers,
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
      const headers = { 'Content-Type': 'application/json' };
      if (user && token) {
        headers.Authorization = `Bearer ${token}`;
        await fetch(`http://localhost:5000/api/cart/${productId}`, {
          method: 'DELETE',
          headers
        });
      } else {
        await fetch(`http://localhost:5000/api/cart/${productId}?sessionId=${sessionId}`, {
          method: 'DELETE'
        });
      }
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