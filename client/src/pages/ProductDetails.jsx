import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import '../styles/ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load product');
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!product) return <div>Product not found</div>;

  const handleAddToCart = async () => {
    try {
      await addToCart(product, quantity);
      alert(`${quantity} ${product.name}(s) added to cart!`);
    } catch (err) {
      alert('Failed to add to cart: ' + err.message);
    }
  };

  return (
    <div className="product-details-container">
      <h1>{product.name}</h1>
      <div className="product-details">
        <img src={product.image} alt={product.name} />
        <div className="product-info">
          <p><strong>Price:</strong> ${product.price.toFixed(2)}</p>
          <p><strong>Description:</strong> {product.description}</p>
          <p><strong>Category:</strong> {product.category}</p>
          <p><strong>Stock:</strong> {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</p>
          <div>
            <label>Quantity: </label>
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              disabled={product.stock === 0}
            />
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || quantity < 1}
            className="add-to-cart-btn"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;