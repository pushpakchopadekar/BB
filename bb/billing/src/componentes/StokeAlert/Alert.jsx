import React from 'react';
import { 
  FaExclamationTriangle, FaSearch, FaPrint, FaBoxOpen, 
  FaBoxes, FaRegClockCircle, FaRupeeSign 
} from 'react-icons/fa';
import { FiEdit, FiEye, FiPlus } from 'react-icons/fi';
import '../StokeAlert/Alert.css';

const StockAlert = () => {
  // Sample data - replace with your actual data
  const stockData = [
    { id: 'GCH-1001', name: '22K Gold Chain', category: 'Gold', currentStock: 1, alertLevel: 'critical', price: 12500, lastUpdated: '2023-05-15' },
    { id: 'SBR-2005', name: 'Silver Bracelet', category: 'Silver', currentStock: 2, alertLevel: 'critical', price: 2500, lastUpdated: '2023-05-14' },
    { id: 'DNG-3002', name: 'Diamond Necklace', category: 'Diamond', currentStock: 3, alertLevel: 'warning', price: 45000, lastUpdated: '2023-05-12' },
    { id: 'GEC-1012', name: 'Gold Earrings', category: 'Gold', currentStock: 4, alertLevel: 'warning', price: 8500, lastUpdated: '2023-05-10' },
    { id: 'SRG-2018', name: 'Silver Ring', category: 'Silver', currentStock: 0, alertLevel: 'critical', price: 1800, lastUpdated: '2023-05-08' },
  ];

  const criticalItems = stockData.filter(item => item.currentStock <= 2).length;
  const warningItems = stockData.filter(item => item.currentStock > 2 && item.currentStock <= 5).length;
  const totalItems = stockData.length;

  return (
    <div className="stock-alert-container">
      {/* Header Section */}
      <div className="stock-alert-header">
        <div className="header-title">
          <FaExclamationTriangle className="header-icon" />
          <h1>Stock Alerts</h1>
          <span className="critical-count">{criticalItems} Critical Items</span>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Search products..." />
          </div>
          <select className="category-filter">
            <option value="all">All Categories</option>
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
            <option value="diamond">Diamond</option>
          </select>
          <button className="print-btn">
            <FaPrint /> Print Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card critical">
          <div className="card-content">
            <h3>Critical Stock</h3>
            <p>Items with quantity ≤ 2</p>
            <div className="card-value">{criticalItems}</div>
          </div>
          <FaExclamationTriangle className="card-icon" />
        </div>

        <div className="summary-card warning">
          <div className="card-content">
            <h3>Low Stock</h3>
            <p>Items with quantity ≤ 5</p>
            <div className="card-value">{warningItems}</div>
          </div>
          <FaBoxOpen className="card-icon" />
        </div>

        <div className="summary-card info">
          <div className="card-content">
            <h3>Total Products</h3>
            <p>All registered items</p>
            <div className="card-value">{totalItems}</div>
          </div>
          <FaBoxes className="card-icon" />
        </div>
      </div>

      {/* Stock Alert Table */}
      <div className="stock-alert-table">
        <table>
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Price</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stockData.map((item) => (
              <tr key={item.id} className={`alert-row ${item.alertLevel}`}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{item.currentStock}</td>
                <td><FaRupeeSign /> {item.price.toLocaleString()}</td>
                <td>
                  <span className={`status-badge ${item.alertLevel}`}>
                    {item.alertLevel === 'critical' ? 'Critical' : 'Low Stock'}
                  </span>
                </td>
                <td>
                  <div className="last-updated">
                    <FaRegClockCircle /> {item.lastUpdated}
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="view-btn">
                      <FiEye /> View
                    </button>
                    <button className="edit-btn">
                      <FiEdit /> Edit
                    </button>
                    <button className="restock-btn">
                      <FiPlus /> Restock
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockAlert;