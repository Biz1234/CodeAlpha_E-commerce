import React, { createContext, useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, token } = useContext(AuthContext);

  
  const normalizeCartItems = (items) => {
    if (!Array.isArray(items)) {
      console.warn('Cart items is not an array:', items);
      return [];
    }
    return items
      .map((item) => {
        let productId = null;
        let productData = null;
        let price = null;
        let quantity = Number(item.quantity) || 1;

        
        if (typeof item.productId === 'object' && item.productId !== null) {
          productId = item.productId._id || item.productId.id || null;
          price = Number(item.productId.price) || Number(item.price) || null;
          productData = item.productId;
        } else if (typeof item.productId === 'string') {
          productId = item.productId;
          price = Number(item.price) || null;
        } else if (item.product && item.product._id) {
          productId = item.product._id;
          price = Number(item.product.price) || Number(item.price) || null;
          productData = item.product;
        }

        if (!productId || !price) {
          console.warn('Invalid cart item - missing productId or price:', item);
          return null;
        }

        return {
          itemId: item.itemId || uuidv4(),
          productId,
          product: productData || { _id: productId, price },
          quantity,
          price,
        };
      })
      .filter((item) => item !== null);
  };

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    try {
      const parsedCart = savedCart ? JSON.parse(savedCart) : [];
      return normalizeCartItems(parsedCart);
    } catch (err) {
      console.error('Error parsing cart from localStorage:', err);
      return [];
    }
  });

  const [sessionId] = useState(() => {
    const stored = localStorage.getItem('sessionId');
    const newId = stored || uuidv4();
    if (!stored) localStorage.setItem('sessionId', newId);
    return newId;
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const fetchOrSyncCart = async () => {
      if (!user || !token) return;

      try {
        if (cart.length > 0) {
          const mergeRes = await fetch('http://localhost:5000/api/cart/merge', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ sessionId, items: cart }),
          });
          if (!mergeRes.ok) throw new Error('Failed to merge cart');
          const mergedCart = await mergeRes.json();
          setCart(normalizeCartItems(mergedCart.items));
          localStorage.removeItem('cart');
          localStorage.removeItem('sessionId');
        } else {
          const response = await fetch('http://localhost:5000/api/cart', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const userCart = await response.json();
            setCart(normalizeCartItems(userCart.items));
          }
        }
      } catch (err) {
        console.error('Cart sync error:', err);
      }
    };

    fetchOrSyncCart();
  }, [user, token, sessionId]);

  const addToCart = async (product, quantity = 1) => {
    if (!product._id || !product.price) {
      console.warn('Cannot add to cart - missing product _id or price:', product);
      return;
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      let body = { productId: product._id, quantity, sessionId, price: product.price };
      if (user && token) {
        headers.Authorization = `Bearer ${token}`;
        body = { productId: product._id, quantity, price: product.price };
      }

      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to add to cart');
      const updatedCart = await response.json();
      setCart(normalizeCartItems(updatedCart.items));
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Error adding to cart: ' + err.message);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      let body = { quantity, sessionId };
      let url = `http://localhost:5000/api/cart/${productId}`;
      if (user && token) {
        headers.Authorization = `Bearer ${token}`;
        body = { quantity };
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to update quantity');
      const updatedCart = await response.json();
      if (quantity < 1) {
        removeFromCart(productId);
      } else {
        setCart(normalizeCartItems(updatedCart.items));
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
      alert('Error updating quantity: ' + err.message);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      console.log('Removing product ID:', productId);
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
      setCart(normalizeCartItems(updatedCart.items));
    } catch (err) {
      console.error('Error removing item:', err);
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