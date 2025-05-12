import React, { useEffect, useState } from 'react';
import '../Dashboard/Dashboard.css';
import ProductRegistration from '../ProductRegistration/ProductRegistration';
import RegisteredProducts from '../RegisteredProduct/RegisteredProducts';
import StartSale from '../SaleProcess/SaleProcess';
import SalesHistory from '../SalesHistory/SalesHistory';

// Import icons from react-icons library
import { 
  FiHome, FiPackage, FiShoppingCart, FiList, FiDollarSign, FiPieChart,
  FiAlertTriangle, FiUsers, FiLogOut, FiSun, FiMoon, FiEdit, FiFilter,
  FiPrinter, FiTrendingUp, FiAlertCircle, FiClock, FiCalendar, FiFileText
} from 'react-icons/fi';
import { 
  FaRupeeSign, FaCoins, FaGem, FaRing, FaChartLine, 
  FaExclamationTriangle, FaMoneyBillWave, FaBoxes, FaWeightHanging,
  FaPercentage, FaReceipt, FaUserTie, FaSearchDollar, FaFileInvoiceDollar,
  FaChartBar, FaWarehouse
} from 'react-icons/fa';

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
  const customersPerPage = 5;

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
      { id: 1005, name: "Vikram Patel", phone: "5432109876", email: "vikram@example.com", totalPurchases: 28500, lastPurchase: "2023-05-13" },
      { id: 1006, name: "Sneha Reddy", phone: "4321098765", email: "sneha@example.com", totalPurchases: 32000, lastPurchase: "2023-05-12" },
      { id: 1007, name: "Arun Kumar", phone: "3210987654", email: "arun@example.com", totalPurchases: 41000, lastPurchase: "2023-05-11" },
      { id: 1008, name: "Meena Desai", phone: "2109876543", email: "meena@example.com", totalPurchases: 28000, lastPurchase: "2023-05-10" },
      { id: 1009, name: "Rajesh Iyer", phone: "1098765432", email: "rajesh@example.com", totalPurchases: 35000, lastPurchase: "2023-05-09" },
      { id: 1010, name: "Anjali Menon", phone: "0987654321", email: "anjali@example.com", totalPurchases: 42000, lastPurchase: "2023-05-08" }
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
    setCurrentPage(1); // Reset to first page when changing menus
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
    setCurrentPage(1); // Reset to first page when applying filters
    setShowCustomerFilter(false);
  };

  const handleFilterReset = () => {
    setFilterInvoiceNo('');
    setFilterCustomerName('');
    setCurrentPage(1);
    setShowCustomerFilter(false);
  };

  // Filter customers based on filter criteria
  const filteredCustomers = dashboardData.customerList.filter(customer => {
    const matchesInvoice = filterInvoiceNo === '' || customer.id.toString().includes(filterInvoiceNo);
    const matchesName = filterCustomerName === '' || 
      customer.name.toLowerCase().includes(filterCustomerName.toLowerCase());
    return matchesInvoice && matchesName;
  });

  // Pagination logic
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderActiveComponent = () => {
    console.log('Rendering:', activeMenu);
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
                      <th>Invoice</th>
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
      case 'Invoices':
        return (
          <div className="coming-soon">
            <h2><FaFileInvoiceDollar /> Invoices</h2>
            <p>This feature is coming soon!</p>
          </div>
        );
      case 'Sales Overview':
        return (
          <div className="coming-soon">
            <h2><FaChartBar /> Sales Overview</h2>
            <p>This feature is coming soon!</p>
          </div>
        );
      case 'Stock Alert':
        return (
          <div className="coming-soon">
            <h2><FaWarehouse /> Stock Alert</h2>
            <p>This feature is coming soon!</p>
          </div>
        );
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
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? '◄' : '►'}
          </button>
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
        </ul>
        <button className="logout-btn" onClick={handleLogoutClick}>
          <FiLogOut /> Logout
        </button>
        
        <div className="sidebar-footer">
          <p>Jewellery Billing v1.0</p>
        </div>
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
              <button className="mode-toggle" onClick={toggleDarkMode}>
                {darkMode ? <FiSun /> : <FiMoon />}
                {darkMode ? ' Light Mode' : ' Dark Mode'}
              </button>
             
              <div className="user-profile">
                <span></span>
                <div className="avatar">👤</div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Scrollable Content Area */}
        <div className="scrollable-content">
          {renderActiveComponent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;