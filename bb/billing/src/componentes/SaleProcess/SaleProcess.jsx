import React, { useState, useEffect, useRef } from 'react';
import '../SaleProcess/SaleProcess.css';

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
    invoiceDate: new Date().toISOString().split('T')[0], // Current date as default
    invoiceMonth: new Date().toLocaleString('default', { month: 'long' }) // Current month as default
  });

  // Product form state
  const [productForm, setProductForm] = useState({
    barcode: '',
    productId: '',
    productName: '',
    metalType: 'Gold',
    purity: '22K',
    weight: '',
    currentRate: goldRate,
    makingCharge: '',
    gst: 3,
    totalPrice: 0
  });
  const barcodeInputRef = useRef(null);

  // Sample product database (in real app, fetch from API)
  const [products] = useState([
    { 
      id: 1, 
      name: "Gold Chain 22K", 
      metalType: "Gold", 
      purity: "22K", 
      weight: 8.5, 
      makingCharge: 15, 
      barcode: "8901234567890",
      image: "https://example.com/gold-chain.jpg"
    },
    { 
      id: 2, 
      name: "Gold Ring 18K", 
      metalType: "Gold", 
      purity: "18K", 
      weight: 3.2, 
      makingCharge: 1200, 
      barcode: "8901234567891",
      image: "https://example.com/gold-ring.jpg"
    },
    { 
      id: 3, 
      name: "Silver Bracelet", 
      metalType: "Silver", 
      purity: "92.5 Sterling Silver", 
      weight: 25, 
      makingCharge: 10, 
      barcode: "8901234567892",
      image: "https://example.com/silver-bracelet.jpg"
    }
  ]);

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
        // Update current rate when metal type changes
        currentRate: name === 'metalType' ? 
          (value === 'Gold' ? goldRate : silverRate) : 
          prev.currentRate
      };
      
      // Recalculate price when relevant fields change
      if (['metalType', 'purity', 'weight', 'currentRate', 'makingCharge'].includes(name)) {
        updatedForm.totalPrice = calculateProductPrice(updatedForm);
      }
      
      return updatedForm;
    });
  };

  const calculateProductPrice = (product) => {
    if (!product.weight || isNaN(product.weight)) return 0;

    // Calculate metal value based on purity
    let ratePerGram = product.currentRate;
    if (product.metalType === 'Gold') {
      if (product.purity === '22K') ratePerGram = product.currentRate * 0.916;
      else if (product.purity === '18K') ratePerGram = product.currentRate * 0.75;
    } else { // Silver
      if (product.purity === '92.5 Sterling Silver') ratePerGram = product.currentRate * 0.925;
    }
    
    const metalValue = product.weight * ratePerGram;

    // Calculate making charges (percentage or fixed)
    let makingCharges = 0;
    if (product.makingCharge && !isNaN(product.makingCharge)) {
      if (product.makingCharge > 100) {
        // Assume it's a fixed amount if making charge is > 100
        makingCharges = parseFloat(product.makingCharge);
      } else {
        // Percentage based making charge
        makingCharges = metalValue * (product.makingCharge / 100);
      }
    }

    // Calculate subtotal
    const subtotal = metalValue + makingCharges;

    // Calculate GST (fixed 3%)
    const gstAmount = subtotal * (product.gst / 100);

    // Calculate final price
    return subtotal + gstAmount;
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    
    // Calculate discount
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
        // Auto-fill the form with product details from inventory
        setProductForm({
          barcode: scannedProduct.barcode,
          productId: scannedProduct.id,
          productName: scannedProduct.name,
          metalType: scannedProduct.metalType,
          purity: scannedProduct.purity,
          weight: scannedProduct.weight,
          currentRate: scannedProduct.metalType === 'Gold' ? goldRate : silverRate,
          makingCharge: scannedProduct.makingCharge,
          gst: 3,
          totalPrice: 0
        });
        
        // Recalculate price after auto-fill
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

    const productInCart = cart.find(item => item.productId === productForm.productId);
    
    if (productInCart) {
      alert('This product is already in the sale!');
      return;
    }

    const productToAdd = {
      id: Date.now(), // Unique ID for the sale item
      productId: productForm.productId,
      barcode: productForm.barcode,
      productName: productForm.productName,
      metalType: productForm.metalType,
      purity: productForm.purity,
      weight: parseFloat(productForm.weight),
      currentRate: parseFloat(productForm.currentRate),
      makingCharge: parseFloat(productForm.makingCharge),
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
      metalType: 'Gold',
      purity: '22K',
      weight: '',
      currentRate: goldRate,
      makingCharge: '',
      gst: 3,
      totalPrice: 0
    });
    
    // Focus back on barcode input after reset
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
      // Update month when date changes
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

    // Prepare invoice data
    const invoiceData = {
      customer: {
        ...customer,
        id: Date.now() // Generate customer ID
      },
      items: cart.map(item => ({
        ...item,
        // Calculate detailed breakdown for each item
        metalValue: calculateMetalValue(item),
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

    // In a real app, you would send this to your backend or print it
    console.log('Invoice Data:', invoiceData);
    alert('Invoice generated successfully!');
    
    // Reset the form for new sale
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
      invoiceDate: new Date().toISOString().split('T')[0], // Reset to current date
      invoiceMonth: new Date().toLocaleString('default', { month: 'long' }) // Reset to current month
    });
    resetProductForm();
  };

  // Helper function to calculate metal value for an item
  const calculateMetalValue = (item) => {
    let ratePerGram = item.currentRate;
    if (item.metalType === 'Gold') {
      if (item.purity === '22K') ratePerGram = item.currentRate * 0.916;
      else if (item.purity === '18K') ratePerGram = item.currentRate * 0.75;
    } else { // Silver
      if (item.purity === '92.5 Sterling Silver') ratePerGram = item.currentRate * 0.925;
    }
    return item.weight * ratePerGram;
  };

  // Helper function to calculate making charges for an item
  const calculateMakingCharges = (item) => {
    const metalValue = calculateMetalValue(item);
    if (item.makingCharge > 100) {
      return parseFloat(item.makingCharge);
    }
    return metalValue * (item.makingCharge / 100);
  };

  // Get list of months for dropdown
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
        
        {/* Products List */}
        <div className="products-list">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>No products added to sale yet. Scan product barcode below.</p>
            </div>
          ) : (
            <table className="product-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Barcode</th>
                  <th>Metal</th>
                  <th>Purity</th>
                  <th>Weight (g)</th>
                  <th>Rate/g</th>
                  <th>Making</th>
                  <th>GST</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.productName}</td>
                    <td>{item.barcode}</td>
                    <td>{item.metalType}</td>
                    <td>{item.purity}</td>
                    <td>{item.weight.toFixed(3)}g</td>
                    <td>₹{item.currentRate.toFixed(2)}</td>
                    <td>
                      {item.makingCharge > 100 
                        ? `₹${item.makingCharge.toFixed(2)}` 
                        : `${item.makingCharge}%`}
                    </td>
                    <td>{item.gst}%</td>
                    <td>₹{item.totalPrice.toFixed(2)}</td>
                    <td>
                      <button 
                        className="remove-btn"
                        onClick={() => removeProductFromCart(item.id)}
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        <div className="product-actions">
          <span className="product-count">{cart.length} items in sale</span>
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
                >
                  🔍 Find Product
                </button>
              </div>
            </div>
          </div>
          
          {/* Show all product fields after scanning */}
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
                  <label>Metal Type</label>
                  <input
                    type="text"
                    name="metalType"
                    value={productForm.metalType}
                    readOnly
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Purity</label>
                  <input
                    type="text"
                    name="purity"
                    value={productForm.purity}
                    readOnly
                  />
                </div>
                
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
              </div>
              
              <div className="form-row">
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
                    {productForm.metalType === 'Gold' ? 
                      `24K Gold Rate: ₹${goldRate.toFixed(2)}/g` : 
                      `99.9% Silver Rate: ₹${silverRate.toFixed(2)}/g`}
                  </small>
                </div>
                
                <div className="form-group">
                  <label>Making Charge*</label>
                  <input
                    type="number"
                    name="makingCharge"
                    value={productForm.makingCharge}
                    onChange={handleProductFormChange}
                    step="0.01"
                    min="0"
                    required
                  />
                  <small>
                    {productForm.makingCharge > 100 ? 
                      "Fixed amount (₹)" : "Percentage (%)"}
                  </small>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>GST (%)</label>
                  <input
                    type="number"
                    name="gst"
                    value={productForm.gst}
                    readOnly
                  />
                </div>
                
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
                  Add to Sale
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Summary Sidebar */}
      <div className="summary-sidebar">
        <h3>Invoice Summary</h3>
        
        {/* Invoice Date and Month Fields */}
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

        {/* Action Buttons */}
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
    </div>
  );
};

export default StartSale;