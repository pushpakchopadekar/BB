import React, { useState } from 'react';
import { 
  FaExclamationTriangle, 
  FaGem, 
  FaRing, 
  FaNecklace, 
  FaBarcode,
  FaSearch,
  FaFilter
} from 'react-icons/fa';

const StockAlert = () => {
  // Sample data from your image
  const [stockItems, setStockItems] = useState([
    { 
      id: 1, 
      name: "Gold Earnings", 
      category: "GOLD", 
      currentStock: 2, 
      reorderLevel: 5, 
      lastSold: "14/1/2024",
      details: { weight: "6.8g", purity: "24K" },
      alertLevel: "HIGH"
    },
    { 
      id: 2, 
      name: "Designer Bangles", 
      category: "Mutation", 
      currentStock: 1, 
      reorderLevel: 5, 
      lastSold: "13/1/2024",
      details: { price: "1450" },
      alertLevel: "HIGH"
    },
    { 
      id: 3, 
      name: "Silver Pendant", 
      category: "SILVER", 
      currentStock: 0, 
      reorderLevel: 3, 
      lastSold: "15/1/2024",
      details: { weight: "42g", purity: "925" },
      alertLevel: "CRITICAL"
    },
    { 
      id: 4, 
      name: "Fashion Ring Set", 
      category: "Mutation", 
      currentStock: 2, 
      reorderLevel: 8, 
      lastSold: "12/1/2024",
      details: { price: "₹320" },
      alertLevel: "HIGH"
    },
    { 
      id: 5, 
      name: "Gold Anklet", 
      category: "GOLD", 
      currentStock: 1, 
      reorderLevel: 3, 
      lastSold: "11/1/2024",
      details: { weight: "12.5g", purity: "22K" },
      alertLevel: "HIGH"
    }
  ]);

  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'alertLevel', direction: 'desc' });

  // Filter items based on active tab
  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'ALL') return matchesSearch;
    if (activeTab === 'GOLD') return item.category === 'GOLD' && matchesSearch;
    if (activeTab === 'SILVER') return item.category === 'SILVER' && matchesSearch;
    if (activeTab === 'MUTATION') return item.category === 'Mutation' && matchesSearch;
    return matchesSearch;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Calculate summary stats
  const summaryStats = {
    totalAlerts: stockItems.length,
    criticalAlerts: stockItems.filter(item => item.alertLevel === 'CRITICAL').length,
    highAlerts: stockItems.filter(item => item.alertLevel === 'HIGH').length,
    outOfStock: stockItems.filter(item => item.currentStock === 0).length
  };

  // Request sort
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch(category.toLowerCase()) {
      case 'gold': return <FaGem style={{ color: '#FFD700' }} />;
      case 'silver': return <FaGem style={{ color: '#C0C0C0' }} />;
      case 'mutation': return <FaBarcode />;
      default: return <FaGem />;
    }
  };

  return (
    <div className="stock-alert-container">
      <h2 className="alert-header">
        <FaExclamationTriangle className="alert-icon" /> Stock Alerts
      </h2>
      
      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card total">
          <h3>Total Alerts</h3>
          <p>{summaryStats.totalAlerts}</p>
        </div>
        <div className="summary-card critical">
          <h3>Out of Stock</h3>
          <p>{summaryStats.outOfStock}</p>
        </div>
        <div className="summary-card high">
          <h3>High Alerts</h3>
          <p>{summaryStats.highAlerts}</p>
        </div>
        <div className="summary-card medium">
          <h3>Critical Alerts</h3>
          <p>{summaryStats.criticalAlerts}</p>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="search-filter-container">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-dropdown">
          <FaFilter className="filter-icon" />
          <select 
            value={sortConfig.key}
            onChange={(e) => requestSort(e.target.value)}
          >
            <option value="alertLevel">Alert Level</option>
            <option value="name">Product Name</option>
            <option value="category">Category</option>
            <option value="currentStock">Stock Level</option>
            <option value="lastSold">Last Sold</option>
          </select>
        </div>
      </div>
      
      {/* Category Tabs */}
      <div className="category-tabs">
        <button 
          className={activeTab === 'ALL' ? 'active' : ''}
          onClick={() => setActiveTab('ALL')}
        >
          All ({stockItems.length})
        </button>
        <button 
          className={activeTab === 'GOLD' ? 'active' : ''}
          onClick={() => setActiveTab('GOLD')}
        >
          Gold ({stockItems.filter(item => item.category === 'GOLD').length})
        </button>
        <button 
          className={activeTab === 'SILVER' ? 'active' : ''}
          onClick={() => setActiveTab('SILVER')}
        >
          Silver ({stockItems.filter(item => item.category === 'SILVER').length})
        </button>
        <button 
          className={activeTab === 'MUTATION' ? 'active' : ''}
          onClick={() => setActiveTab('MUTATION')}
        >
          Mutations ({stockItems.filter(item => item.category === 'Mutation').length})
        </button>
      </div>
      
      {/* Stock Items Table */}
      <div className="stock-items-table">
        <table>
          <thead>
            <tr>
              <th>Alert Level</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Reorder Level</th>
              <th>Last Sold</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-items">No items found matching your criteria</td>
              </tr>
            ) : (
              sortedItems.map(item => (
                <tr key={item.id} className={`alert-item ${item.alertLevel.toLowerCase()}`}>
                  <td>
                    <span className={`alert-level ${item.alertLevel.toLowerCase()}`}>
                      {item.alertLevel}
                    </span>
                  </td>
                  <td>{item.name}</td>
                  <td>
                    <div className="category-cell">
                      {getCategoryIcon(item.category)}
                      {item.category}
                    </div>
                  </td>
                  <td className={item.currentStock === 0 ? 'out-of-stock' : ''}>
                    {item.currentStock}
                  </td>
                  <td>{item.reorderLevel}</td>
                  <td>{item.lastSold}</td>
                  <td>
                    {item.details.weight && <div>Weight: {item.details.weight}</div>}
                    {item.details.purity && <div>Purity: {item.details.purity}</div>}
                    {item.details.price && <div>Price: {item.details.price}</div>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockAlert;