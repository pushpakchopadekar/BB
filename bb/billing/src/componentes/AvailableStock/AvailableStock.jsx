import { useEffect, useState } from 'react';
import '../AvailableStock/AvailableStock.css';

const AvailableStock = () => {
  const [jewelryItems, setJewelryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Simulate API call
    const fetchJewelryItems = async () => {
      try {
        // In a real app, you would fetch from your backend API
        const mockData = [
          { id: 1, name: 'Diamond Ring', category: 'rings', price: 899.99, stock: 15, image: 'ring1.jpg' },
          { id: 2, name: 'Gold Necklace', category: 'necklaces', price: 1299.99, stock: 8, image: 'necklace1.jpg' },
          { id: 3, name: 'Pearl Earrings', category: 'earrings', price: 499.99, stock: 20, image: 'earrings1.jpg' },
          { id: 4, name: 'Silver Bracelet', category: 'bracelets', price: 399.99, stock: 12, image: 'bracelet1.jpg' },
          { id: 5, name: 'Platinum Wedding Band', category: 'rings', price: 1599.99, stock: 5, image: 'ring2.jpg' },
          { id: 6, name: 'Gemstone Pendant', category: 'necklaces', price: 799.99, stock: 10, image: 'necklace2.jpg' },
        ];
        setJewelryItems(mockData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching jewelry items:', error);
        setLoading(false);
      }
    };

    fetchJewelryItems();
  }, []);

  const filteredItems = filter === 'all' 
    ? jewelryItems 
    : jewelryItems.filter(item => item.category === filter);

  return (
    <div className="available-stock-container">
      <h2 className="stock-header">Our Available Jewelry Collection</h2>
      
      <div className="filter-controls">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Items
        </button>
        <button 
          className={`filter-btn ${filter === 'rings' ? 'active' : ''}`}
          onClick={() => setFilter('rings')}
        >
          Rings
        </button>
        <button 
          className={`filter-btn ${filter === 'necklaces' ? 'active' : ''}`}
          onClick={() => setFilter('necklaces')}
        >
          Necklaces
        </button>
        <button 
          className={`filter-btn ${filter === 'earrings' ? 'active' : ''}`}
          onClick={() => setFilter('earrings')}
        >
          Earrings
        </button>
        <button 
          className={`filter-btn ${filter === 'bracelets' ? 'active' : ''}`}
          onClick={() => setFilter('bracelets')}
        >
          Bracelets
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div className="jewelry-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="jewelry-card">
              <div className="image-placeholder">
                {/* In a real app, you would use the actual image */}
                <img src={`/images/${item.image}`} alt={item.name} className="jewelry-image" />
              </div>
              <div className="jewelry-details">
                <h3>{item.name}</h3>
                <p className="price">${item.price.toFixed(2)}</p>
                <p className={`stock ${item.stock < 10 ? 'low-stock' : ''}`}>
                  {item.stock < 10 ? `Only ${item.stock} left!` : `In Stock: ${item.stock}`}
                </p>
                <button className="add-to-cart-btn">Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableStock;