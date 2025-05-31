import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaGem, FaRing, FaNecklace, FaEarrings } from 'react-icons/fa';
import '../StokeAlert/Alert.css';

const StockAlert = () => {
  const [lowStockItems, setLowStockItems] = useState([
    { id: 1, name: "Diamond Ring", category: "Ring", currentStock: 1, threshold: 2 },
    { id: 2, name: "Gold Chain", category: "Necklace", currentStock: 0, threshold: 2 },
    { id: 3, name: "Pearl Earrings", category: "Earrings", currentStock: 1, threshold: 2 },
    { id: 4, name: "Silver Bracelet", category: "Bracelet", currentStock: 2, threshold: 2 },
  ]);

  useEffect(() => {
    // fetchLowStockItems().then(data => setLowStockItems(data));
  }, []);

  const criticalItems = lowStockItems.filter(item => item.currentStock < item.threshold);

  const getCategoryIcon = (category) => {
    switch(category.toLowerCase()) {
      case 'ring': return <FaRing />;
      case 'necklace': return <FaNecklace />;
      case 'earrings': return <FaEarrings />;
      default: return <FaGem />;
    }
  };

  return (
    <div className="stock-alert-container">
      <h2 className="alert-header">
        <FaExclamationTriangle className="alert-icon" /> Stock Alerts
        <span className="alert-count">
          {criticalItems.length} critical
        </span>
      </h2>
      
      {criticalItems.length === 0 ? (
        <div className="no-alert">
          No critical stock items! All items are above threshold.
        </div>
      ) : (
        <div className="alert-items-container">
          {criticalItems.map(item => (
            <div key={item.id} className={`alert-item ${item.currentStock === 0 ? 'out-of-stock' : 'low-stock'}`}>
              <div className="item-icon">
                {getCategoryIcon(item.category)}
              </div>
              <div className="item-details">
                <h3 className="item-name">{item.name}</h3>
                <p className="item-category">{item.category}</p>
              </div>
              <div className="item-stock">
                <span className={`stock-count ${item.currentStock === 0 ? 'zero-stock' : ''}`}>
                  {item.currentStock}
                </span>
                <span className="stock-label">in stock</span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="alert-footer">
        <p>Threshold: Alert when stock is below 2 items</p>
      </div>
    </div>
  );
};

export default StockAlert;