import React, { useState } from 'react';
import JsBarcode from 'jsbarcode';
import '../ProductRegistration/ProductRegistration.css';

const ProductRegistration = () => {
  const [product, setProduct] = useState({
    name: '',
    category: '',
    weight: '',
    purchasePrice: '',
    sellingPrice: '',
    quantity: 1,
    images: []
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [barcode, setBarcode] = useState('');
  const [barcodeImage, setBarcodeImage] = useState(null);
  const [showBarcode, setShowBarcode] = useState(false);
  const [barcodeGenerated, setBarcodeGenerated] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const categories = ['Gold', 'Silver', 'Emitation'];

  const generateBarcodeNumber = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const date = new Date();
    return `BRC-${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}-${randomNum}`;
  };

  const generateBarcode = () => {
    if (barcodeGenerated) {
      alert('Barcode already generated for this product. Please submit or reset the form.');
      return;
    }

    if (!product.name || !product.category) {
      alert('Please fill in required product information first');
      return;
    }

    const newBarcode = generateBarcodeNumber();
    setBarcode(newBarcode);

    const canvas = document.createElement("canvas");

    try {
      JsBarcode(canvas, newBarcode, {
        format: "CODE128",
        lineColor: "#000",
        width: 2,
        height: 60,
        displayValue: false,
      });

      const imageUrl = canvas.toDataURL("image/png");
      setBarcodeImage(imageUrl);
      setShowBarcode(true);
      setBarcodeGenerated(true);
    } catch (error) {
      console.error("Barcode generation error:", error);
      alert("Failed to generate barcode. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (barcodeGenerated && (name === 'name' || name === 'category')) {
      if (window.confirm('Changing product information will reset the barcode. Continue?')) {
        setBarcode('');
        setBarcodeImage(null);
        setShowBarcode(false);
        setBarcodeGenerated(false);
      } else {
        return;
      }
    }

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
    if (!barcode) {
      alert('Please generate a barcode before submitting');
      return;
    }

    console.log('Product submitted:', {
      ...product,
      barcode
    });

    // Show success popup
    setShowSuccessPopup(true);
    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 3000);

    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setProduct({
      name: '',
      category: '',
      weight: '',
      purchasePrice: '',
      sellingPrice: '',
      quantity: 1,
      images: []
    });
    setPreviewImage(null);
    setBarcodeImage(null);
    setShowBarcode(false);
    setBarcode('');
    setBarcodeGenerated(false);
  };

  const downloadBarcode = () => {
    if (!barcodeImage) return;

    const link = document.createElement('a');
    link.href = barcodeImage;
    link.download = `barcode_${barcode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printBarcode = () => {
    if (!barcodeImage) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcode</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
            .barcode-container { margin: 20px auto; max-width: 300px; }
            .barcode-info { text-align: left; margin-top: 20px; max-width: 250px; }
          </style>
        </head>
        <body>
          <h2>Product Barcode</h2>
          <div class="barcode-container">
            <img src="${barcodeImage}" alt="Barcode" style="max-width:100%;" />
          </div>
          <div class="barcode-info">
            <h3>Product Information</h3>
            <p><strong>Barcode:</strong> ${barcode}</p>
            <p><strong>Name:</strong> ${product.name}</p>
            <p><strong>Category:</strong> ${product.category}</p>
            ${product.category === 'Gold' || product.category === 'Silver' ? 
              `<p><strong>Weight:</strong> ${product.weight} grams</p>` : 
              `<p><strong>Price:</strong> ₹${product.sellingPrice}</p>`}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 200);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="product-registration">
      <h2>Product Registration</h2>

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

          {product.category === 'Gold' || product.category === 'Silver' ? (
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
          ) : (
            <div className="form-row">
              <div className="form-group">
                <label>Purchase Price*</label>
                <input 
                  type="number" 
                  name="purchasePrice" 
                  value={product.purchasePrice}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Selling Price*</label>
                <input 
                  type="number" 
                  name="sellingPrice" 
                  value={product.sellingPrice}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>Inventory Details</h3>
          <div className="form-row">
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

            <div className="form-group">
              <label>Barcode Number</label>
              <input 
                type="text" 
                value={barcode}
                readOnly
                className="read-only"
                placeholder={barcodeGenerated ? "Barcode generated" : "Click 'Generate Barcode' to create"}
              />
            </div>
          </div>
        </div>

        <div className="image-barcode-container">
          <div className="form-section image-section">
            <h3>Product Image</h3>
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

          <div className="form-section barcode-section">
            <h3>Barcode Generation</h3>
            <div className="form-row">
              <div className="form-group">
                <button 
                  type="button" 
                  className="generate-barcode-btn"
                  onClick={generateBarcode}
                  disabled={barcodeGenerated}
                >
                  {barcodeGenerated ? "Barcode Generated" : "Generate Barcode"}
                </button>
              </div>
            </div>

            {showBarcode && (
              <div className="barcode-display-container">
                <div className="barcode-content">
                  <div className="barcode-image-container">
                    <img src={barcodeImage} alt="Barcode" />
                  </div>
                  <div className="barcode-info">
                    <h4>Product Information</h4>
                    <p><strong>Barcode:</strong> {barcode}</p>
                    <p><strong>Name:</strong> {product.name}</p>
                    <p><strong>Category:</strong> {product.category}</p>
                    {product.category === 'Gold' || product.category === 'Silver' ? (
                      <p><strong>Weight:</strong> {product.weight} grams</p>
                    ) : (
                      <p><strong>Price:</strong> ₹{product.sellingPrice}</p>
                    )}
                  </div>
                </div>
                <div className="barcode-actions">
                  <button 
                    type="button" 
                    className="download-barcode-btn"
                    onClick={downloadBarcode}
                  >
                    Download Barcode
                  </button>
                  <button 
                    type="button" 
                    className="print-barcode-btn"
                    onClick={printBarcode}
                  >
                    Print Barcode
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={resetForm}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={!barcodeGenerated}
          >
            Register Product
          </button>
        </div>
      </form>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="success-popup">
          <div className="popup-content">
            <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
              <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
            <p>Product registered successfully!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductRegistration;