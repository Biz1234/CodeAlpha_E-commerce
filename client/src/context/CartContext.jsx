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
    const fetchOrSyncCart = async () => {
      if (user && token) {
        try {
          if (cart.length > 0) {
            const mergeRes = await fetch('http://localhost:5000/api/cart/merge', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ sessionId }),
            });

            if (!mergeRes.ok) throw new Error('Failed to merge cart');
            const mergedCart = await mergeRes.json();
            setCart(
              mergedCart.items.map((item) => ({
                itemId: uuidv4(), // Unique ID per cart item
                productId: item.productId._id,
                product: item.productId,
                quantity: item.quantity,
              }))
            );
            localStorage.removeItem('cart');
            localStorage.removeItem('sessionId');
          } else {
            const response = await fetch('http://localhost:5000/api/cart', {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
              const userCart = await response.json();
              setCart(
                userCart.items.map((item) => ({
                  itemId: uuidv4(),
                  productId: item.productId._id,
                  product: item.productId,
                  quantity: item.quantity,
                }))
              );
            }
          }
        } catch (err) {
          console.error('Cart sync error:', err);
        }
      }
    };

    fetchOrSyncCart();
  }, [user, token, sessionId]);

  const addToCart = async (product, quantity) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      let body = { productId: product._id, quantity, sessionId };
      if (user && token) {
        headers.Authorization = `Bearer ${token}`;
        body = { productId: product._id, quantity };
      }

      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to add to cart');
      const updatedCart = await response.json();
      setCart(
        updatedCart.items.map((item) => ({
          itemId: uuidv4(),
          productId: item.productId._id,
          product: item.productId,
          quantity: item.quantity,
        }))
      );
    } catch (err) {
      alert('Error adding to cart: ' + err.message);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      let body = { quantity, sessionId };
      if (user && token) {
        headers.Authorization = `Bearer ${token}`;
        body = { quantity };
      }

      const response = await fetch(`http://localhost:5000/api/cart/${productId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to update quantity');
      const updatedCart = await response.json();
      if (quantity < 1) {
        removeFromCart(productId);
      } else {
        setCart(
          updatedCart.items.map((item) => ({
            itemId: uuidv4(),
            productId: item.productId._id,
            product: item.productId,
            quantity: item.quantity,
          }))
        );
      }
    } catch (err) {
      alert('Error updating quantity: ' + err.message);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const headers = {};
      let url = `http://localhost:5000/api/cart/${productId}?sessionId=${sessionId}`;
      if (user && token) {
        headers.Authorization = `Bearer ${token}`;
        url = `http://localhost:5000/api/cart/${productId}`;
      }

      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) throw new Error('Failed to remove item');
      const updatedCart = await response.json();
      setCart(
        updatedCart.items.map((item) => ({
          itemId: uuidv4(),
          productId: item.productId._id,
          product: item.productId,
          quantity: item.quantity,
        }))
      );
    } catch (err) {
      alert('Error removing item: ' + err.message);
    }
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
    localStorage.removeItem('sessionId');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        sessionId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};