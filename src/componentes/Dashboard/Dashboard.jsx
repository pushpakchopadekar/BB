import React, { useState, useEffect } from 'react';
import '../Dashboard/Dashboard.css';
import ProductRegistration from '../ProductRegistration/ProductRegistration';
import StartSale from '../SaleProcess/SaleProcess';
import RegisteredProducts from '../RegisteredProduct/RegisteredProducts';
import SalesHistory from '../SalesHistory/SalesHistory';

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
    recentTransactions: [
      { id: 1001, customer: "Rahul Jain", date: "2023-05-15", amount: 12500, status: "Paid" },
      { id: 1002, customer: "Neha Gupta", date: "2023-05-15", amount: 18500, status: "Unpaid" },
      { id: 1003, customer: "Amit Singh", date: "2023-05-14", amount: 22500, status: "Paid" },
      { id: 1004, customer: "Priya Sharma", date: "2023-05-14", amount: 16500, status: "Paid" },
      { id: 1005, customer: "Vikram Patel", date: "2023-05-13", amount: 28500, status: "Paid" }
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

  const renderActiveComponent = () => {
    console.log('Rendering:', activeMenu);
    switch(activeMenu) {
      case 'Dashboard':
        return (
          <>
            <div className="rates-container">
              <div className="rates-header">
                <h2 className="section-heading">Today's Rates</h2>
                {isAdmin && !editingRates && (
                  <button className="edit-rates-btn" onClick={handleEditRates}>
                    ✏️ Edit
                  </button>
                )}
              </div>
              
              {editingRates ? (
                <div className="rates-edit-form">
                  <div className="rate-input-group">
                    <label>Gold Rate (per gram)</label>
                    <div className="input-with-symbol">
                      <span>₹</span>
                      <input 
                        type="number" 
                        value={tempGoldRate} 
                        onChange={(e) => setTempGoldRate(parseFloat(e.target.value))} 
                      />
                    </div>
                  </div>
                  
                  <div className="rate-input-group">
                    <label>Silver Rate (per gram)</label>
                    <div className="input-with-symbol">
                      <span>₹</span>
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
                    <div className="rate-icon">📈</div>
                    <div className="rate-content">
                      <h3>Gold Rate (per gram)</h3>
                      <p className="rate-value">₹{goldRate.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="rate-card silver-rate">
                    <div className="rate-icon">🪙</div>
                    <div className="rate-content">
                      <h3>Silver Rate (per gram)</h3>
                      <p className="rate-value">₹{silverRate.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="rates-footer">
                    <p>Last updated: {lastUpdated}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="summary-cards">
              <div className="card">
                <div className="card-icon gold-bg">💰</div>
                <div className="card-content">
                  <h3 className="card-heading">Today's Sales</h3>
                  <p>₹{dashboardData.todaySales.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="card">
                <div className="card-icon silver-bg">📅</div>
                <div className="card-content">
                  <h3 className="card-heading">Monthly Revenue</h3>
                  <p>₹{dashboardData.monthlyRevenue.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="card">
                <div className="card-icon gold-bg">⏳</div>
                <div className="card-content">
                  <h3 className="card-heading">Pending Payments</h3>
                  <p>₹{dashboardData.pendingPayments.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="card">
                <div className="card-icon silver-bg">⚠️</div>
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
                <h2 className="section-heading">Sales Overview</h2>
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
                <h2 className="section-heading">Stock Overview</h2>
                <div className="stock-summary">
                  <div className="stock-metric">
                    <h3 className="metric-heading">Total Items</h3>
                    <p>{dashboardData.totalItems}</p>
                  </div>
                  <div className="stock-metric">
                    <h3 className="metric-heading">Low Stock</h3>
                    <p className="warning">{dashboardData.lowStockItems}</p>
                  </div>
                  <div className="stock-metric">
                    <h3 className="metric-heading">Top Sellers</h3>
                    <p>Gold Chains</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="recent-transactions">
              <h2 className="section-heading">Recent Transactions</h2>
              <table>
                <thead>
                  <tr>
                    <th>Bill No.</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentTransactions.map((txn) => (
                    <tr key={txn.id}>
                      <td>#{txn.id}</td>
                      <td>{txn.customer}</td>
                      <td>{txn.date}</td>
                      <td>₹{txn.amount.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${txn.status.toLowerCase()}`}>
                          {txn.status}
                        </span>
                      </td>
                      <td>
                        <button className="view-btn">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="customer-overview">
              <h2 className="section-heading">Customer Overview</h2>
              <div className="customer-summary">
                <div className="customer-metric">
                  <h3 className="metric-heading">Total Customers</h3>
                  <p>{dashboardData.totalCustomers}</p>
                </div>
                <div className="top-customers">
                  <h3 className="metric-heading">Top Customers</h3>
                  <ul>
                    {dashboardData.topCustomers.map((customer, index) => (
                      <li key={index}>
                        <span>{customer.name}</span>
                        <span>₹{customer.amount.toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
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
            <i className="icon"></i> <span>Dashboard</span>
          </li>
          <li 
            className={activeMenu === 'Product Registration' ? 'active' : ''}
            onClick={() => handleMenuClick('Product Registration')}
          >
            <i className="icon"></i> <span>Product Registration</span>
          </li>
          <li 
            className={activeMenu === 'Start Sale' ? 'active' : ''}
            onClick={() => handleMenuClick('Start Sale')}
          >
            <i className="icon"></i> <span>Start Sale</span>
          </li>
          <li 
            className={activeMenu === 'Registered Products' ? 'active' : ''}
            onClick={() => handleMenuClick('Registered Products')}
          >
            <i className="icon"></i> <span>Registered Products</span>
          </li>
          <li 
            className={activeMenu === 'Sales History' ? 'active' : ''}
            onClick={() => handleMenuClick('Sales History')}
          >
            <i className="icon"></i> <span>Sales History</span>
          </li>
          <li 
            className={activeMenu === 'Available Stock' ? 'active' : ''}
            onClick={() => handleMenuClick('Available Stock')}
          >
            <i className="icon"></i> <span>Available Stock</span>
          </li>
        </ul>
        
        <div className="sidebar-footer">
          <p>Jewellery Billing v1.0</p>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="main-content-wrapper">
        {/* Fixed Header */}
        <header className="main-header fixed-header">
          <h1 className="main-heading">{activeMenu}</h1>
          <div className="header-actions">
            <div className="header-right">
              <button className="mode-toggle" onClick={toggleDarkMode}>
                {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
              <button className="logout-btn" onClick={handleLogoutClick}>
                Logout
              </button>
              <div className="user-profile">
                <span>Admin</span>
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