import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Orders.css';

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

    const fetchOrders = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/order/user/${user._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch orders');
        }

        const data = await response.json();

        // Optional: Log to check for duplicate product IDs
        data.forEach(order => {
          const itemIds = order.items.map(i => i.productId?._id);
          const hasDuplicates = new Set(itemIds).size !== itemIds.length;
          if (hasDuplicates) {
            console.warn('Order has duplicate product IDs:', order._id);
          }
        });

        setOrders(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, token, navigate]);

  if (loading) return <div>Loading...</div>;

  if (error) {
    return (
      <div className="orders-container">
        <p className="error">Error: {error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-container">
        <h2>No orders found</h2>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h2>Your Orders</h2>
      {orders.map((order) => (
        <div key={order._id} className="order">
          <h3>Order #{order._id}</h3>
          <p>Status: {order.status}</p>
          <p>Total: ${order.totalAmount?.toFixed(2) || '0.00'}</p>
          <p>Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
          <div className="order-items">
            {order.items.map((item, index) => {
              const product = item.productId;

              // Combine _id and index to ensure unique keys
              const uniqueKey = product?._id ? `${product._id}-${index}` : `item-${index}`;

              return (
                <div key={uniqueKey} className="order-item">
                  <img
                    src={
                      product?.image
                        ? `http://localhost:5000${product.image}`
                        : '/placeholder.jpg'
                    }
                    alt={product?.name || 'Product'}
                  />
                  <div>
                    <h4>{product?.name || 'Unknown Product'}</h4>
                    <p>Price: ${item.price?.toFixed(2) || '0.00'}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>
                      Subtotal: $
                      {((item.price || 0) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Orders;