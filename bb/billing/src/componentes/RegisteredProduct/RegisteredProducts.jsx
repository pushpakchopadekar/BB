import React, { useState, useEffect } from 'react';
import './RegisteredProducts.css';

const RegisteredProducts = () => {
  // Sample product data
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Gold Chain 22K",
      barcode: "JWL12345678",
      category: "Chain",
      metalType: "Gold",
      purity: "22K",
      weight: 8.5,
      price: 42500,
      stock: 12,
      image: "https://via.placeholder.com/80",
      lastUpdated: "2023-05-10"
    },
    {
      id: 2,
      name: "Diamond Ring 18K",
      barcode: "JWL87654321",
      category: "Ring",
      metalType: "Gold",
      purity: "18K",
      weight: 3.2,
      price: 28500,
      stock: 5,
      image: "https://via.placeholder.com/80",
      lastUpdated: "2023-05-15"
    },
    {
      id: 3,
      name: "Silver Bracelet",
      barcode: "JWL56781234",
      category: "Bracelet",
      metalType: "Silver",
      purity: "92.5 Sterling Silver",
      weight: 25,
      price: 2250,
      stock: 18,
      image: "https://via.placeholder.com/80",
      lastUpdated: "2023-05-12"
    },
    {
      id: 4,
      name: "Gold Mangalsutra",
      barcode: "JWL34567812",
      category: "Pendant",
      metalType: "Gold",
      purity: "22K",
      weight: 5.8,
      price: 32000,
      stock: 3,
      image: "https://via.placeholder.com/80",
      lastUpdated: "2023-05-18"
    },
    {
      id: 5,
      name: "Platinum Earrings",
      barcode: "JWL98765432",
      category: "Earrings",
      metalType: "Platinum",
      purity: "95%",
      weight: 4.2,
      price: 38500,
      stock: 7,
      image: "https://via.placeholder.com/80",
      lastUpdated: "2023-05-20"
    }
  ]);

  const [filteredProducts, setFilteredProducts] = useState(products);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [sortOption, setSortOption] = useState('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Get unique categories
  const categories = ['All', ...new Set(products.map(p => p.category))];

  // Filter and sort products
  useEffect(() => {
    let result = [...products];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'All') {
      result = result.filter(p => p.category === categoryFilter);
    }
    
    // Apply stock filter
    if (stockFilter === 'Low') {
      result = result.filter(p => p.stock < 5);
    } else if (stockFilter === 'Out') {
      result = result.filter(p => p.stock === 0);
    }
    
    // Apply sorting
    switch(sortOption) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.lastUpdated) - new Date(b.lastUpdated));
        break;
      default:
        break;
    }
    
    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, searchTerm, categoryFilter, stockFilter, sortOption]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Handle product selection
  const toggleProductSelection = (id) => {
    setSelectedProducts(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id) 
        : [...prev, id]
    );
  };

  // Handle select all on current page
  const toggleSelectAll = () => {
    if (selectedProducts.length === currentItems.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(currentItems.map(p => p.id));
    }
  };

  // Handle delete product
  const handleDelete = (id) => {
    setProductToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setProducts(prev => prev.filter(p => p.id !== productToDelete));
    setSelectedProducts(prev => prev.filter(id => id !== productToDelete));
    setShowDeleteConfirm(false);
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
    setSelectedProducts([]);
  };

  // Handle edit product
  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const saveEditedProduct = (updatedProduct) => {
    setProducts(prev => 
      prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    );
    setEditingProduct(null);
  };

  return (
    <div className="registered-products">
      {/* Header Section */}
      <div className="products-header">
        <h2>Registered Products</h2>
        <div className="header-actions">
          <button className="add-btn">
            ➕ Add New Product
          </button>
          <button className="export-btn">
            ⬇️ Export
          </button>
          <button 
            className="refresh-btn"
            onClick={() => window.location.reload()}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="products-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button>🔍</button>
        </div>
        
        <div className="filter-group">
          <label>Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Stock:</label>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Low">Low Stock (&lt;5)</option>
            <option value="Out">Out of Stock</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Sort By:</label>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedProducts.length === currentItems.length && currentItems.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Image</th>
              <th>Product Name</th>
              <th>Barcode No.</th>
              <th>Category</th>
              <th>Metal</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map(product => (
                <tr 
                  key={product.id} 
                  className={product.stock < 5 ? 'low-stock' : ''}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => toggleProductSelection(product.id)}
                    />
                  </td>
                  <td>
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="product-image"
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.barcode}</td>
                  <td>{product.category}</td>
                  <td>{product.metalType} {product.purity}</td>
                  <td>₹{product.price.toLocaleString()}</td>
                  <td>
                    <span className={`stock-badge ${product.stock === 0 ? 'out-stock' : ''}`}>
                      {product.stock} pcs
                    </span>
                  </td>
                  <td>
                    <button 
                      className="edit-btn"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="no-products">
                  No products found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bulk Actions & Pagination */}
      <div className="products-footer">
        {selectedProducts.length > 0 && (
          <div className="bulk-actions">
            <span>{selectedProducts.length} selected</span>
            <button 
              className="bulk-delete-btn"
              onClick={handleBulkDelete}
            >
              Delete Selected
            </button>
          </div>
        )}
        
        <div className="pagination">
          <div className="items-per-page">
            <span>Items per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
          
          <div className="page-controls">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ◄
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              ►
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <h3>Edit Product</h3>
            <div className="edit-form">
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({...editingProduct, price: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                </div>
                
                <div className="form-group">
                  <label>Barcode</label>
                  <input
                    type="text"
                    value={editingProduct.barcode}
                    onChange={(e) => setEditingProduct({...editingProduct, barcode: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setEditingProduct(null)}
                >
                  Cancel
                </button>
                <button 
                  className="save-btn"
                  onClick={() => saveEditedProduct(editingProduct)}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisteredProducts;