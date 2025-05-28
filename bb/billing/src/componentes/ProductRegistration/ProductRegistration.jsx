import React, { useState, useEffect } from 'react';
import JsBarcode from 'jsbarcode';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../ProductRegistration/ProductRegistration.css';
import { database } from '../../firebase';
import { ref, push, set } from 'firebase/database';

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
  const [show3DModal, setShow3DModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['Gold', 'Silver', 'Emitation'];

  const generateBarcodeNumber = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const date = new Date();
    return `BRC-${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}-${randomNum}`;
  };

  const generateBarcode = () => {
    if (barcodeGenerated) {
      toast.warning('Barcode already generated for this product. Please submit or reset the form.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return;
    }

    if (!product.name || !product.category) {
      toast.error('Please fill in required product information first', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
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
      
      toast.success('Barcode generated successfully!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    } catch (error) {
      console.error("Barcode generation error:", error);
      toast.error("Failed to generate barcode. Please try again.", {
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (barcodeGenerated && (name === 'name' || name === 'category')) {
      toast.info('Changing product information will reset the barcode', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      
      setBarcode('');
      setBarcodeImage(null);
      setShowBarcode(false);
      setBarcodeGenerated(false);
    }

    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size exceeds 2MB limit', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
      setProduct(prev => ({
        ...prev,
        images: [...prev.images, reader.result]
      }));
      toast.success('Image uploaded successfully!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!barcode) {
      toast.error('Please generate a barcode before submitting', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create a new product reference with a unique key
      const productsRef = ref(database, 'products');
      const newProductRef = push(productsRef);
      
      // Prepare product data for Firebase
      const productData = {
        id: newProductRef.key,
        name: product.name,
        category: product.category,
        weight: product.weight,
        purchasePrice: product.purchasePrice,
        sellingPrice: product.sellingPrice,
        quantity: product.quantity,
        barcode: barcode,
        barcodeImage: barcodeImage,
        images: product.images,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        stock: product.quantity // Initial stock is the same as quantity
      };

      // Save the product to Firebase
      await set(newProductRef, productData);
      
      toast.success('Product registered successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });

      // Show 3D success modal
      setShow3DModal(true);
      
      // Reset form after delay
      setTimeout(() => {
        resetForm();
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to register product. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      setIsSubmitting(false);
    }
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
    
    toast.info('Form has been reset', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
  };

  const downloadBarcode = () => {
    if (!barcodeImage) return;

    const link = document.createElement('a');
    link.href = barcodeImage;
    link.download = `barcode_${barcode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Barcode downloaded successfully!', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
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
    
    toast.success('Barcode sent to printer!', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
  };

  const close3DModal = () => {
    setShow3DModal(false);
  };

  return (
    <div className="product-registration">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      
      <h2 className="form-title">
        <span className="title-icon">📦</span>
        Product Registration
      </h2>

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-section card-3d">
          <h3 className="section-title">
            <span className="section-icon">ℹ️</span>
            Basic Product Information
          </h3>
          <div className="form-row">
            <div className="form-group floating-label">
              <input 
                type="text" 
                name="name" 
                value={product.name}
                onChange={handleChange}
                required
                className={product.name ? 'has-value' : ''}
              />
              <label>Product Name*</label>
              <span className="highlight"></span>
            </div>

            <div className="form-group floating-label">
              <select 
                name="category" 
                value={product.category}
                onChange={handleChange}
                required
                className={product.category ? 'has-value' : ''}
              >
                <option value=""></option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <label>Category*</label>
              <span className="highlight"></span>
            </div>
          </div>

          {product.category === 'Gold' || product.category === 'Silver' ? (
            <div className="form-group floating-label">
              <input 
                type="number" 
                name="weight" 
                value={product.weight}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                className={product.weight ? 'has-value' : ''}
              />
              <label>Weight (grams)*</label>
              <span className="highlight"></span>
            </div>
          ) : (
            <div className="form-row">
              <div className="form-group floating-label">
                <input 
                  type="number" 
                  name="purchasePrice" 
                  value={product.purchasePrice}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  className={product.purchasePrice ? 'has-value' : ''}
                />
                <label>Purchase Price*</label>
                <span className="highlight"></span>
              </div>
              <div className="form-group floating-label">
                <input 
                  type="number" 
                  name="sellingPrice" 
                  value={product.sellingPrice}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  className={product.sellingPrice ? 'has-value' : ''}
                />
                <label>Selling Price*</label>
                <span className="highlight"></span>
              </div>
            </div>
          )}
        </div>

        <div className="form-section card-3d">
          <h3 className="section-title">
            <span className="section-icon">📊</span>
            Inventory Details
          </h3>
          <div className="form-row">
            <div className="form-group floating-label">
              <input 
                type="number" 
                name="quantity" 
                value={product.quantity}
                onChange={handleChange}
                min="1"
                required
                className={product.quantity ? 'has-value' : ''}
              />
              <label>Quantity*</label>
              <span className="highlight"></span>
            </div>

            <div className="form-group">
              <div className="barcode-input-container">
                <input 
                  type="text" 
                  value={barcode}
                  readOnly
                  className="read-only"
                  placeholder={barcodeGenerated ? "Barcode generated" : "Click 'Generate Barcode' to create"}
                />
                <span className="barcode-icon">✂️</span>
              </div>
            </div>
          </div>
        </div>

        <div className="image-barcode-container">
          <div className="form-section image-section card-3d">
            <h3 className="section-title">
              <span className="section-icon">🖼️</span>
              Product Image
            </h3>
            <div className="image-upload-container">
              <div className="image-preview">
                {previewImage ? (
                  <img src={previewImage} alt="Product preview" className="preview-image" />
                ) : (
                  <div className="placeholder">
                    <div className="placeholder-icon">📷</div>
                    <p>No image selected</p>
                  </div>
                )}
              </div>
              <div className="upload-controls">
                <label className="upload-btn pulse">
                  <span className="upload-icon">⬆️</span>
                  Upload Image
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                <p className="upload-hint">Maximum file size: 2MB</p>
              </div>
            </div>
          </div>

          <div className="form-section barcode-section card-3d">
            <h3 className="section-title">
              <span className="section-icon">🔖</span>
              Barcode Generation
            </h3>
            <div className="form-row">
              <div className="form-group">
                <button 
                  type="button" 
                  className={`generate-barcode-btn ${barcodeGenerated ? 'generated' : ''}`}
                  onClick={generateBarcode}
                  disabled={barcodeGenerated}
                >
                  <span className="btn-icon">{barcodeGenerated ? "✓" : "🔳"}</span>
                  {barcodeGenerated ? "Barcode Generated" : "Generate Barcode"}
                </button>
              </div>
            </div>

            {showBarcode && (
              <div className="barcode-display-container">
                <div className="barcode-content">
                  <div className="barcode-image-container">
                    <img src={barcodeImage} alt="Barcode" className="barcode-image" />
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
                    <span className="btn-icon">⬇️</span>
                    Download
                  </button>
                  <button 
                    type="button" 
                    className="print-barcode-btn"
                    onClick={printBarcode}
                  >
                    <span className="btn-icon">🖨️</span>
                    Print
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
            <span className="btn-icon">❌</span>
            Cancel
          </button>
          <button 
            type="submit" 
            className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
            disabled={!barcodeGenerated || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              <>
                <span className="btn-icon">✅</span>
                Register 
              </>
            )}
          </button>
        </div>
      </form>

      {/* 3D Success Modal */}
      {show3DModal && (
        <div className="modal-3d-container">
          <div className="modal-3d-backdrop" onClick={close3DModal}></div>
          <div className="modal-3d-content">
            <div className="modal-3d-body">
              <div className="success-animation">
                <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                  <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                  <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
                <div className="confetti"></div>
              </div>
              <h3 className="modal-title">Success!</h3>
              <p className="modal-text">Product registered successfully</p>
              <div className="modal-product-info">
                <p><strong>Name:</strong> {product.name}</p>
                <p><strong>Barcode:</strong> {barcode}</p>
              </div>
              <button className="modal-close-btn" onClick={close3DModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductRegistration;