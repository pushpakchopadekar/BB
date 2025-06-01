import React, { useState, useEffect } from 'react';
import './RegisteredProducts.css';
import { database } from '../../firebase';
import { ref, onValue, off, remove, update } from 'firebase/database';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const RegisteredProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
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
  const [isLoading, setIsLoading] = useState(true);

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
      off(productsRef);
    };
  }, []);

  const categories = ['All', 'Gold', 'Silver', 'Emitation'];

  useEffect(() => {
    let result = [...products];

    if (searchTerm) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.barcode && p.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (categoryFilter !== 'All') {
      result = result.filter(p => p.category === categoryFilter);
    }

    if (stockFilter === 'Low') {
      result = result.filter(p => p.stock < 5);
    } else if (stockFilter === 'Out') {
      result = result.filter(p => p.stock === 0);
    }

    switch(sortOption) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [products, searchTerm, categoryFilter, stockFilter, sortOption]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const toggleProductSelection = (id) => {
    setSelectedProducts(prev =>
      prev.includes(id)
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === currentItems.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(currentItems.map(p => p.id));
    }
  };

  const handleDelete = (id) => {
    setProductToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const productRef = ref(database, `products/${productToDelete}`);
      await remove(productRef);
      setSelectedProducts(prev => prev.filter(id => id !== productToDelete));
      setShowDeleteConfirm(false);
      toast.success('Product deleted successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product!', {
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
  };

  const handleBulkDelete = async () => {
    try {
      const deletePromises = selectedProducts.map(id => 
        remove(ref(database, `products/${id}`))
      );
      await Promise.all(deletePromises);
      setSelectedProducts([]);
      toast.success(`${selectedProducts.length} products deleted successfully!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    } catch (error) {
      console.error('Error deleting products:', error);
      toast.error('Failed to delete selected products!', {
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
  };

  const handleExport = (type) => {
    const dataToExport = filteredProducts.map(product => ({
      'Product Name': product.name,
      'Barcode': product.barcode,
      'Category': product.category,
      'Weight (grams)': product.weight || 'N/A',
      'Stock': product.stock
    }));

    if (type === 'csv') {
      const csvContent = [
        Object.keys(dataToExport[0]).join(','),
        ...dataToExport.map(item => Object.values(item).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `products_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (type === 'pdf') {
      generatePDF(dataToExport);
    }

    toast.success(`Export to ${type.toUpperCase()} completed successfully!`, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
  };

  const generatePDF = (data) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text('Products Report', 105, 15, { align: 'center' });
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });
    
    // Add table
    const headers = [Object.keys(data[0])];
    const rows = data.map(item => Object.values(item));
    
    doc.autoTable({
      head: headers,
      body: rows,
      startY: 30,
      theme: 'grid',
      headStyles: {
        fillColor: [249, 115, 22],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [255, 247, 237]
      },
      margin: { top: 30 }
    });
    
    // Save the PDF
    doc.save(`products_export_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const saveEditedProduct = async (product) => {
    try {
      const productRef = ref(database, `products/${product.id}`);
      await update(productRef, {
        name: product.name,
        category: product.category,
        stock: product.stock,
        barcode: product.barcode,
        weight: product.weight || null
      });
      setEditingProduct(null);
      toast.success('Product updated successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product!', {
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
  };

  return (
    <div className="registered-products">
      
      <div className="tabs-export-container">
        <div className="category-tabs">
          {categories.map(cat => (
            <button
              key={cat}
              className={`tab-btn ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="export-buttons">
          <button
            className="export-btn"
            onClick={() => handleExport('csv')}
          >
            <span className="export-icon">📊</span> Export Excel
          </button>
          <button
            className="export-btn"
            onClick={() => handleExport('pdf')}
          >
            <span className="export-icon">📄</span> Export PDF
          </button>
        </div>
      </div>

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
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

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
              <th>Weight</th>
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
                  <td className="image-cell">
                    <div className="product-image-container">
                      <img 
                        src={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/80'} 
                        alt={product.name} 
                        className="product-image"
                      />
                    </div>
                  </td>
                  <td>{product.name}</td>
                  <td>{product.barcode}</td>
                  <td>{product.category}</td>
                  <td>
                    {product.category === 'Gold' || product.category === 'Silver' ? (
                      `${product.weight || 0} grams`
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>
                    <span className={`stock-badge ${product.stock === 0 ? 'out-stock' : ''}`}>
                      {product.stock} pcs
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="edit-btn"
                        onClick={() => setEditingProduct(product)}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(product.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-products">
                  {products.length === 0 ? 'No products registered yet' : 'No products found matching your criteria'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
                    <option value="">Select Category</option>
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
              
              <div className="form-group">
                <label>Barcode</label>
                <input
                  type="text"
                  value={editingProduct.barcode}
                  onChange={(e) => setEditingProduct({...editingProduct, barcode: e.target.value})}
                />
              </div>
              
              {(editingProduct.category === 'Gold' || editingProduct.category === 'Silver') && (
                <div className="form-group">
                  <label>Weight (grams)</label>
                  <input
                    type="number"
                    value={editingProduct.weight}
                    onChange={(e) => setEditingProduct({...editingProduct, weight: parseFloat(e.target.value) || 0})}
                    step="0.01"
                    min="0"
                  />
                </div>
              )}
              
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