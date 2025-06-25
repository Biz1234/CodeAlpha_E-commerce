import { Routes, Route } from 'react-router-dom';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
function App() {
  return (
    <div>
      <h1>E-commerce Store</h1>
      <Routes>
        <Route path="/" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetails />} />

      </Routes>
    </div>
  );
}

export default App;