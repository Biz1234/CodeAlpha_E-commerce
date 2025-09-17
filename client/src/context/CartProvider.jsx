import React, { createContext, useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AuthContext } from './AuthProvider';
import { mergeCart, fetchCart, addToCart, updateCartQuantity, removeFromCart } from '../api';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, token } = useContext(AuthContext);

  // Normalize and filter cart items
  const normalizeCartItems = (items) => {
    if (!Array.isArray(items)) return [];

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

        // Only return valid items
        if (!productId || price === null) return null;

        return {
          itemId: item.itemId || uuidv4(),
          productId,
          product: productData || { _id: productId, price },
          quantity,
          price,
        };
      })
      .filter((item) => item !== null); // remove invalid items
  };

  // Cart state
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

  // Session ID for guest users
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem('sessionId');
    const newId = stored || uuidv4();
    if (!stored) localStorage.setItem('sessionId', newId);
    return newId;
  });

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch or merge cart when user logs in
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

  // Add item to cart
  const addToCartItem = async (product, quantity = 1) => {
    if (!product?._id || product.price === undefined) return; // ignore invalid products

    try {
      const { data } = await addToCart(product._id, quantity, product.price, sessionId, token);
      setCart(normalizeCartItems(data.items));
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Error adding to cart: ' + (err.response?.data?.message || err.message));
    }
  };

  // Update quantity
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

  // Remove item from cart
  const removeFromCartItem = async (productId) => {
    try {
      const { data } = await removeFromCart(productId, sessionId, token);
      setCart(normalizeCartItems(data.items));
    } catch (err) {
      console.error('Error removing item:', err);
      alert('Error removing item: ' + (err.response?.data?.message || err.message));
    }
  };

  // Clear cart completely
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
