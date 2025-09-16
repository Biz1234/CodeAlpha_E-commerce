import axios from 'axios';
import config from './config';

const api = axios.create({
  baseURL: config.API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const login = (email, password, endpoint = '/api/auth/login') =>
  api.post(endpoint, { email, password });

export const register = (name, email, password) =>
  api.post('/api/auth/register', { name, email, password });

export const fetchCategories = () =>
  api.get('/api/products/categories');

export const fetchProducts = (search = '', category = '') => {
  const query = new URLSearchParams();
  if (search) query.append('search', search);
  if (category) query.append('category', category);
  return api.get(`/api/products?${query}`);
};

export const fetchBanner = () =>
  api.get('/api/banners/active');

export const fetchProductById = (id) =>
  api.get(`/api/products/${id}`);

export const mergeCart = (sessionId, items, token) =>
  api.post('/api/cart/merge', { sessionId, items }, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const fetchCart = (token) =>
  api.get('/api/cart', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const addToCart = (productId, quantity, price, sessionId, token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const body = token ? { productId, quantity, price } : { productId, quantity, price, sessionId };
  return api.post('/api/cart', body, { headers });
};

export const updateCartQuantity = (productId, quantity, sessionId, token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const body = token ? { quantity } : { quantity, sessionId };
  return api.put(`/api/cart/${productId}`, body, { headers });
};

export const removeFromCart = (productId, sessionId, token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const url = token ? `/api/cart/${productId}` : `/api/cart/${productId}?sessionId=${sessionId}`;
  return api.delete(url, { headers });
};

export const placeOrder = (items, totalAmount, token) =>
  api.post('/api/order', { items, totalAmount }, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const fetchOrders = (userId, token) =>
  api.get(`/api/order/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const fetchAllOrders = (token) =>
  api.get('/api/order', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateOrderStatus = (orderId, status, token) =>
  api.put(`/api/order/${orderId}`, { status }, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const fetchAllProducts = (token) =>
  api.get('/api/products', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createProduct = (formData, token) =>
  api.post('/api/products', formData, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
  });

export const updateProduct = (productId, formData, token) =>
  api.put(`/api/products/${productId}`, formData, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
  });

export const deleteProduct = (productId, token) =>
  api.delete(`/api/products/${productId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const fetchAllBanners = (token) =>
  api.get('/api/banners', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createBanner = (bannerData, token) =>
  api.post('/api/banners', bannerData, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateBanner = (bannerId, bannerData, token) =>
  api.put(`/api/banners/${bannerId}`, bannerData, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteBanner = (bannerId, token) =>
  api.delete(`/api/banners/${bannerId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export default api;