import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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

       
        data.forEach(order => {
          const itemIds = order.items.map(i => i.productId?._id || i.productId);
          const hasDuplicates = new Set(itemIds).size !== itemIds.length;
          if (hasDuplicates) {
            console.warn('Order has duplicate product IDs:', order._id);
          }
        });

        setOrders(data);
        toast.success('Ordered successfully!', { 
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } catch (err) {
        setError(err.message);
        console.error('Error fetching orders:', err);
        toast.error(err.message);
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
        <ToastContainer />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-container">
        <h2>No orders found</h2>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h2>Your Orders</h2>
      {orders.map((order) => {
        // Group items 
        const groupedItems = {};

        order.items.forEach((item) => {
          const pid = item.productId?._id || item.productId;
          if (!groupedItems[pid]) {
            groupedItems[pid] = { ...item };
          } else {
            groupedItems[pid].quantity += item.quantity;
            groupedItems[pid].price = item.price;
          }
        });

        return (
          <div key={order._id} className="order">
            <h3>Order #{order._id}</h3>
            <p>Status: {order.status}</p>
            <p>Total: ${Number(order.totalAmount).toFixed(2)}</p>
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
                          ? `http://localhost:5000${product.image}`
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
                      <p>Price: ${Number(item.price).toFixed(2)}</p>
                      <p>Quantity: {item.quantity}</p>
                      <p>
                        Subtotal: $
                        {(Number(item.price) * Number(item.quantity)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <ToastContainer />
    </div>
  );
};

export default Orders;