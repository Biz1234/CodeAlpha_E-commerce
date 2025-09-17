import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Orders.css';
import { fetchOrders } from '../api';
import config from '../config';

const Orders = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
      return;
    }

    const fetchOrdersData = async () => {
      try {
        const { data } = await fetchOrders(user._id, token);
        setOrders(data);

        toast.success('Orders fetched successfully!', {
          toastId: 'orders-success', // Prevent duplicate
        });
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to fetch orders. Please try again later.';
        setError(message);
        toast.error(message, {
          toastId: 'orders-error', // Prevent duplicate
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersData();
  }, [user, token, navigate]);

  return (
    <div className="orders-container">
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your orders...</p>
        </div>
      )}

      {error && <h2 className="error">⚠ {error}</h2>}

      {!loading && !error && orders.length === 0 && <h2>No orders found</h2>}

      {!loading && !error && orders.length > 0 && (
        <>
          <h2>Your Orders</h2>
          {orders.map((order) => {
            // Group items by productId to avoid duplicates
            const groupedItems = {};
            order.items.forEach((item) => {
              const pid = item.productId?._id || item.productId;
              if (!groupedItems[pid]) {
                groupedItems[pid] = { ...item };
              } else {
                groupedItems[pid].quantity += item.quantity;
              }
            });

            return (
              <div key={order._id} className="order">
                <h3>Order #{order._id}</h3>
                <p>Status: <strong>{order.status}</strong></p>
                <p>Total: <strong>ETB {Number(order.totalAmount).toFixed(2)}</strong></p>
                <p>Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>

                <div className="order-items">
                  {Object.values(groupedItems).map((item, index) => {
                    const product = item.productId;
                    const uniqueKey = product?._id ? `${product._id}-${index}` : `item-${index}`;
                    return (
                      <div key={uniqueKey} className="order-item">
                        <img
                          src={
                            product?.image
                              ? `${config.API_BASE_URL}${product.image}`
                              : '/placeholder.jpg'
                          }
                          alt={product?.name || 'Product'}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder.jpg';
                          }}
                        />
                        <div>
                          <h4>{product?.name || 'Unknown Product'}</h4>
                          <p>Price: ETB {Number(item.price).toFixed(2)}</p>
                          <p>Quantity: {item.quantity}</p>
                          <p>Subtotal: ETB {(Number(item.price) * Number(item.quantity)).toFixed(2)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Only one ToastContainer */}
      <ToastContainer position="top-right" autoClose={1500} />
    </div>
  );
};

export default Orders;
