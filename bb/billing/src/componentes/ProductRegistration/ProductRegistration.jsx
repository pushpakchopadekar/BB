import React, { useState, useEffect } from 'react';
import './ProductRegistration.css';

const ProductRegistration = ({ goldRate, silverRate }) => {
  const [product, setProduct] = useState({
    name: '',
    category: '',
    subCategory: '',
    description: '',
    weight: '',
    metalType: 'Gold',
    purity: '22K',
    hsnCode: '7113',
    baseRate: '',
    makingCharges: '',
    makingType: 'percentage', // 'fixed' or 'percentage'
    wastage: 0,
    gst: 3,
    quantity: 1,
    location: 'Main Store',
    images: []
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [sku, setSku] = useState('');
  const [categories] = useState([
    'Ring', 'Necklace', 'Earrings', 'Bangles', 'Pendant', 'Bracelet', 'Chain', 'Nose Pin', 'Anklet', 'Other'
  ]);

  // Generate SKU on component mount
  useEffect(() => {
    generateSKU();
  }, []);

  // Calculate total price when relevant fields change
  useEffect(() => {
    calculateTotalPrice();
  }, [product.weight, product.metalType, product.purity, product.baseRate, 
      product.makingCharges, product.makingType, product.wastage, product.gst]);

  const generateSKU = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const date = new Date();
    const skuCode = `JWL-${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}-${randomNum}`;
    setSku(skuCode);
  };

  const calculateTotalPrice = () => {
    if (!product.weight || isNaN(product.weight)) return;

    let basePrice = 0;
    
   
    if (product.baseRate && !isNaN(product.baseRate)) {
      basePrice = parseFloat(product.baseRate) * parseFloat(product.weight);
    } else {
      // Auto-calculate based on metal type and purity
      let ratePerGram = 0;
      
      if (product.metalType === 'Gold') {
        if (product.purity === '24K') ratePerGram = goldRate;
        else if (product.purity === '22K') ratePerGram = goldRate * 0.916;
        else if (product.purity === '18K') ratePerGram = goldRate * 0.75;
      } 
      else if (product.metalType === 'Silver') {
        ratePerGram = silverRate;
        if (product.purity === '92.5 Sterling Silver') ratePerGram = silverRate * 0.925;
      }
      
      basePrice = ratePerGram * parseFloat(product.weight);
    }

    // Calculate making charges
    let makingCharges = 0;
    if (product.makingCharges && !isNaN(product.makingCharges)) {
      if (product.makingType === 'percentage') {
        makingCharges = basePrice * (parseFloat(product.makingCharges) / 100);
      } else {
        makingCharges = parseFloat(product.makingCharges);
      }
    }

    // Calculate wastage
    const wastageAmount = basePrice * (parseFloat(product.wastage) / 100 || 0);

    // Calculate subtotal
    const subtotal = basePrice + makingCharges + wastageAmount;

    // Calculate GST
    const gstAmount = subtotal * (parseFloat(product.gst) / 100);

    // Calculate final price
    const finalPrice = subtotal + gstAmount;

    setTotalPrice(finalPrice);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setProduct(prev => ({
          ...prev,
          images: [...prev.images, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Product submitted:', {
      ...product,
      sku,
      totalPrice
    });
    
    // Reset form after submission
    setProduct({
      name: '',
      category: '',
      subCategory: '',
      description: '',
      weight: '',
      metalType: 'Gold',
      purity: '22K',
      hsnCode: '7113',
      baseRate: '',
      makingCharges: '',
      makingType: 'percentage',
      wastage: 0,
      gst: 3,
      quantity: 1,
      location: 'Main Store',
      images: []
    });
    setPreviewImage(null);
    generateSKU();
    alert('Product registered successfully!');
  };

  return (
    <div className="product-registration">
      <h2>Jewellery Product Registration</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Basic Product Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Product Name*</label>
              <input 
                type="text" 
                name="name" 
                value={product.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Category*</label>
              <select 
                name="category" 
                value={product.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Sub-category</label>
              <input 
                type="text" 
                name="subCategory" 
                value={product.subCategory}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea 
                name="description" 
                value={product.description}
                onChange={handleChange}
                rows="2"
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Jewellery Specifications</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Weight (grams)*</label>
              <input 
                type="number" 
                name="weight" 
                value={product.weight}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Metal Type*</label>
              <select 
                name="metalType" 
                value={product.metalType}
                onChange={handleChange}
                required
              >
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Diamond">Diamond</option>
                <option value="Platinum">Platinum</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Purity*</label>
              <select 
                name="purity" 
                value={product.purity}
                onChange={handleChange}
                required
              >
                {product.metalType === 'Gold' && (
                  <>
                    <option value="24K">24K (99.9%)</option>
                    <option value="22K">22K (91.6%)</option>
                    <option value="18K">18K (75%)</option>
                  </>
                )}
                {product.metalType === 'Silver' && (
                  <>
                    <option value="99.9">99.9% Pure Silver</option>
                    <option value="92.5 Sterling Silver">92.5% Sterling Silver</option>
                  </>
                )}
                {(product.metalType === 'Diamond' || product.metalType === 'Platinum') && (
                  <option value="N/A">Not Applicable</option>
                )}
              </select>
            </div>
            
            <div className="form-group">
              <label>HSN Code*</label>
              <input 
                type="text" 
                name="hsnCode" 
                value={product.hsnCode}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Pricing Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Base Rate (per gram)</label>
              <div className="input-with-symbol">
                <span>₹</span>
                <input 
                  type="number" 
                  name="baseRate" 
                  value={product.baseRate}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="Leave empty for auto-calculation"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Making Charges</label>
              <div className="making-charges-group">
                <input 
                  type="number" 
                  name="makingCharges" 
                  value={product.makingCharges}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                />
                <select 
                  name="makingType" 
                  value={product.makingType}
                  onChange={handleChange}
                >
                  <option value="percentage">%</option>
                  <option value="fixed">₹ Fixed</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Wastage (%)</label>
              <input 
                type="number" 
                name="wastage" 
                value={product.wastage}
                onChange={handleChange}
                step="0.01"
                min="0"
                max="10"
              />
            </div>
            
            <div className="form-group">
              <label>GST (%)</label>
              <input 
                type="number" 
                name="gst" 
                value={product.gst}
                onChange={handleChange}
                step="0.01"
                min="0"
                max="28"
              />
            </div>
          </div>
          
          <div className="price-summary">
            <h4>Calculated Price: ₹{totalPrice.toFixed(2)}</h4>
            <p>(Including all charges and GST)</p>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Inventory Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>SKU/Barcode</label>
              <input 
                type="text" 
                value={sku}
                readOnly
                className="read-only"
              />
            </div>
            
            <div className="form-group">
              <label>Quantity*</label>
              <input 
                type="number" 
                name="quantity" 
                value={product.quantity}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Location</label>
            <select 
              name="location" 
              value={product.location}
              onChange={handleChange}
            >
              <option value="Main Store">Main Store</option>
              <option value="Display-1">Display-1</option>
              <option value="Display-2">Display-2</option>
              <option value="Warehouse">Warehouse</option>
            </select>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Product Images</h3>
          <div className="image-upload-container">
            <div className="image-preview">
              {previewImage ? (
                <img src={previewImage} alt="Product preview" />
              ) : (
                <div className="placeholder">No image selected</div>
              )}
            </div>
            <div className="upload-controls">
              <label className="upload-btn">
                Upload Image
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </label>
              <p>Maximum file size: 2MB</p>
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="button" className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            Register Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductRegistration;