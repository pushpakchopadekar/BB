import React, { useState, useEffect } from 'react';
import '../AvailableStock/AvailableStock.css';
import { database } from '../../firebase';
import { ref, onValue } from 'firebase/database';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const JewelryStorePanel = () => {
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [sortOption, setSortOption] = useState('default');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products from Firebase
  useEffect(() => {
    const productsRef = ref(database, 'products');
    
    const fetchProducts = () => {
      setIsLoading(true);
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
        const data = snapshot.val();
        if (data) {
          const productsArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          setProducts(productsArray);
          toast.dismiss('loading-toast');
          toast.success('Products loaded successfully!', {
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
        setIsLoading(false);
      }, (error) => {
        console.error('Error fetching products:', error);
        toast.dismiss('loading-toast');
        toast.error('Failed to load products!', {
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
  const filteredProducts = activeTab === 'all' 
    ? products 
    : products.filter(product => {
        if (activeTab === 'gold') return product.category === 'Gold';
        if (activeTab === 'silver') return product.category === 'Silver';
        if (activeTab === 'imitation') return product.category === 'Imitation';
        return true;
      });

  // Sort products based on sort option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'price-low':
        return (a.sellingPrice || a.price || 0) - (b.sellingPrice || b.price || 0);
      case 'price-high':
        return (b.sellingPrice || b.price || 0) - (a.sellingPrice || a.price || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  // Function to get product image or placeholder
  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    
    // Return placeholder based on category
    if (product.category === 'Gold') {
      return 'https://via.placeholder.com/600x600/FFD700/000000?text=Gold+Jewelry';
    } else if (product.category === 'Silver') {
      return 'https://via.placeholder.com/600x600/C0C0C0/000000?text=Silver+Jewelry';
    } else {
      return 'https://via.placeholder.com/600x600/FFFFFF/000000?text=Jewelry';
    }
  };

  // Function to get product price
  const getProductPrice = (product) => {
    if (product.sellingPrice) return product.sellingPrice;
    if (product.price) return product.price;
    return 0;
  };

  return (
    <div className="jewelry-store-panel">
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
            className={`tab imitation ${activeTab === 'imitation' ? 'active' : ''}`}
            onClick={() => setActiveTab('imitation')}
          >
            Imitations
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
            <option value="rating">Rating</option>
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
      
      {/* Product grid */}
      <div className="product-grid">
        {!isLoading && sortedProducts.length === 0 ? (
          <div className="no-products">
            <p>No products found in this category.</p>
          </div>
        ) : (
          sortedProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image-container">
                <img 
                  src={getProductImage(product)} 
                  alt={product.name} 
                  className="product-image"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x600/FFFFFF/000000?text=No+Image';
                    e.target.onerror = null;
                  }}
                />
                <span className={`product-badge ${product.category.toLowerCase()}`}>
                  {product.category}
                </span>
              </div>
              <div className="product-details">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description || 'Premium quality jewelry piece'}</p>
                
                <div className="product-price-rating">
                  <span className="price">{getProductPrice(product)}</span>
                  {product.rating && (
                    <span className="rating">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < Math.floor(product.rating) ? 'star-filled' : 'star-empty'}>
                          {i < Math.floor(product.rating) ? '★' : '☆'}
                        </span>
                      ))}
                    </span>
                  )}
                </div>
                <div className="product-stock">
                  Stock: <span className={product.stock <= 0 ? 'out-of-stock' : product.stock < 5 ? 'low-stock' : 'in-stock'}>
                    {product.stock <= 0 ? 'Out of stock' : `${product.stock} available`}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default JewelryStorePanel;