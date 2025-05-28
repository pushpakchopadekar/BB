import React, { useState, useEffect, useRef } from 'react';
import '../SaleProcess/SaleProcess.css';
import { database } from '../../firebase';
import { ref, onValue, off } from 'firebase/database';

const StartSale = ({ goldRate, silverRate }) => {
  // Customer state
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    isNew: false
  });

  // Product cart state
  const [cart, setCart] = useState([]);
  const [showCartPopup, setShowCartPopup] = useState(false);

  // Summary state
  const [summary, setSummary] = useState({
    subtotal: 0,
    gstAmount: 0,
    total: 0,
    discount: 0,
    discountType: 'percentage',
    finalTotal: 0,
    amountPaid: 0,
    balanceDue: 0,
    paymentMode: 'Cash',
    advancePayment: 0,
    deliveryDate: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    invoiceMonth: new Date().toLocaleString('default', { month: 'long' })
  });

  // Product form state
  const [productForm, setProductForm] = useState({
    barcode: '',
    productId: '',
    productName: '',
    category: 'Gold',
    weight: '',
    currentRate: goldRate,
    makingCharge: '',
    makingChargeType: 'percentage',
    gst: 3,
    totalPrice: 0
  });

  // Products from Firebase
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const barcodeInputRef = useRef(null);

  // Fetch products from Firebase on component mount
  useEffect(() => {
    const productsRef = ref(database, 'products');
    
    const fetchProducts = () => {
      onValue(productsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const productsArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          setProducts(productsArray);
        } else {
          setProducts([]);
        }
        setLoadingProducts(false);
      }, (error) => {
        console.error('Error fetching products:', error);
        setLoadingProducts(false);
      });
    };

    fetchProducts();

    return () => {
      off(productsRef);
    };
  }, []);

  // Calculate totals whenever cart changes
  useEffect(() => {
    calculateTotals();
  }, [cart, summary.discount, summary.discountType, summary.amountPaid]);

  // Focus barcode input on component mount
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    
    setProductForm(prev => {
      const updatedForm = { 
        ...prev, 
        [name]: value,
        currentRate: name === 'category' ? 
          (value === 'Gold' ? goldRate : 
           value === 'Silver' ? silverRate : 
           0) : 
          prev.currentRate
      };
      
      if (['category', 'weight', 'currentRate', 'makingCharge', 'makingChargeType'].includes(name)) {
        updatedForm.totalPrice = calculateProductPrice(updatedForm);
      }
      
      return updatedForm;
    });
  };

  const calculateProductPrice = (product) => {
    if (!product.weight || isNaN(product.weight)) return 0;

    if (product.category === 'Gold' || product.category === 'Silver') {
      const metalValue = product.weight * product.currentRate;

      let makingCharges = 0;
      if (product.makingCharge && !isNaN(product.makingCharge)) {
        if (product.makingChargeType === 'fixed') {
          makingCharges = parseFloat(product.makingCharge);
        } else {
          makingCharges = metalValue * (product.makingCharge / 100);
        }
      }

      const subtotal = metalValue + makingCharges;
      const gstAmount = subtotal * (product.gst / 100);
      return subtotal + gstAmount;
    } else {
      if (!product.makingCharge || isNaN(product.makingCharge)) return 0;
      const price = parseFloat(product.makingCharge);
      return price + (price * (product.gst / 100));
    }
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    
    const discountAmount = summary.discountType === 'percentage'
      ? subtotal * (summary.discount / 100)
      : parseFloat(summary.discount);

    const gstAmount = subtotal * 0.03;
    const total = subtotal + gstAmount;
    const finalTotal = total - discountAmount;
    const balanceDue = finalTotal - summary.amountPaid;

    setSummary(prev => ({
      ...prev,
      subtotal,
      gstAmount,
      total,
      finalTotal,
      balanceDue
    }));
  };

  const handleBarcodeScan = () => {
    if (productForm.barcode) {
      const scannedProduct = products.find(p => p.barcode === productForm.barcode);
      
      if (scannedProduct) {
        setProductForm({
          barcode: scannedProduct.barcode,
          productId: scannedProduct.id,
          productName: scannedProduct.name,
          category: scannedProduct.category || 'Gold',
          weight: scannedProduct.weight,
          currentRate: scannedProduct.category === 'Gold' ? goldRate : 
                      scannedProduct.category === 'Silver' ? silverRate : 0,
          makingCharge: scannedProduct.makingCharge || '',
          makingChargeType: scannedProduct.makingChargeType || 'percentage',
          gst: 3,
          totalPrice: 0
        });
        
        setTimeout(() => {
          setProductForm(prev => ({
            ...prev,
            totalPrice: calculateProductPrice(prev)
          }));
        }, 0);
      } else {
        alert('Product not found in inventory!');
      }
    }
  };

  const addProductToSale = () => {
    if (!productForm.barcode || !productForm.productId) {
      alert('Please scan a valid product barcode!');
      return;
    }

    if (!productForm.weight || isNaN(productForm.weight)) {
      alert('Please enter a valid weight!');
      return;
    }

    if (!productForm.makingCharge || isNaN(productForm.makingCharge)) {
      alert('Please enter valid making charges!');
      return;
    }

    const productToAdd = {
      id: Date.now(),
      productId: productForm.productId,
      barcode: productForm.barcode,
      productName: productForm.productName,
      category: productForm.category,
      weight: parseFloat(productForm.weight),
      currentRate: parseFloat(productForm.currentRate),
      makingCharge: parseFloat(productForm.makingCharge),
      makingChargeType: productForm.makingChargeType,
      gst: productForm.gst,
      totalPrice: parseFloat(productForm.totalPrice.toFixed(2)),
      image: products.find(p => p.id === productForm.productId)?.image || ''
    };

    setCart(prev => [...prev, productToAdd]);
    resetProductForm();
  };

  const resetProductForm = () => {
    setProductForm({
      barcode: '',
      productId: '',
      productName: '',
      category: 'Gold',
      weight: '',
      currentRate: goldRate,
      makingCharge: '',
      makingChargeType: 'percentage',
      gst: 3,
      totalPrice: 0
    });
    
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };

  const removeProductFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    setSummary(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e) => {
    const { value } = e.target;
    setSummary(prev => ({
      ...prev,
      invoiceDate: value,
      invoiceMonth: new Date(value).toLocaleString('default', { month: 'long' })
    }));
  };

  const handleMonthChange = (e) => {
    const { value } = e.target;
    setSummary(prev => ({ ...prev, invoiceMonth: value }));
  };

  const generateInvoice = () => {
    if (cart.length === 0) {
      alert('Please add at least one product to generate invoice!');
      return;
    }

    if (!customer.name) {
      alert('Please enter customer name!');
      return;
    }

    const invoiceData = {
      customer: {
        ...customer,
        id: Date.now()
      },
      items: cart.map(item => ({
        ...item,
        metalValue: item.category === 'Gold' || item.category === 'Silver' ? 
          item.weight * item.currentRate : 0,
        makingCharges: calculateMakingCharges(item),
        gstAmount: item.totalPrice - (item.totalPrice / (1 + (item.gst / 100)))
      })),
      summary: {
        ...summary,
        invoiceNumber: `INV-${Date.now()}`,
        date: summary.invoiceDate,
        month: summary.invoiceMonth,
        discountAmount: summary.discountType === 'percentage' 
          ? summary.subtotal * (summary.discount / 100)
          : parseFloat(summary.discount)
      }
    };

    console.log('Invoice Data:', invoiceData);
    alert('Invoice generated successfully!');
    
    setCustomer({
      name: '',
      phone: '',
      address: '',
      email: '',
      isNew: false
    });
    setCart([]);
    setSummary({
      subtotal: 0,
      gstAmount: 0,
      total: 0,
      discount: 0,
      discountType: 'percentage',
      finalTotal: 0,
      amountPaid: 0,
      balanceDue: 0,
      paymentMode: 'Cash',
      advancePayment: 0,
      deliveryDate: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      invoiceMonth: new Date().toLocaleString('default', { month: 'long' })
    });
    resetProductForm();
  };

  const calculateMakingCharges = (item) => {
    if (item.makingChargeType === 'fixed') {
      return parseFloat(item.makingCharge);
    }
    
    if (item.category === 'Gold' || item.category === 'Silver') {
      const metalValue = item.weight * item.currentRate;
      return metalValue * (item.makingCharge / 100);
    }
    
    return 0;
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="start-sale-container">
      {/* Customer Section */}
      <div className="customer-section">
        <h3>Customer Details</h3>
        <div className="customer-form">
          <div className="form-group">
            <label>Customer Name*</label>
            <input
              type="text"
              name="name"
              value={customer.name}
              onChange={handleCustomerChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={customer.phone}
              onChange={handleCustomerChange}
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={customer.address}
              onChange={handleCustomerChange}
            />
          </div>
          <div className="form-group">
            <label>Email (Optional)</label>
            <input
              type="email"
              name="email"
              value={customer.email}
              onChange={handleCustomerChange}
            />
          </div>
        </div>
      </div>

      {/* Product Section */}
      <div className="product-section">
        <h3>Sale Products</h3>
        
        {/* Cart Button */}
        <div className="cart-button-container">
          <button 
            className="view-cart-btn"
            onClick={() => setShowCartPopup(true)}
            disabled={cart.length === 0}
          >
            🛒 View Cart ({cart.length})
          </button>
        </div>
        
        {/* Product Sale Form */}
        <div className="add-product-form">
          <h4>Scan Product</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label>Barcode*</label>
              <div className="barcode-input-group">
                <input
                  type="text"
                  name="barcode"
                  value={productForm.barcode}
                  onChange={handleProductFormChange}
                  ref={barcodeInputRef}
                  placeholder="Scan product barcode"
                  required
                />
                <button 
                  className="scan-btn"
                  onClick={handleBarcodeScan}
                  disabled={loadingProducts}
                >
                  {loadingProducts ? 'Loading Products...' : '🔍 Find Product'}
                </button>
              </div>
            </div>
          </div>
          
          {productForm.productId && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    name="productName"
                    value={productForm.productName}
                    readOnly
                  />
                </div>
                
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={productForm.category}
                    onChange={handleProductFormChange}
                  >
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Imitation">Imitation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Weight (g)</label>
                  <input
                    type="number"
                    name="weight"
                    value={productForm.weight}
                    onChange={handleProductFormChange}
                    step="0.001"
                    min="0"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>
                    {productForm.category === 'Gold' || productForm.category === 'Silver' ? 
                      'Current Rate (₹/g)*' : 'Selling Price*'}
                  </label>
                  <input
                    type="number"
                    name="currentRate"
                    value={productForm.currentRate}
                    onChange={handleProductFormChange}
                    step="0.01"
                    min="0"
                    required
                  />
                  <small>
                    {productForm.category === 'Gold' ? 
                      `Gold Rate: ₹${goldRate.toFixed(2)}/g` : 
                      productForm.category === 'Silver' ? 
                      `Silver Rate: ₹${silverRate.toFixed(2)}/g` : ''}
                  </small>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Making Charge*</label>
                  <div className="making-charge-group">
                    <input
                      type="number"
                      name="makingCharge"
                      value={productForm.makingCharge}
                      onChange={handleProductFormChange}
                      step="0.01"
                      min="0"
                      required
                    />
                    <select
                      name="makingChargeType"
                      value={productForm.makingChargeType}
                      onChange={handleProductFormChange}
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">₹</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>GST (%)</label>
                  <input
                    type="number"
                    name="gst"
                    value={productForm.gst}
                    readOnly
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Calculated Price</label>
                  <input
                    type="text"
                    value={`₹${productForm.totalPrice.toFixed(2)}`}
                    readOnly
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  className="cancel-btn"
                  onClick={resetProductForm}
                >
                  Clear
                </button>
                <button 
                  className="save-btn" 
                  onClick={addProductToSale}
                >
                  Add to Cart
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Summary Sidebar */}
      <div className="summary-sidebar">
        <h3>Invoice Summary</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>Invoice Date</label>
            <input
              type="date"
              name="invoiceDate"
              value={summary.invoiceDate}
              onChange={handleDateChange}
            />
          </div>
          <div className="form-group">
            <label>Month</label>
            <select
              name="invoiceMonth"
              value={summary.invoiceMonth}
              onChange={handleMonthChange}
            >
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="summary-details">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₹{summary.subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>GST (3%):</span>
            <span>₹{summary.gstAmount.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Total:</span>
            <span>₹{summary.total.toFixed(2)}</span>
          </div>
          <div className="summary-row discount-row">
            <div className="discount-controls">
              <span>Discount:</span>
              <input
                type="number"
                name="discount"
                value={summary.discount}
                onChange={handleSummaryChange}
                min="0"
                step="0.01"
              />
              <select
                name="discountType"
                value={summary.discountType}
                onChange={handleSummaryChange}
              >
                <option value="percentage">%</option>
                <option value="fixed">₹</option>
              </select>
            </div>
            <span>
              {summary.discountType === 'percentage' 
                ? `${summary.discount}%`
                : `₹${summary.discount}`}
            </span>
          </div>
          <div className="summary-row total-row">
            <span>Final Total:</span>
            <span>₹{summary.finalTotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Amount Paid:</span>
            <input
              type="number"
              name="amountPaid"
              value={summary.amountPaid}
              onChange={handleSummaryChange}
              min="0"
              step="1"
            />
          </div>
          <div className="summary-row">
            <span>Balance Due:</span>
            <span className={summary.balanceDue > 0 ? 'warning' : ''}>
              ₹{summary.balanceDue.toFixed(2)}
            </span>
          </div>
          <div className="form-group">
            <label>Payment Mode:</label>
            <select
              name="paymentMode"
              value={summary.paymentMode}
              onChange={handleSummaryChange}
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>
        </div>

        <div className="action-buttons">
          <button 
            className="invoice-btn" 
            onClick={generateInvoice}
            disabled={cart.length === 0 || !customer.name}
          >
            🖨 Generate Invoice
          </button>
        </div>
      </div>

      {/* Cart Popup Overlay */}
      {showCartPopup && (
        <div className="cart-popup-overlay">
          <div className="cart-popup-content">
            <div className="cart-popup-header">
              <h3>Cart Items ({cart.length})</h3>
              <button 
                className="close-cart-btn"
                onClick={() => setShowCartPopup(false)}
              >
                ×
              </button>
            </div>
            
            <div className="cart-items-container">
              {cart.length === 0 ? (
                <p className="empty-cart-message">Your cart is empty</p>
              ) : (
                <table className="cart-items-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Weight</th>
                      <th>Price</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td>{item.productName}</td>
                        <td>{item.category}</td>
                        <td>{item.weight.toFixed(3)}g</td>
                        <td>₹{item.totalPrice.toFixed(2)}</td>
                        <td>
                          <button 
                            className="remove-item-btn"
                            onClick={() => removeProductFromCart(item.id)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{summary.subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>GST (3%):</span>
                <span>₹{summary.gstAmount.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>₹{summary.total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="cart-popup-actions">
              <button 
                className="continue-shopping-btn"
                onClick={() => setShowCartPopup(false)}
              >
                Continue Shopping
              </button>
              <button 
                className="checkout-btn"
                onClick={() => {
                  setShowCartPopup(false);
                  // Optional: Scroll to invoice section
                }}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartSale;