
import React, { createContext, useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AuthContext } from './AuthProvider';
import { mergeCart, fetchCart, addToCart, updateCartQuantity, removeFromCart } from '../api';

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
          const { data } = await mergeCart(sessionId, cart, token);
          setCart(normalizeCartItems(data.items));
          localStorage.removeItem('cart');
          localStorage.removeItem('sessionId');
        } else {
          const { data } = await fetchCart(token);
          setCart(normalizeCartItems(data.items));
        }
      } catch (err) {
        console.error('Cart sync error:', err);
      }
    };

    fetchOrSyncCart();
  }, [user, token, sessionId]);

  const addToCartItem = async (product, quantity = 1) => {
    if (!product._id || !product.price) {
      console.warn('Cannot add to cart - missing product _id or price:', product);
      return;
    }

    try {
      const { data } = await addToCart(product._id, quantity, product.price, sessionId, token);
      setCart(normalizeCartItems(data.items));
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Error adding to cart: ' + (err.response?.data?.message || err.message));
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const { data } = await updateCartQuantity(productId, quantity, sessionId, token);
      if (quantity < 1) {
        removeFromCartItem(productId);
      } else {
        setCart(normalizeCartItems(data.items));
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
      alert('Error updating quantity: ' + (err.response?.data?.message || err.message));
    }
  };

  const removeFromCartItem = async (productId) => {
    try {
      const { data } = await removeFromCart(productId, sessionId, token);
      setCart(normalizeCartItems(data.items));
    } catch (err) {
      console.error('Error removing item:', err);
      alert('Error removing item: ' + (err.response?.data?.message || err.message));
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
        addToCart: addToCartItem,
        updateQuantity,
        removeFromCart: removeFromCartItem,
        clearCart,
        sessionId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};