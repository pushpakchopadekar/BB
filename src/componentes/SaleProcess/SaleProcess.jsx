import React, { useState, useEffect } from 'react';
import '../SaleProcess/SaleProcess.css';

const StartSale = ({ goldRate, silverRate }) => {
  // Customer state
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    gstin: '',
    isNew: false
  });

  // Product cart state
  const [cart, setCart] = useState([
    {
      id: 1,
      productName: '',
      metalType: 'Gold',
      purity: '22K',
      weight: '',
      ratePerGram: goldRate * 0.916, // Default 22K gold rate
      makingCharge: '',
      makingType: 'percentage',
      gst: 3,
      quantity: 1,
      totalPrice: 0
    }
  ]);

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
    paymentMode: 'Cash'
  });

  // Sample product database (in real app, fetch from API)
  const [products] = useState([
    { id: 1, name: "Gold Chain 22K", metalType: "Gold", purity: "22K", weight: 8.5, makingCharge: 15, makingType: "percentage" },
    { id: 2, name: "Gold Ring 18K", metalType: "Gold", purity: "18K", weight: 3.2, makingCharge: 1200, makingType: "fixed" },
    { id: 3, name: "Silver Bracelet", metalType: "Silver", purity: "92.5 Sterling Silver", weight: 25, makingCharge: 10, makingType: "percentage" }
  ]);

  // Calculate totals whenever cart changes
  useEffect(() => {
    calculateTotals();
  }, [cart, summary.discount, summary.discountType, summary.amountPaid]);

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  const handleProductChange = (id, field, value) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate price if dependent fields change
        if (['metalType', 'purity', 'weight', 'ratePerGram', 'makingCharge', 'makingType', 'gst', 'quantity'].includes(field)) {
          updatedItem.totalPrice = calculateItemPrice(updatedItem);
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateItemPrice = (item) => {
    if (!item.weight || isNaN(item.weight)) return 0;

    // Calculate metal value
    const metalValue = item.weight * item.ratePerGram;

    // Calculate making charges
    let makingCharges = 0;
    if (item.makingCharge && !isNaN(item.makingCharge)) {
      makingCharges = item.makingType === 'percentage' 
        ? metalValue * (item.makingCharge / 100)
        : parseFloat(item.makingCharge);
    }

    // Calculate subtotal
    const subtotal = metalValue + makingCharges;

    // Calculate GST
    const gstAmount = subtotal * (item.gst / 100);

    // Calculate final price
    const finalPrice = subtotal + gstAmount;

    return finalPrice * item.quantity;
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    
    // Calculate discount
    const discountAmount = summary.discountType === 'percentage'
      ? subtotal * (summary.discount / 100)
      : parseFloat(summary.discount);

    const gstAmount = subtotal * 0.03; // Assuming 3% GST
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

  const addProductRow = () => {
    const newId = cart.length > 0 ? Math.max(...cart.map(item => item.id)) + 1 : 1;
    setCart(prev => [
      ...prev,
      {
        id: newId,
        productName: '',
        metalType: 'Gold',
        purity: '22K',
        weight: '',
        ratePerGram: goldRate * 0.916,
        makingCharge: '',
        makingType: 'percentage',
        gst: 3,
        quantity: 1,
        totalPrice: 0
      }
    ]);
  };

  const removeProductRow = (id) => {
    if (cart.length > 1) {
      setCart(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleSummaryChange = (field, value) => {
    setSummary(prev => ({ ...prev, [field]: value }));
  };

  const handleProductSelect = (id, productName) => {
    const selectedProduct = products.find(p => p.name === productName);
    if (selectedProduct) {
      setCart(prev => prev.map(item => {
        if (item.id === id) {
          const ratePerGram = selectedProduct.metalType === 'Gold'
            ? selectedProduct.purity === '24K' ? goldRate
              : selectedProduct.purity === '22K' ? goldRate * 0.916
              : goldRate * 0.75
            : silverRate * 0.925;
          
          const updatedItem = {
            ...item,
            productName: selectedProduct.name,
            metalType: selectedProduct.metalType,
            purity: selectedProduct.purity,
            weight: selectedProduct.weight,
            ratePerGram,
            makingCharge: selectedProduct.makingCharge,
            makingType: selectedProduct.makingType
          };
          
          updatedItem.totalPrice = calculateItemPrice(updatedItem);
          return updatedItem;
        }
        return item;
      }));
    }
  };

  const generateInvoice = () => {
    // In a real app, this would generate PDF or send to printer
    const invoiceData = {
      customer,
      items: cart,
      summary,
      date: new Date().toLocaleString(),
      invoiceNumber: `INV-${Date.now()}`
    };
    console.log('Invoice generated:', invoiceData);
    alert('Invoice generated successfully!');
  };

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
            <label>GSTIN</label>
            <input
              type="text"
              name="gstin"
              value={customer.gstin}
              onChange={handleCustomerChange}
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={customer.isNew}
                onChange={() => setCustomer(prev => ({ ...prev, isNew: !prev.isNew }))}
              />
              New Customer
            </label>
          </div>
        </div>
      </div>

      {/* Product Selection Table */}
      <div className="product-section">
        <h3>Products</h3>
        <table className="product-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Metal</th>
              <th>Purity</th>
              <th>Weight (g)</th>
              <th>Rate/g</th>
              <th>Making</th>
              <th>GST %</th>
              <th>Qty</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {cart.map(item => (
              <tr key={item.id}>
                <td>
                  <select
                    value={item.productName}
                    onChange={(e) => {
                      handleProductSelect(item.id, e.target.value);
                      handleProductChange(item.id, 'productName', e.target.value);
                    }}
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.name}>{product.name}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={item.metalType}
                    onChange={(e) => handleProductChange(item.id, 'metalType', e.target.value)}
                  >
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                  </select>
                </td>
                <td>
                  <select
                    value={item.purity}
                    onChange={(e) => handleProductChange(item.id, 'purity', e.target.value)}
                  >
                    {item.metalType === 'Gold' ? (
                      <>
                        <option value="24K">24K</option>
                        <option value="22K">22K</option>
                        <option value="18K">18K</option>
                      </>
                    ) : (
                      <>
                        <option value="99.9">99.9%</option>
                        <option value="92.5 Sterling Silver">92.5%</option>
                      </>
                    )}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    value={item.weight}
                    onChange={(e) => handleProductChange(item.id, 'weight', e.target.value)}
                    step="0.01"
                    min="0"
                  />
                </td>
                <td>
                  ₹{item.ratePerGram.toFixed(2)}
                </td>
                <td>
                  <div className="making-charge-group">
                    <input
                      type="number"
                      value={item.makingCharge}
                      onChange={(e) => handleProductChange(item.id, 'makingCharge', e.target.value)}
                      step="0.01"
                      min="0"
                    />
                    <select
                      value={item.makingType}
                      onChange={(e) => handleProductChange(item.id, 'makingType', e.target.value)}
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">₹</option>
                    </select>
                  </div>
                </td>
                <td>
                  <input
                    type="number"
                    value={item.gst}
                    onChange={(e) => handleProductChange(item.id, 'gst', e.target.value)}
                    min="0"
                    max="28"
                    step="0.1"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleProductChange(item.id, 'quantity', e.target.value)}
                    min="1"
                  />
                </td>
                <td>₹{item.totalPrice.toFixed(2)}</td>
                <td>
                  {cart.length > 1 && (
                    <button 
                      className="remove-btn"
                      onClick={() => removeProductRow(item.id)}
                    >
                      🗑️
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="add-product-btn" onClick={addProductRow}>
          ➕ Add Another Product
        </button>
      </div>

      {/* Summary Sidebar */}
      <div className="summary-sidebar">
        <h3>Invoice Summary</h3>
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
                value={summary.discount}
                onChange={(e) => handleSummaryChange('discount', e.target.value)}
                min="0"
                step="0.01"
              />
              <select
                value={summary.discountType}
                onChange={(e) => handleSummaryChange('discountType', e.target.value)}
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
              value={summary.amountPaid}
              onChange={(e) => handleSummaryChange('amountPaid', e.target.value)}
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
              value={summary.paymentMode}
              onChange={(e) => handleSummaryChange('paymentMode', e.target.value)}
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
          <button className="invoice-btn" onClick={generateInvoice}>
            🖨️ Generate Invoice
          </button>
          <button className="whatsapp-btn">
            📤 Send to WhatsApp
          </button>
          <button className="save-btn">
            💾 Save & Print
          </button>
          <button className="new-sale-btn">
            🔁 New Sale
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartSale;