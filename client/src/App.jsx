import { Routes, Route } from 'react-router-dom';
import Products from './pages/Products';

function App() {
  return (
    <div>
      <h1>E-commerce Store</h1>
      <Routes>
        <Route path="/" element={<Products />} />
      </Routes>
    </div>
  );
}

export default App;