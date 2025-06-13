import React, { useState, useEffect, useRef } from 'react';
import '../SaleProcess/SaleProcess.css';
import { database } from '../../firebase';
import { ref, onValue, off, push, set, update, runTransaction } from 'firebase/database';

const StartSale = ({ goldRate, silverRate }) => {
  // Load saved cart from localStorage or initialize empty
  const savedCart = JSON.parse(localStorage.getItem('currentSaleCart')) || [];
  const savedCustomer = JSON.parse(localStorage.getItem('currentSaleCustomer')) || {
    name: '',
    phone: '',
    address: '',
    email: '',
    isNew: false
  };
  const savedStep = parseInt(localStorage.getItem('currentSaleStep')) || 1;

  // State management
  const [customer, setCustomer] = useState(savedCustomer);
  const [cart, setCart] = useState(savedCart);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [activeStep, setActiveStep] = useState(savedStep);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [lastInvoiceNumber, setLastInvoiceNumber] = useState(0);
  const [saveError, setSaveError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

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
    invoiceMonth: new Date().toLocaleString('default', { month: 'long' }),
    invoiceNumber: ''
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
    sellingPrice: '',
    gst: 3,
    totalPrice: 0
  });

  const barcodeInputRef = useRef(null);

  // Save cart, customer, and step to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('currentSaleCart', JSON.stringify(cart));
    localStorage.setItem('currentSaleCustomer', JSON.stringify(customer));
    localStorage.setItem('currentSaleStep', activeStep.toString());
  }, [cart, customer, activeStep]);

  // Fetch products and last invoice number from Firebase
  useEffect(() => {
    const productsRef = ref(database, 'products');
    const invoiceCounterRef = ref(database, 'invoiceCounter');
    
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

    // Fetch last invoice number
    onValue(invoiceCounterRef, (snapshot) => {
      const counter = snapshot.val();
      if (counter) {
        setLastInvoiceNumber(counter.lastNumber || 0);
        setSummary(prev => ({
          ...prev,
          invoiceNumber: generateInvoiceNumber(counter.lastNumber + 1)
        }));
      } else {
        // Initialize counter if it doesn't exist
        set(invoiceCounterRef, { lastNumber: 1000 }); // Starting from 1000 for 4-digit numbers
        setSummary(prev => ({
          ...prev,
          invoiceNumber: generateInvoiceNumber(1001) // First invoice will be 1001
        }));
      }
    }, (error) => {
      console.error('Error fetching invoice counter:', error);
      setSummary(prev => ({
        ...prev,
        invoiceNumber: generateInvoiceNumber(1001) // Fallback to 1001 if error
      }));
    });

    fetchProducts();

    return () => {
      off(productsRef);
      off(invoiceCounterRef);
    };
  }, []);

  // Helper functions
  const generateInvoiceNumber = (number) => {
    return number.toString().padStart(4, '0'); // Changed to 4-digit format
  };

  const calculateProductPrice = (product) => {
    if (product.category === 'Gold' || product.category === 'Silver') {
      if (!product.weight || isNaN(product.weight)) return 0;
      
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
      // For imitation products, use sellingPrice directly
      if (!product.sellingPrice || isNaN(product.sellingPrice)) return 0;
      const price = parseFloat(product.sellingPrice);
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

  const calculateMakingCharges = (item) => {
    if (item.category !== 'Gold' && item.category !== 'Silver') return 0;
    
    if (item.makingChargeType === 'fixed') {
      return parseFloat(item.makingCharge);
    }
    
    const metalValue = item.weight * item.currentRate;
    return metalValue * (item.makingCharge / 100);
  };

  // Event handlers
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
      
      if (['category', 'weight', 'currentRate', 'makingCharge', 'makingChargeType', 'sellingPrice'].includes(name)) {
        updatedForm.totalPrice = calculateProductPrice(updatedForm);
      }
      
      return updatedForm;
    });
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

  const handleBarcodeScan = () => {
    if (productForm.barcode) {
      const scannedProduct = products.find(p => p.barcode === productForm.barcode);
      
      if (scannedProduct) {
        const isImitation = scannedProduct.category === 'Imitation';
        
        setProductForm({
          barcode: scannedProduct.barcode,
          productId: scannedProduct.id,
          productName: scannedProduct.name,
          category: scannedProduct.category || 'Gold',
          weight: isImitation ? '' : scannedProduct.weight,
          currentRate: scannedProduct.category === 'Gold' ? goldRate : 
                      scannedProduct.category === 'Silver' ? silverRate : 0,
          makingCharge: isImitation ? '' : (scannedProduct.makingCharge || ''),
          makingChargeType: isImitation ? 'percentage' : (scannedProduct.makingChargeType || 'percentage'),
          sellingPrice: isImitation ? (scannedProduct.sellingPrice || '') : '',
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

  // Cart operations
  const addProductToSale = () => {
    if (!productForm.barcode || !productForm.productId) {
      alert('Please scan a valid product barcode!');
      return;
    }

    if (productForm.category === 'Gold' || productForm.category === 'Silver') {
      if (!productForm.weight || isNaN(productForm.weight)) {
        alert('Please enter a valid weight!');
        return;
      }

      if (!productForm.makingCharge || isNaN(productForm.makingCharge)) {
        alert('Please enter valid making charges!');
        return;
      }
    } else {
      if (!productForm.sellingPrice || isNaN(productForm.sellingPrice)) {
        alert('Please enter valid selling price!');
        return;
      }
    }

    const productToAdd = {
      id: Date.now(),
      productId: productForm.productId,
      barcode: productForm.barcode,
      productName: productForm.productName,
      category: productForm.category,
      weight: productForm.category === 'Gold' || productForm.category === 'Silver' ? 
              parseFloat(productForm.weight) : 0,
      currentRate: parseFloat(productForm.currentRate),
      makingCharge: productForm.category === 'Gold' || productForm.category === 'Silver' ? 
                   parseFloat(productForm.makingCharge) : 0,
      makingChargeType: productForm.makingChargeType,
      sellingPrice: productForm.category === 'Imitation' ? parseFloat(productForm.sellingPrice) : 0,
      gst: productForm.gst,
      totalPrice: parseFloat(productForm.totalPrice.toFixed(2)),
      image: products.find(p => p.id === productForm.productId)?.image || ''
    };

    setCart(prev => [...prev, productToAdd]);
    resetProductForm();
  };

  const removeProductFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
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
      sellingPrice: '',
      gst: 3,
      totalPrice: 0
    });
    
    if (barcodeInputRef.current && activeStep === 1) {
      barcodeInputRef.current.focus();
    }
  };

  // Sale process functions
  const proceedToBilling = () => {
    if (cart.length === 0) {
      alert('Please add at least one product to proceed!');
      return;
    }

    if (!customer.name) {
      alert('Please enter customer name!');
      return;
    }

    setActiveStep(2);
  };

  const updateInventoryQuantities = async () => {
    const updates = {};
    
    cart.forEach(item => {
      if (!item.productId) return;
      
      const productRef = `products/${item.productId}`;
      updates[`${productRef}/quantity`] = (prev) => {
        const currentQty = prev || 0;
        if (currentQty < 1) {
          throw new Error(`Insufficient stock for ${item.productName}`);
        }
        return currentQty - 1;
      };
      
      // Mark product as sold if quantity reaches 0
      updates[`${productRef}/status`] = (prev) => {
        const currentQty = prev?.quantity || 0;
        return currentQty - 1 <= 0 ? 'Sold Out' : prev?.status || 'Available';
      };
    });

    await update(ref(database), updates);
  };

  const saveInvoiceToHistory = async (invoiceData) => {
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Validate invoice data more thoroughly
      if (!invoiceData.customer?.name) {
        throw new Error('Customer name is required');
      }
      if (!invoiceData.items || invoiceData.items.length === 0) {
        throw new Error('At least one product is required');
      }

      const invoiceCounterRef = ref(database, 'invoiceCounter');
      const newInvoiceNumber = lastInvoiceNumber + 1;

      // Step 1: Update invoice counter
      await runTransaction(invoiceCounterRef, (counter) => {
        if (!counter) {
          counter = { lastNumber: 1000 }; // Initialize with 1000 if not exists
        }
        counter.lastNumber = newInvoiceNumber;
        return counter;
      });

      // Step 2: Save invoice
      const invoicesRef = ref(database, 'sales');
      const newInvoiceRef = push(invoicesRef);
      
      const invoiceWithId = {
        ...invoiceData,
        id: newInvoiceRef.key,
        invoiceNumber: generateInvoiceNumber(newInvoiceNumber),
        timestamp: Date.now()
      };

      await set(newInvoiceRef, invoiceWithId);

      // Step 3: Update inventory quantities
      await updateInventoryQuantities();

      // Success - update local state
      setLastInvoiceNumber(newInvoiceNumber);
      setShowInvoicePreview(true);
      clearLocalStorage();
      
      return true;
    } catch (error) {
      console.error('Invoice save error:', error);
      setSaveError(error.message || 'Failed to save invoice. Please check console for details.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('currentSaleCart');
    localStorage.removeItem('currentSaleCustomer');
    localStorage.removeItem('currentSaleStep');
  };

  const generateInvoice = async () => {
    if (summary.balanceDue > 0 && 
        !window.confirm('Balance due exists. Proceed anyway?')) {
      return;
    }

    const invoiceData = {
      customer: {
        ...customer,
        id: `cust_${Date.now()}`
      },
      items: cart.map(item => ({
        productId: item.productId,
        name: item.productName,
        category: item.category,
        weight: item.weight,
        rate: item.currentRate,
        makingCharge: item.makingCharge,
        makingChargeType: item.makingChargeType,
        gstRate: item.gst,
        price: item.totalPrice
      })),
      payment: {
        subtotal: summary.subtotal,
        gst: summary.gstAmount,
        discount: summary.discountType === 'percentage' ? 
          `${summary.discount}%` : `₹${summary.discount}`,
        total: summary.total,
        amountPaid: summary.amountPaid,
        balanceDue: summary.balanceDue,
        mode: summary.paymentMode
      },
      metadata: {
        date: summary.invoiceDate,
        month: summary.invoiceMonth,
        status: summary.balanceDue > 0 ? 'Pending' : 'Paid'
      }
    };

    const success = await saveInvoiceToHistory(invoiceData);
    
    if (!success) {
      alert(`Invoice failed: ${saveError}`);
    }
  };

  const completeSale = () => {
    // Reset the entire sale process
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
      invoiceMonth: new Date().toLocaleString('default', { month: 'long' }),
      invoiceNumber: generateInvoiceNumber(lastInvoiceNumber + 2) // Skip the one we just used
    });
    resetProductForm();
    setActiveStep(1);
    setShowInvoicePreview(false);
    setSaveError(null);
  };

  const clearCurrentSale = () => {
    if (window.confirm('Are you sure you want to clear the current sale? All unsaved data will be lost.')) {
      setCustomer({
        name: '',
        phone: '',
        address: '',
        email: '',
        isNew: false
      });
      setCart([]);
      setActiveStep(1);
      // Also clear from localStorage
      localStorage.removeItem('currentSaleCart');
      localStorage.removeItem('currentSaleCustomer');
      localStorage.removeItem('currentSaleStep');
      setSaveError(null);
    }
  };

  // Calculate totals whenever cart changes
  useEffect(() => {
    calculateTotals();
  }, [cart, summary.discount, summary.discountType, summary.amountPaid]);

  // Focus barcode input on component mount and when returning to step 1
  useEffect(() => {
    if (barcodeInputRef.current && activeStep === 1) {
      barcodeInputRef.current.focus();
    }
  }, [activeStep]);

  return (
    <div className="start-sale-container">
      {/* Stepper */}
      <div className="sale-stepper">
        <div className={`step ${activeStep === 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-title">Add Products</div>
        </div>
        <div className="step-connector"></div>
        <div className={`step ${activeStep === 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-title">Billing & Invoice</div>
        </div>
      </div>

      {/* Clear Sale Button */}
      {(cart.length > 0 || customer.name) && (
        <button 
          className="clear-sale-btn"
          onClick={clearCurrentSale}
        >
          🗑 Clear Current Sale
        </button>
      )}

      {/* Error Message */}
      {saveError && (
        <div className="error-message">
          {saveError}
        </div>
      )}

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

      {/* Product Section - Step 1 */}
      {activeStep === 1 && (
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
                    <input
                      type="text"
                      name="category"
                      value={productForm.category}
                      readOnly
                    />
                  </div>
                </div>
                
                {productForm.category === 'Gold' || productForm.category === 'Silver' ? (
                  <>
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
                        <label>Current Rate (₹/g)*</label>
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
                            `Silver Rate: ₹${silverRate.toFixed(2)}/g`}
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
                  </>
                ) : (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Selling Price*</label>
                      <input
                        type="number"
                        name="sellingPrice"
                        value={productForm.sellingPrice}
                        onChange={handleProductFormChange}
                        step="0.01"
                        min="0"
                        required
                      />
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
                )}
                
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
          
          {/* Proceed to Billing Button */}
          {cart.length > 0 && (
            <div className="proceed-to-billing">
              <button 
                className="proceed-btn"
                onClick={proceedToBilling}
              >
                Proceed to Billing &rarr;
              </button>
            </div>
          )}
        </div>
      )}

      {/* Billing Section - Step 2 */}
      {activeStep === 2 && (
        <div className="billing-section">
          <div className="billing-header">
            <h3>Billing & Invoice</h3>
            <button 
              className="back-to-products"
              onClick={() => setActiveStep(1)}
            >
              &larr; Back to Products
            </button>
          </div>
          
          <div className="billing-content">
            {/* Customer Summary */}
            <div className="customer-summary">
              <h4>Customer Information</h4>
              <div className="customer-details">
                <p><strong>Name:</strong> {customer.name}</p>
                {customer.phone && <p><strong>Phone:</strong> {customer.phone}</p>}
                {customer.address && <p><strong>Address:</strong> {customer.address}</p>}
              </div>
            </div>
            
            {/* Products Summary */}
            <div className="products-summary">
              <h4>Products ({cart.length})</h4>
              <table className="products-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>{productForm.category === 'Gold' || productForm.category === 'Silver' ? 'Weight' : 'Price'}</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.productName}</td>
                      <td>{item.category}</td>
                      <td>
                        {item.category === 'Gold' || item.category === 'Silver' ? 
                          `${item.weight.toFixed(3)}g` : 
                          `₹${item.sellingPrice.toFixed(2)}`}
                      </td>
                      <td>₹{item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Invoice Summary */}
            <div className="invoice-summary">
              <h4>Invoice Summary</h4>
              <div className="summary-details">
                <div className="summary-row">
                  <span>Invoice Number:</span>
                  <span>{generateInvoiceNumber(lastInvoiceNumber + 1)}</span>
                </div>
                <div className="summary-row">
                  <span>Invoice Date:</span>
                  <span>{new Date(summary.invoiceDate).toLocaleDateString()}</span>
                </div>
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
              
              <div className="invoice-actions">
                <button 
                  className="print-invoice-btn"
                  onClick={generateInvoice}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="loading-spinner"></span> Saving...
                    </>
                  ) : (
                    '🖨 Generate Invoice'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                      <th>{productForm.category === 'Gold' || productForm.category === 'Silver' ? 'Weight' : 'Price'}</th>
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
                        <td>
                          {item.category === 'Gold' || item.category === 'Silver' ? 
                            `${item.weight.toFixed(3)}g` : 
                            `₹${item.sellingPrice.toFixed(2)}`}
                        </td>
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
                  proceedToBilling();
                }}
                disabled={cart.length === 0}
              >
                Proceed to Billing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Preview */}
      {showInvoicePreview && (
        <div className="invoice-preview-overlay">
          <div className="invoice-preview-content">
            <div className="invoice-preview-header">
              <h3>Invoice Preview</h3>
              <button 
                className="close-invoice-btn"
                onClick={() => setShowInvoicePreview(false)}
              >
                ×
              </button>
            </div>
            
            <div className="invoice-preview-container">
              <div className="tax-invoice">
                <h1>TAX INVOICE (SALE)</h1>
                <h2>SETIN : ZZKHIPOTONE120</h2>
                
                <div className="invoice-meta">
                  <h3>1.1: 40 without mini 11</h3>
                  <h3>2.1: 30% USERBIG SARK (KRUID)</h3>
                </div>
                
                <table className="invoice-header-table">
                  <tbody>
                    <tr>
                      <td>Invoice No.</td>
                      <td>{generateInvoiceNumber(lastInvoiceNumber + 1)}</td>
                      <td>1st week's week, version, fix, months, $2</td>
                      <td>202380</td>
                      <td>244309</td>
                    </tr>
                    <tr>
                      <td>No</td>
                      <td>15th month</td>
                      <td>12th day</td>
                      <td>4th day</td>
                      <td>6th day</td>
                    </tr>
                    <tr>
                      <td>No</td>
                      <td>0/33/03</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
                
                <hr className="invoice-divider" />
                
                <div className="invoice-particulars">
                  <h3>Particulars</h3>
                  <table className="particulars-table">
                    <thead>
                      <tr>
                        <th>HSN Code</th>
                        <th>Gross Weight</th>
                        <th>Net Weight</th>
                        <th>Rate (Per gm)</th>
                        <th>Making</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item, index) => (
                        <tr key={item.id}>
                          <td>-</td>
                          <td>{item.category === 'Gold' || item.category === 'Silver' ? `${item.weight.toFixed(3)}g` : '-'}</td>
                          <td>{item.category === 'Gold' || item.category === 'Silver' ? `${item.weight.toFixed(3)}g` : '-'}</td>
                          <td>{item.category === 'Gold' || item.category === 'Silver' ? `₹${item.currentRate.toFixed(2)}` : '-'}</td>
                          <td>
                            {item.category === 'Gold' || item.category === 'Silver' ? 
                              (item.makingChargeType === 'percentage' 
                                ? `${item.makingCharge}%` 
                                : `₹${item.makingCharge}`)
                              : '-'}
                          </td>
                          <td>₹{item.totalPrice.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <hr className="invoice-divider" />
                
                <div className="invoice-gain-cost">
                  <h3>Gain and cost</h3>
                  <div className="gain-cost-grid">
                    <div className="gain-cost-row">
                      <span>Gross Amount</span>
                      <span>₹{summary.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="gain-cost-row">
                      <span>Add SGST 1.5%</span>
                      <span>₹{(summary.gstAmount / 2).toFixed(2)}</span>
                    </div>
                    <div className="gain-cost-row">
                      <span>Add CGST 1.5%</span>
                      <span>₹{(summary.gstAmount / 2).toFixed(2)}</span>
                    </div>
                    <div className="gain-cost-row">
                      <span>Total Amount</span>
                      <span>₹{summary.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <hr className="invoice-divider" />
                
                <div className="invoice-bank-details">
                  <h3>Payment Details</h3>
                  <div className="bank-details-grid">
                    <div className="bank-detail-row">
                      <span>Payment Mode: {summary.paymentMode}</span>
                      <span>Amount Paid: ₹{summary.amountPaid.toFixed(2)}</span>
                    </div>
                    <div className="bank-detail-row">
                      <span>Balance Due: ₹{summary.balanceDue.toFixed(2)}</span>
                      <span>Invoice Date: {new Date(summary.invoiceDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <hr className="invoice-divider" />
                
                <div className="invoice-footer">
                  <p>Thank you for your business!</p>
                  <p>For any queries, please contact us at: {customer.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="invoice-preview-actions">
              <button 
                className="print-invoice-btn"
                onClick={() => window.print()}
              >
                🖨 Print Invoice
              </button>
              <button 
                className="complete-sale-btn"
                onClick={completeSale}
              >
                Complete Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartSale;