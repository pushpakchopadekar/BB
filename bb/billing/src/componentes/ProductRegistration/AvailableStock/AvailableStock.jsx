import React, { useState, useEffect } from 'react';
import '../AvailableStock/AvailableStock.css';
import { database } from '../../firebase';
import { ref, onValue } from 'firebase/database';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaGem, FaCoins, FaExclamationTriangle, FaBoxes, FaQuestionCircle } from 'react-icons/fa';

const JewelryStorePanel = () => {
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [sortOption, setSortOption] = useState('default');
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState(null);

  // Calculate summary statistics
  const totalItems = products.length;
  const goldItems = products.filter(p => p.category === 'Gold').length;
  const silverItems = products.filter(p => p.category === 'Silver').length;
  const emitationItems = products.filter(p => p.category === 'Emitation').length;
  const lowStockItems = products.filter(p => (p.stock || 0) <= 2).length;

  // Debugging function to log product categories
  const logProductCategories = (products) => {
    const categories = {};
    products.forEach(product => {
      categories[product.category] = (categories[product.category] || 0) + 1;
    });
    console.log('Product Categories:', categories);
  };

  // Fetch products from Firebase
  useEffect(() => {
    const productsRef = ref(database, 'products');
    
    const fetchProducts = () => {
      setIsLoading(true);
      setFirebaseError(null);
      toast.info('Loading products...', {
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
        try {
          const data = snapshot.val();
          console.log('Raw Firebase Data:', data);
          
          if (data) {
            const productsArray = Object.keys(data).map(key => ({
              id: key,
              barcode: key.slice(0, 8).toUpperCase(),
              ...data[key]
            }));
            
            setProducts(productsArray);
            logProductCategories(productsArray);
            
            toast.dismiss('loading-toast');
            toast.success(`Loaded ${productsArray.length} products successfully!`, {
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
            setProducts([]);
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
        } catch (error) {
          console.error('Error processing data:', error);
          setFirebaseError('Error processing data from Firebase');
          toast.dismiss('loading-toast');
          toast.error('Error processing product data!', {
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
        console.error('Firebase connection error:', error);
        setFirebaseError(`Firebase error: ${error.message}`);
        toast.dismiss('loading-toast');
        toast.error('Failed to connect to database!', {
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
      // Cleanup handled automatically by Firebase
    };
  }, []);

  // Filter products based on active tab
  const filteredProducts = products.filter(product => {
    if (activeTab === 'all') return product.category === 'Gold' || product.category === 'Silver';
    if (activeTab === 'gold') return product.category === 'Gold';
    if (activeTab === 'silver') return product.category === 'Silver';
    if (activeTab === 'emitation') return product.category === 'Emitation';
    return false;
  });

  // Sort products based on sort option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'price-low':
        return (a.sellingPrice || a.price || 0) - (b.sellingPrice || b.price || 0);
      case 'price-high':
        return (b.sellingPrice || b.price || 0) - (a.sellingPrice || a.price || 0);
      case 'stock-low':
        return (a.stock || 0) - (b.stock || 0);
      case 'stock-high':
        return (b.stock || 0) - (a.stock || 0);
      default:
        return 0;
    }
  });

  // Function to get stock status
  const getStockStatus = (stock) => {
    if (stock <= 0) return 'Out of Stock';
    if (stock <= 2) return 'Low Stock';
    if (stock <= 5) return 'Medium Stock';
    return 'In Stock';
  };

  // Function to get status color class
  const getStatusClass = (stock) => {
    if (stock <= 0) return 'status-out';
    if (stock <= 2) return 'status-low';
    if (stock <= 5) return 'status-medium';
    return 'status-high';
  };

  return (
    <div className="jewelry-store-panel">
      {/* Debugging Info */}
      {firebaseError && (
        <div className="firebase-error">
          <FaQuestionCircle /> {firebaseError}
        </div>
      )}

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card total-items">
          <div className="card-icon">
            <FaBoxes className="icon" />
          </div>
          <div className="card-content">
            <h3>Total Items</h3>
            <p>{totalItems}</p>
          </div>
        </div>
        
        <div className="summary-card gold-items">
          <div className="card-icon">
            <FaGem className="icon" />
          </div>
          <div className="card-content">
            <h3>Gold Items</h3>
            <p>{goldItems}</p>
          </div>
        </div>
        
        <div className="summary-card silver-items">
          <div className="card-icon">
            <FaCoins className="icon" />
          </div>
          <div className="card-content">
            <h3>Silver Items</h3>
            <p>{silverItems}</p>
          </div>
        </div>
        
        <div className="summary-card emitation-items">
          <div className="card-icon">
            <FaQuestionCircle className="icon" />
          </div>
          <div className="card-content">
            <h3>Emitation Items</h3>
            <p>{emitationItems}</p>
          </div>
        </div>
      </div>
      
      <div className="controls-container">
        {/* Tabs */}
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button 
            className={`tab gold ${activeTab === 'gold' ? 'active' : ''}`}
            onClick={() => setActiveTab('gold')}
          >
            Gold
          </button>
          <button 
            className={`tab silver ${activeTab === 'silver' ? 'active' : ''}`}
            onClick={() => setActiveTab('silver')}
          >
            Silver
          </button>
          <button 
            className={`tab emitation ${activeTab === 'emitation' ? 'active' : ''}`}
            onClick={() => setActiveTab('emitation')}
          >
            Emitations
          </button>
        </div>
        
        {/* Sort dropdown */}
        <div className="sort-container">
          <label htmlFor="sort">Sort by:</label>
          <select 
            id="sort" 
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="default">Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="stock-low">Stock: Low to High</option>
            <option value="stock-high">Stock: High to Low</option>
          </select>
        </div>
      </div>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      )}
      
      {/* Product Table */}
      <div className="product-table-container">
        {!isLoading && sortedProducts.length === 0 ? (
          <div className="no-products">
            <p>No products found in this category.</p>
            {activeTab === 'emitation' && (
              <div className="debug-info">
                <p>Check if any products have category exactly as "Emitation" in Firebase.</p>
                <p>Current categories in database: {[...new Set(products.map(p => p.category))].join(', ')}</p>
              </div>
            )}
          </div>
        ) : (
          <table className="product-table">
            <thead>
              <tr>
                <th>Barcode</th>
                <th>Product Name</th>
                <th>Category</th>
                {activeTab === 'emitation' ? (
                  <th>Price</th>
                ) : (
                  <th>Weight (g)</th>
                )}
                <th>Available Qty</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map(product => (
                <tr key={product.id} className="product-row">
                  <td>{product.barcode}</td>
                  <td>{product.name}</td>
                  <td>
                    <span className={`category-badge ${product.category.toLowerCase()}`}>
                      {product.category}
                    </span>
                  </td>
                  <td>
                    {product.category === 'Emitation' ? (
                      `₹${product.sellingPrice || product.price || 0}`
                    ) : (
                      product.weight ? `${product.weight}g` : 'N/A'
                    )}
                  </td>
                  <td>{product.stock || 0}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(product.stock)}`}>
                      {getStockStatus(product.stock)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default JewelryStorePanel;