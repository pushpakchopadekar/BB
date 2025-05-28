import React, { useEffect, useState } from 'react';
import '../Dashboard/Dashboard.css';
import ProductRegistration from '../ProductRegistration/ProductRegistration';
import RegisteredProducts from '../RegisteredProduct/RegisteredProducts';
import StartSale from '../SaleProcess/SaleProcess';
import SalesHistory from '../SalesHistory/SalesHistory';
import SalesOverview from '../SalesOverview/SalesOverview';
// import AvailableStock from '../AvailableStock/AvailableStock';


// Import icons from react-icons library
import { 
  FiHome, FiPackage, FiShoppingCart, FiList, FiDollarSign, FiPieChart,
  FiAlertTriangle, FiUsers, FiLogOut, FiSun, FiMoon, FiEdit, FiFilter,
  FiPrinter, FiTrendingUp, FiAlertCircle, FiClock, FiCalendar, FiFileText,
  FiUser, FiLock, FiCamera, FiCheckCircle, FiXCircle, FiChevronDown
} from 'react-icons/fi';
import { 
  FaRupeeSign, FaCoins, FaGem, FaRing, FaChartLine, 
  FaExclamationTriangle, FaMoneyBillWave, FaBoxes, FaWeightHanging,
  FaPercentage, FaReceipt, FaUserTie, FaSearchDollar, FaFileInvoiceDollar,
  FaChartBar, FaWarehouse, FaKey, FaToggleOn, FaToggleOff
} from 'react-icons/fa';
import AvailableStock from '../AvailableStock/AvailableStock';

const Dashboard = ({ onLogout }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [isAdmin] = useState(true);
  const [editingRates, setEditingRates] = useState(false);
  const [goldRate, setGoldRate] = useState(5830);
  const [silverRate, setSilverRate] = useState(72.50);
  const [tempGoldRate, setTempGoldRate] = useState(goldRate);
  const [tempSilverRate, setTempSilverRate] = useState(silverRate);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString());
  const [showCustomerFilter, setShowCustomerFilter] = useState(false);
  const [filterInvoiceNo, setFilterInvoiceNo] = useState('');
  const [filterCustomerName, setFilterCustomerName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [activeProfileSection, setActiveProfileSection] = useState('userInfo');
  const customersPerPage = 5;

  // Sample user data
  const userData = {
    username: 'admin_jewellery',
    fullName: 'Admin User',
    email: 'admin@jewellerybilling.com',
    avatar: '👤',
    phone: '+91 9876543210',
    address: '123 Jewellery Street, Mumbai, India',
    joinDate: '15 Jan 2022'
  };

  // Sample data
  const dashboardData = {
    todaySales: 125000,
    monthlyRevenue: 1850000,
    pendingPayments: 325000,
    lowStockItems: 8,
    totalItems: 245,
    totalCustomers: 84,
    topCustomers: [
      { name: "Rahul Jain", amount: 450000 },
      { name: "Priya Sharma", amount: 380000 },
      { name: "Vikram Patel", amount: 295000 }
    ],
    customerList: [
      { id: 1001, name: "Rahul Jain", phone: "9876543210", email: "rahul@example.com", totalPurchases: 450000, lastPurchase: "2023-05-15" },
      { id: 1002, name: "Neha Gupta", phone: "8765432109", email: "neha@example.com", totalPurchases: 380000, lastPurchase: "2023-05-15" },
      { id: 1003, name: "Amit Singh", phone: "7654321098", email: "amit@example.com", totalPurchases: 22500, lastPurchase: "2023-05-14" },
      { id: 1004, name: "Priya Sharma", phone: "6543210987", email: "priya@example.com", totalPurchases: 16500, lastPurchase: "2023-05-14" },
      { id: 1005, name: "Vikram Patel", phone: "5432109876", email: "vikram@example.com", totalPurchases: 28500, lastPurchase: "2023-05-13" }
    ],
    salesData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      values: [1200000, 1500000, 1350000, 1700000, 1850000, 0]
    }
  };

  useEffect(() => {
    console.log('Active menu changed to:', activeMenu);
  }, [activeMenu]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMenuClick = (menu) => {
    console.log('Menu clicked:', menu);
    setActiveMenu(menu);
    setCurrentPage(1);
    setShowProfilePanel(false);
  };

  const handleEditRates = () => {
    setEditingRates(true);
    setTempGoldRate(goldRate);
    setTempSilverRate(silverRate);
  };

  const handleSaveRates = () => {
    setGoldRate(tempGoldRate);
    setSilverRate(tempSilverRate);
    setLastUpdated(new Date().toLocaleString());
    setEditingRates(false);
  };

  const handleCancelEdit = () => {
    setEditingRates(false);
  };

  const handleLogoutClick = () => {
    onLogout();
  };

  const toggleCustomerFilter = () => {
    setShowCustomerFilter(!showCustomerFilter);
  };

  const handleFilterApply = () => {
    setCurrentPage(1);
    setShowCustomerFilter(false);
  };

  const handleFilterReset = () => {
    setFilterInvoiceNo('');
    setFilterCustomerName('');
    setCurrentPage(1);
    setShowCustomerFilter(false);
  };

  const toggleProfilePanel = () => {
    setShowProfilePanel(!showProfilePanel);
    if (!showProfilePanel) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setPasswordSuccess('');
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setTimeout(() => {
      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredCustomers = dashboardData.customerList.filter(customer => {
    const matchesInvoice = filterInvoiceNo === '' || customer.id.toString().includes(filterInvoiceNo);
    const matchesName = filterCustomerName === '' || 
      customer.name.toLowerCase().includes(filterCustomerName.toLowerCase());
    return matchesInvoice && matchesName;
  });

  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderActiveComponent = () => {
    switch(activeMenu) {
      case 'Dashboard':
        return (
          <>
            <div className="rates-container">
              <div className="rates-header">
                <h2 className="section-heading">
                  <FaCoins className="section-icon" /> Today's Rates
                </h2>
                {isAdmin && !editingRates && (
                  <button className="edit-rates-btn" onClick={handleEditRates}>
                    <FiEdit /> Edit
                  </button>
                )}
              </div>
              
              {editingRates ? (
                <div className="rates-edit-form">
                  <div className="rate-input-group">
                    <label><FaGem /> Gold Rate (per gram)</label>
                    <div className="input-with-symbol">
                      <span><FaRupeeSign /></span>
                      <input 
                        type="number" 
                        value={tempGoldRate} 
                        onChange={(e) => setTempGoldRate(parseFloat(e.target.value))} 
                      />
                    </div>
                  </div>
                  
                  <div className="rate-input-group">
                    <label><FaRing /> Silver Rate (per gram)</label>
                    <div className="input-with-symbol">
                      <span><FaRupeeSign /></span>
                      <input 
                        type="number" 
                        step="0.01"
                        value={tempSilverRate} 
                        onChange={(e) => setTempSilverRate(parseFloat(e.target.value))} 
                      />
                    </div>
                  </div>
                  
                  <div className="rate-form-actions">
                    <button className="save-rates-btn" onClick={handleSaveRates}>
                      Save Rates
                    </button>
                    <button className="cancel-rates-btn" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rates-display">
                  <div className="rate-card gold-rate">
                    <div className="rate-icon">
                      <FaGem size={28} />
                    </div>
                    <div className="rate-content">
                      <h3>Gold Rate (per gram)</h3>
                      <p className="rate-value"><FaRupeeSign /> {goldRate.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="rate-card silver-rate">
                    <div className="rate-icon">
                      <FaRing size={28} />
                    </div>
                    <div className="rate-content">
                      <h3>Silver Rate (per gram)</h3>
                      <p className="rate-value"><FaRupeeSign /> {silverRate.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="rates-footer">
                    <p><FiClock /> Last updated: {lastUpdated}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="summary-cards">
              <div className="card">
                <div className="card-icon gold-bg">
                  <FaMoneyBillWave size={24} />
                </div>
                <div className="card-content">
                  <h3 className="card-heading">Today's Sales</h3>
                  <p><FaRupeeSign /> {dashboardData.todaySales.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="card">
                <div className="card-icon silver-bg">
                  <FaChartLine size={24} />
                </div>
                <div className="card-content">
                  <h3 className="card-heading">Monthly Revenue</h3>
                  <p><FaRupeeSign /> {dashboardData.monthlyRevenue.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="card">
                <div className="card-icon gold-bg">
                  <FaSearchDollar size={24} />
                </div>
                <div className="card-content">
                  <h3 className="card-heading">Pending Payments</h3>
                  <p><FaRupeeSign /> {dashboardData.pendingPayments.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="card">
                <div className="card-icon silver-bg">
                  <FaExclamationTriangle size={24} />
                </div>
                <div className="card-content">
                  <h3 className="card-heading">Low Stock Items</h3>
                  <p className={dashboardData.lowStockItems > 0 ? 'warning' : ''}>
                    {dashboardData.lowStockItems}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="row">
              <div className="col chart-container">
                <h2 className="section-heading">
                  <FiPieChart className="section-icon" /> Sales Overview
                </h2>
                <div className="sales-chart">
                  <div className="chart-bars">
                    {dashboardData.salesData.values.map((value, index) => (
                      <div key={index} className="chart-bar-container">
                        <div 
                          className="chart-bar" 
                          style={{ height: `${Math.min(100, value / 20000)}%` }}
                          title={`${dashboardData.salesData.labels[index]}: ₹${value.toLocaleString()}`}
                        ></div>
                        <span>{dashboardData.salesData.labels[index]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="col stock-overview">
                <h2 className="section-heading">
                  <FaExclamationTriangle className="section-icon" /> Low-Stock Alerts
                </h2>
                <div className="stock-summary">
                  <div className="stock-metric">
                    <h3 className="metric-heading"><FaBoxes /> Total Items</h3>
                    <p>{dashboardData.totalItems}</p>
                  </div>
                  <div className="stock-metric">
                    <h3 className="metric-heading"><FaExclamationTriangle /> Low Stock</h3>
                    <p className="warning">{dashboardData.lowStockItems}</p>
                  </div>
                  <div className="stock-metric">
                    <h3 className="metric-heading"><FaGem /> Top Sellers</h3>
                    <p>Gold Chains</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="customer-overview">
              <div className="section-header">
                <h2 className="section-heading">
                  <FaUserTie className="section-icon" /> Customer List
                </h2>
                <button className="filter-btn" onClick={toggleCustomerFilter}>
                  <FiFilter /> Filter
                </button>
              </div>
              
              {showCustomerFilter && (
                <div className="filter-popup">
                  <button className="close-filter-btn" onClick={toggleCustomerFilter}>
                    ✕
                  </button>
                  <div className="filter-group">
                    <label>Invoice Number</label>
                    <input 
                      type="text" 
                      placeholder="Search by invoice no."
                      value={filterInvoiceNo}
                      onChange={(e) => setFilterInvoiceNo(e.target.value)}
                    />
                  </div>
                  <div className="filter-group">
                    <label>Customer Name</label>
                    <input 
                      type="text" 
                      placeholder="Search by name"
                      value={filterCustomerName}
                      onChange={(e) => setFilterCustomerName(e.target.value)}
                    />
                  </div>
                  <div className="filter-actions">
                    <button className="apply-btn" onClick={handleFilterApply}>
                      Apply
                    </button>
                    <button className="reset-btn" onClick={handleFilterReset}>
                      Reset
                    </button>
                  </div>
                </div>
              )}
              
              <div className="customer-table-container">
                <table className="customer-table">
                  <thead>
                    <tr>
                      <th>Invoice No</th>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Total Purchases</th>
                      <th>Last Purchase</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCustomers.map((customer) => (
                      <tr key={customer.id}>
                        <td>#{customer.id}</td>
                        <td>{customer.name}</td>
                        <td>{customer.phone}</td>
                        <td>{customer.email}</td>
                        <td><FaRupeeSign /> {customer.totalPurchases.toLocaleString()}</td>
                        <td>{customer.lastPurchase}</td>
                        <td>
                          <button className="view-btn">View</button>
                          <button className="edit-btn">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredCustomers.length === 0 && (
                  <div className="no-results">
                    No customers found matching your criteria.
                  </div>
                )}
              </div>
              
              <div className="pagination">
                <button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button 
                    key={number} 
                    onClick={() => paginate(number)}
                    className={currentPage === number ? 'active' : ''}
                  >
                    {number}
                  </button>
                ))}
                
                <button 
                  onClick={() => paginate(currentPage + 1)} 
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        );
      case 'Product Registration':
        return <ProductRegistration goldRate={goldRate} silverRate={silverRate} />;
      case 'Start Sale':
        return <StartSale goldRate={goldRate} silverRate={silverRate} />;
      case 'Registered Products':
        return <RegisteredProducts />;
      case 'Sales History':
        return <SalesHistory />;
        case 'Available Stock':
          return <AvailableStock/>
      case 'Invoices':
        return (
          <div className="coming-soon">
            <h2><FaFileInvoiceDollar /> Invoices</h2>
            <p>This feature is coming soon!</p>
          </div>
        );
        case 'Sales Overview':
          return <SalesOverview />;
      case 'Stock Alert':
        return <Alert/>
      default:
        return (
          <div className="coming-soon">
            <h2>{activeMenu}</h2>
            <p>This feature is coming soon!</p>
          </div>
        );
    }
  };

  return (
    <div className={`dashboard-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Fixed Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'} fixed-sidebar`}>
        <div className="sidebar-header">
          <h2>Jewellery Billing</h2>
         
        </div>
        
        <ul className="sidebar-menu">
          <li 
            className={activeMenu === 'Dashboard' ? 'active' : ''}
            onClick={() => handleMenuClick('Dashboard')}
          >
            <FiHome className="menu-icon" /> <span> Dashboard</span>
          </li>
          <li 
            className={activeMenu === 'Product Registration' ? 'active' : ''}
            onClick={() => handleMenuClick('Product Registration')}
          >
            <FiPackage className="menu-icon" /> <span> Product Registration</span>
          </li>
          <li 
            className={activeMenu === 'Start Sale' ? 'active' : ''}
            onClick={() => handleMenuClick('Start Sale')}
          >
            <FiShoppingCart className="menu-icon" /> <span> Start Sale</span>
          </li>
          <li 
            className={activeMenu === 'Registered Products' ? 'active' : ''}
            onClick={() => handleMenuClick('Registered Products')}
          >
            <FiList className="menu-icon" /> <span> Registered Products</span>
          </li>
          <li 
            className={activeMenu === 'Sales History' ? 'active' : ''}
            onClick={() => handleMenuClick('Sales History')}
          >
            <FiPrinter className="menu-icon" /> <span> Sales History</span>
          </li>
          <li 
    className={activeMenu === 'Available Stock' ? 'active' : ''}
    onClick={() => handleMenuClick('Available Stock')}
  >
    <FaBoxes className="menu-icon" /> <span> Available Stock</span>
  </li>
        </ul>
        
       
      </div>
      
      {/* Main Content Area */}
      <div className="main-content-wrapper">
        {/* Fixed Header */}
        <header className="main-header fixed-header">
          <h1 className="main-heading">
            {activeMenu === 'Invoices' && <FaFileInvoiceDollar className="header-icon" />}
            {activeMenu === 'Sales Overview' && <FaChartBar className="header-icon" />}
            {activeMenu === 'Stock Alert' && <FaWarehouse className="header-icon" />}
            {activeMenu}
          </h1>
          <div className="header-actions">
            <div className="header-nav">
              <button 
                className={`header-nav-btn ${activeMenu === 'Invoices' ? 'active' : ''}`}
                onClick={() => handleMenuClick('Invoices')}
              >
                <FaFileInvoiceDollar /> Invoices
              </button>
              <button 
                className={`header-nav-btn ${activeMenu === 'Sales Overview' ? 'active' : ''}`}
                onClick={() => handleMenuClick('Sales Overview')}
              >
                <FaChartBar /> Sales Overview
              </button>
              <button 
                className={`header-nav-btn ${activeMenu === 'Stock Alert' ? 'active' : ''}`}
                onClick={() => handleMenuClick('Stock Alert')}
              >
                <FaWarehouse /> Stock Alert
              </button>
            </div>
            <div className="header-right">
              <div className="user-profile" onClick={toggleProfilePanel}>
                <div className="avatar">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="profile-image" />
                  ) : (
                    userData.avatar
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Profile Panel Overlay */}
        {showProfilePanel && (
          <div className="profile-panel-overlay" onClick={toggleProfilePanel}>
            <div className="profile-panel" onClick={e => e.stopPropagation()}>
              <button className="close-profile-panel" onClick={toggleProfilePanel}>
                <FiXCircle />
              </button>
              
              <div className="profile-header">
                <div className="profile-avatar">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="profile-image" />
                  ) : (
                    <div className="default-avatar">{userData.avatar}</div>
                  )}
                  <label className="change-avatar-btn">
                    <FiCamera />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                <h2>{userData.fullName}</h2>
                <p className="user-email">{userData.email}</p>
              </div>
              
              <div className="profile-navigation">
                <button 
                  className={`profile-nav-btn ${activeProfileSection === 'userInfo' ? 'active' : ''}`}
                  onClick={() => setActiveProfileSection('userInfo')}
                >
                  <FiUser /> User Information
                </button>
                <button 
                  className={`profile-nav-btn ${activeProfileSection === 'security' ? 'active' : ''}`}
                  onClick={() => setActiveProfileSection('security')}
                >
                  <FaKey /> Security Settings
                </button>
                <button 
                  className={`profile-nav-btn ${activeProfileSection === 'appearance' ? 'active' : ''}`}
                  onClick={() => setActiveProfileSection('appearance')}
                >
                  <FiSun /> Appearance
                </button>
              </div>
              
              <div className="profile-content">
                {activeProfileSection === 'userInfo' && (
                  <div className="profile-section">
                    <div className="info-item">
                      <span>Username:</span>
                      <span>{userData.username}</span>
                    </div>
                    <div className="info-item">
                      <span>Full Name:</span>
                      <span>{userData.fullName}</span>
                    </div>
                    <div className="info-item">
                      <span>Email:</span>
                      <span>{userData.email}</span>
                    </div>
                    </div>
                    
                )}
                
                {activeProfileSection === 'security' && (
                  <div className="profile-section">
                    <form onSubmit={handlePasswordChange} className="password-form">
                      <h3>Change Password</h3>
                      <div className="form-group">
                        <label><FiLock /> Current Password</label>
                        <input 
                          type="password" 
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                        />
                      </div>
                      <div className="form-group">
                        <label><FiLock /> New Password</label>
                        <input 
                          type="password" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                      </div>
                      <div className="form-group">
                        <label><FiLock /> Confirm Password</label>
                        <input 
                          type="password" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                      </div>
                      {passwordError && <div className="error-message"><FiAlertCircle /> {passwordError}</div>}
                      {passwordSuccess && <div className="success-message"><FiCheckCircle /> {passwordSuccess}</div>}
                      <button type="submit" className="change-password-btn">
                        Change Password
                      </button>
                    </form>
                    
                    <div className="two-factor-auth">
                      <h3>Two-Factor Authentication</h3>
                      <div className="toggle-label">
                        <span>Status:</span>
                        <button 
                          className={`toggle-btn ${twoFactorEnabled ? 'enabled' : 'disabled'}`}
                          onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                        >
                          {twoFactorEnabled ? <FaToggleOn /> : <FaToggleOff />}
                          {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>
                      <p className="toggle-description">
                        Adds an extra layer of security to your account by requiring a verification code when logging in.
                      </p>
                      {twoFactorEnabled && (
                        <div className="two-factor-code">
                          <p>Scan this QR code with your authenticator app:</p>
                          <div className="qr-placeholder"></div>
                          <p>Or enter this code manually: <strong>JBSY-4H2K-9L8M</strong></p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {activeProfileSection === 'appearance' && (
                  <div className="profile-section">
                    <h3>Theme Preferences</h3>
                    <div className="theme-options">
                      <div 
                        className={`theme-option ${!darkMode ? 'active' : ''}`}
                        onClick={() => setDarkMode(false)}
                      >
                        <div className="theme-preview light-theme">
                          <div className="theme-header"></div>
                          <div className="theme-content"></div>
                        </div>
                        <span>Light Mode</span>
                      </div>
                      <div 
                        className={`theme-option ${darkMode ? 'active' : ''}`}
                        onClick={() => setDarkMode(true)}
                      >
                        <div className="theme-preview dark-theme">
                          <div className="theme-header"></div>
                          <div className="theme-content"></div>
                        </div>
                        <span>Dark Mode</span>
                      </div>
                    </div>
                    
                   
                  </div>
                )}
              </div>
              
              <div className="profile-actions">
                <button className="logout-btn" onClick={handleLogoutClick}>
                  <FiLogOut /> Logout
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Scrollable Content Area */}
        <div className="scrollable-content">
          {renderActiveComponent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;