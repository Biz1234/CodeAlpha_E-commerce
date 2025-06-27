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
    if (!user) {
      navigate('/login');
      return;
    }
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/order', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        setOrders(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, token, navigate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="orders-container"><p className="error">{error}</p></div>;
  if (orders.length === 0) {
    return <div className="orders-container"><h2>No orders found</h2></div>;
  }

  return (
    <div className="orders-container">
      <h2>Your Orders</h2>
      {orders.map((order) => (
        <div key={order._id} className="order">
          <h3>Order #{order._id}</h3>
          <p>Status: {order.status}</p>
          <p>Total: ${order.totalAmount.toFixed(2)}</p>
          <p>Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
          <div className="order-items">
            {order.items.map((item) => (
              <div key={item.productId._id} className="order-item">
                <img src={`http://localhost:5000${item.productId.image}`} alt={item.productId.name} />
                <div>
                  <h4>{item.productId.name}</h4>
                  <p>Price: ${item.price.toFixed(2)}</p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Orders;