import React, { useState, useEffect } from 'react';
import { 
  FaExclamationTriangle, 
  FaGem, 
  FaBarcode,
  FaSearch,
  FaFilter,
  FaBoxOpen,
  FaExclamationCircle,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { database } from '../../firebase';
import { ref, onValue, off } from 'firebase/database';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './StockAlert.css'; // Make sure to create this CSS file

const StockAlert = () => {
  const [stockItems, setStockItems] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'alertLevel', direction: 'desc' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const productsRef = ref(database, 'products');
    
    const fetchProducts = () => {
      setIsLoading(true);
      toast.info('Loading stock alerts...', {
        position: "top-right",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        toastId: 'loading-toast'
      });

      onValue(productsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const productsArray = Object.keys(data).map(key => {
            const product = data[key];
            
            let alertLevel = 'LOW';
            if (product.stock === 0) {
              alertLevel = 'CRITICAL';
            } else if (product.stock <= (product.reorderLevel || 3)) {
              alertLevel = 'HIGH';
            } else if (product.stock <= (product.reorderLevel || 3) * 2) {
              alertLevel = 'MEDIUM';
            }
            
            return {
              id: key,
              name: product.name,
              category: product.category || 'MUTATION',
              currentStock: product.stock || 0,
              reorderLevel: product.reorderLevel || (product.category === 'GOLD' ? 3 : 
                          product.category === 'SILVER' ? 5 : 8),
              lastSold: product.lastSold || 'Not available',
              details: {
                weight: product.weight ? `${product.weight}g` : null,
                purity: product.purity || null,
                price: product.category === 'MUTATION' ? `₹${product.sellingPrice || product.price || 0}` : null
              },
              alertLevel: alertLevel
            };
          });
          
          setStockItems(productsArray);
          toast.dismiss('loading-toast');
          toast.success('Stock alerts loaded successfully!', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
        } else {
          setStockItems([]);
          toast.dismiss('loading-toast');
          toast.info('No products found in database.', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
        }
        setIsLoading(false);
      }, (error) => {
        console.error('Error fetching products:', error);
        toast.dismiss('loading-toast');
        toast.error('Failed to load stock alerts!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        setIsLoading(false);
      });
    };

    fetchProducts();

    return () => {
      off(productsRef);
    };
  }, []);

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'ALL') return matchesSearch;
    if (activeTab === 'GOLD') return item.category === 'GOLD' && matchesSearch;
    if (activeTab === 'SILVER') return item.category === 'SILVER' && matchesSearch;
    if (activeTab === 'MUTATION') return item.category === 'MUTATION' && matchesSearch;
    return matchesSearch;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortConfig.key === 'alertLevel') {
      const order = { 'CRITICAL': 1, 'HIGH': 2, 'MEDIUM': 3, 'LOW': 4 };
      if (order[a.alertLevel] < order[b.alertLevel]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (order[a.alertLevel] > order[b.alertLevel]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    }
    
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const summaryStats = {
    totalAlerts: stockItems.length,
    criticalAlerts: stockItems.filter(item => item.alertLevel === 'CRITICAL').length,
    highAlerts: stockItems.filter(item => item.alertLevel === 'HIGH').length,
    outOfStock: stockItems.filter(item => item.currentStock === 0).length
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getCategoryIcon = (category) => {
    switch(category.toLowerCase()) {
      case 'gold': 
        return <motion.div whileHover={{ scale: 1.1 }}><FaGem style={{ color: '#FFD700' }} /></motion.div>;
      case 'silver': 
        return <motion.div whileHover={{ scale: 1.1 }}><FaGem style={{ color: '#C0C0C0' }} /></motion.div>;
      case 'mutation': 
        return <motion.div whileHover={{ scale: 1.1 }}><FaBarcode /></motion.div>;
      default: 
        return <motion.div whileHover={{ scale: 1.1 }}><FaGem /></motion.div>;
    }
  };

  const getAlertLevelClass = (level) => {
    switch(level.toLowerCase()) {
      case 'critical': return 'status-out';
      case 'high': return 'status-low';
      case 'medium': return 'status-medium';
      case 'low': return 'status-high';
      default: return '';
    }
  };

  return (
    <div className="stock-alert-container">
      {/* Loading indicator */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading stock alerts...</p>
        </div>
      )}
      
      {/* Summary Cards */}
      <div className="summary-cards-container">
        <motion.div 
          className="summary-card"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="card-icon">
            <FaExclamationTriangle />
          </div>
          <div className="card-content">
            <h3>Total Alerts</h3>
            <p>{summaryStats.totalAlerts}</p>
          </div>
        </motion.div>
        
        <motion.div 
          className="summary-card critical"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="card-icon">
            <FaBoxOpen />
          </div>
          <div className="card-content">
            <h3>Out of Stock</h3>
            <p>{summaryStats.outOfStock}</p>
          </div>
        </motion.div>
        
        <motion.div 
          className="summary-card high"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="card-icon">
            <FaExclamationCircle />
          </div>
          <div className="card-content">
            <h3>High Alerts</h3>
            <p>{summaryStats.highAlerts}</p>
          </div>
        </motion.div>
        
        <motion.div 
          className="summary-card medium"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="card-icon">
            <FaExclamationTriangle />
          </div>
          <div className="card-content">
            <h3>Critical Alerts</h3>
            <p>{summaryStats.criticalAlerts}</p>
          </div>
        </motion.div>
      </div>
      
      {/* Controls */}
      <div className="controls-section">
        <div className="search-filter-container">
          <motion.div 
            className="search-box"
            whileHover={{ scale: 1.01 }}
          >
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </motion.div>
          
          <motion.div 
            className="sort-container"
            whileHover={{ scale: 1.02 }}
          >
            <label>Sort by:</label>
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
            {sortConfig.direction === 'asc' ? <FaArrowUp /> : <FaArrowDown />}
          </motion.div>
        </div>
        
        <div className="category-tabs">
          <motion.button
            className={`tab ${activeTab === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveTab('ALL')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            All ({stockItems.length})
          </motion.button>
          
          <motion.button
            className={`tab gold ${activeTab === 'GOLD' ? 'active' : ''}`}
            onClick={() => setActiveTab('GOLD')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Gold ({stockItems.filter(item => item.category === 'GOLD').length})
          </motion.button>
          
          <motion.button
            className={`tab silver ${activeTab === 'SILVER' ? 'active' : ''}`}
            onClick={() => setActiveTab('SILVER')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Silver ({stockItems.filter(item => item.category === 'SILVER').length})
          </motion.button>
          
          <motion.button
            className={`tab mutation ${activeTab === 'MUTATION' ? 'active' : ''}`}
            onClick={() => setActiveTab('MUTATION')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Emitations ({stockItems.filter(item => item.category === 'MUTATION').length})
          </motion.button>
        </div>
      </div>
      
      {/* Products Table */}
      <div className="products-table-container">
        {sortedItems.length === 0 ? (
          <div className="no-products-found">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <FaExclamationTriangle size={48} />
            </motion.div>
            <h3>No items found matching your criteria</h3>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="products-table">
              <thead>
                <tr>
                  <th onClick={() => requestSort('alertLevel')}>
                    Alert Level {sortConfig.key === 'alertLevel' && (sortConfig.direction === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                  </th>
                  <th onClick={() => requestSort('name')}>
                    Product Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                  </th>
                  <th onClick={() => requestSort('category')}>
                    Category {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                  </th>
                  <th onClick={() => requestSort('currentStock')}>
                    Current Stock {sortConfig.key === 'currentStock' && (sortConfig.direction === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                  </th>
                  <th>Reorder Level</th>
                  <th onClick={() => requestSort('lastSold')}>
                    Last Sold {sortConfig.key === 'lastSold' && (sortConfig.direction === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                  </th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {sortedItems.map(item => (
                  <motion.tr 
                    key={item.id}
                    className="product-row"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ backgroundColor: '#f8f9fa' }}
                  >
                    <td>
                      <span className={`status-badge ${getAlertLevelClass(item.alertLevel)}`}>
                        {item.alertLevel}
                      </span>
                    </td>
                    <td>{item.name}</td>
                    <td>
                      <div className="category-cell">
                        {getCategoryIcon(item.category)}
                        <span className={`category-badge ${item.category.toLowerCase()}`}>
                          {item.category}
                        </span>
                      </div>
                    </td>
                    <td className={item.currentStock === 0 ? 'status-out' : ''}>
                      {item.currentStock}
                    </td>
                    <td>{item.reorderLevel}</td>
                    <td>{item.lastSold}</td>
                    <td>
                      {item.details.weight && <div>Weight: {item.details.weight}</div>}
                      {item.details.purity && <div>Purity: {item.details.purity}</div>}
                      {item.details.price && <div>Price: {item.details.price}</div>}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockAlert;