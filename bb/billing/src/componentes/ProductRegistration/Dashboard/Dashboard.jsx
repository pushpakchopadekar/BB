import React, { useEffect, useState } from 'react';
import '../Dashboard/Dashboard.css';
import ProductRegistration from '../ProductRegistration/ProductRegistration';
import RegisteredProducts from '../RegisteredProduct/RegisteredProducts';
import StartSale from '../SaleProcess/SaleProcess';
import SalesHistory from '../SalesHistory/SalesHistory';
import SalesOverview from '../SalesOverview/SalesOverview';
import AvailableStock from '../AvailableStock/AvailableStock';
import StockAlert from '../StockAlert/StockAlert';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement } from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
);

// Import icons from lucide-react
import { 
  Home, Package, ShoppingCart, List, DollarSign, PieChart,
  AlertTriangle, Users, LogOut, Sun, Moon, Edit, Filter,
  Printer, TrendingUp, AlertCircle, Clock, Calendar, FileText,
  User, Lock, Camera, CheckCircle, XCircle, ChevronDown, Menu, X
} from 'lucide-react';


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
  const [isLoading, setIsLoading] = useState(false);
  const [chartType, setChartType] = useState('bar');
  const [timeRange, setTimeRange] = useState('monthly');
  const customersPerPage = 5;

  // Sample sales data for charts
  const salesData = {
    weekly: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      Gold: [40, 30, 50, 60],
      Silver: [30, 25, 40, 50],
      Imitation: [30, 20, 25, 30]
    },
    monthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      Gold: [4000, 3000, 5000, 2000, 6000, 4500, 5500],
      Silver: [3000, 2500, 4000, 1500, 5000, 3500, 4500],
      Imitation: [3000, 2000, 2500, 1500, 3000, 2000, 2500]
    },
    yearly: {
      labels: ['2019', '2020', '2021', '2022', '2023'],
      Gold: [25000, 30000, 35000, 40000, 45000],
      Silver: [20000, 25000, 30000, 35000, 40000],
      Imitation: [15000, 18000, 20000, 22000, 25000]
    }
  };

  const currentData = salesData[timeRange];

  // Chart data configuration
  const chartData = {
    labels: currentData.labels,
    datasets: [
      {
        label: 'Gold',
        data: currentData.Gold,
        backgroundColor: 'rgba(255, 215, 0, 0.7)',
        borderColor: 'rgba(255, 215, 0, 1)',
        borderWidth: 2,
        tension: 0.4,
        borderRadius: chartType === 'bar' ? 10 : 0,
        borderSkipped: false,
        barThickness: 30
      },
      {
        label: 'Silver',
        data: currentData.Silver,
        backgroundColor: 'rgba(192, 192, 192, 0.7)',
        borderColor: 'rgba(192, 192, 192, 1)',
        borderWidth: 2,
        tension: 0.4,
        borderRadius: chartType === 'bar' ? 10 : 0,
        borderSkipped: false,
        barThickness: 30
      },
      {
        label: 'Imitation',
        data: currentData.Imitation,
        backgroundColor: 'rgba(205, 127, 50, 0.7)',
        borderColor: 'rgba(205, 127, 50, 1)',
        borderWidth: 2,
        tension: 0.4,
        borderRadius: chartType === 'bar' ? 10 : 0,
        borderSkipped: false,
        barThickness: 30
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Jewellery Sales - ${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} View`,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ₹${context.raw.toLocaleString()}${timeRange === 'weekly' ? 'K' : ''}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: timeRange === 'weekly' ? 'Sales (in thousands)' : 'Sales (₹)',
          font: {
            weight: 'bold'
          }
        },
        ticks: {
          callback: function(value) {
            return timeRange === 'weekly' ? `${value}K` : `₹${value.toLocaleString()}`;
          }
        }
      }
    }
  };

  // Sample user data
  const userData = {
    username: 'admin_jewellery',
    fullName: 'Admin User',
    email: 'admin@jewellerybilling.com',
    avatar: '💎',
    phone: '+91 9876543210',
    address: '123 Jewellery Street, Mumbai, India',
    joinDate: '15 Jan 2022'
  };

  // Enhanced sample data
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
    ]
  };

  useEffect(() => {
    console.log('Active menu changed to:', activeMenu);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  }, [activeMenu]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMenuClick = (menu) => {
    console.log('Menu clicked:', menu);
    setActiveMenu(menu);
    setCurrentPage(1);
    setShowProfilePanel(false);
    // Close sidebar on mobile after selection
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const handleEditRates = () => {
    setEditingRates(true);
    setTempGoldRate(goldRate);
    setTempSilverRate(silverRate);
  };

  const handleSaveRates = () => {
    setIsLoading(true);
    setTimeout(() => {
      setGoldRate(tempGoldRate);
      setSilverRate(tempSilverRate);
      setLastUpdated(new Date().toLocaleString());
      setEditingRates(false);
      setIsLoading(false);
    }, 1000);
  };

  const handleCancelEdit = () => {
    setEditingRates(false);
  };

  const handleLogoutClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      onLogout();
    }, 1000);
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
    setIsLoading(true);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsLoading(false);
    }, 1500);
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

  // Menu items configuration
  const menuItems = [
    { name: 'Dashboard', icon: Home, color: 'from-blue-500 to-purple-600' },
    { name: 'Product Registration', icon: Package, color: 'from-green-500 to-teal-600' },
    { name: 'Start Sale', icon: ShoppingCart, color: 'from-orange-500 to-red-600' },
    { name: 'Registered Products', icon: List, color: 'from-indigo-500 to-blue-600' },
    { name: 'Sales History', icon: Printer, color: 'from-purple-500 to-pink-600' },
    { name: 'Available Stock', icon: Package, color: 'from-cyan-500 to-blue-600' }
  ];

  const renderActiveComponent = () => {
    if (isLoading) {
      return (
        <div className="loading-container">
          <div className="loading-shimmer" style={{height: '200px', borderRadius: '12px', marginBottom: '20px'}}></div>
          <div className="loading-shimmer" style={{height: '100px', borderRadius: '12px', marginBottom: '20px'}}></div>
          <div className="loading-shimmer" style={{height: '150px', borderRadius: '12px'}}></div>
        </div>
      );
    }

    switch(activeMenu) {
      case 'Dashboard':
        return (
          <div className="dashboard-content">
            {/* Rates Container */}
            <div className="rates-container">
              <div className="rates-header">
                <h2 className="section-heading">
                  <DollarSign className="section-icon" /> Today's Precious Metal Rates
                </h2>
                {isAdmin && !editingRates && (
                  <button className="edit-rates-btn hover-lift" onClick={handleEditRates}>
                    <Edit size={18} /> Edit Rates
                  </button>
                )}
              </div>
              
              {editingRates ? (
                <div className="rates-edit-form">
                  <div className="rate-input-group">
                    <label>💰 Gold Rate (per gram)</label>
                    <div className="input-with-symbol">
                      <span>₹</span>
                      <input 
                        type="number" 
                        value={tempGoldRate} 
                        onChange={(e) => setTempGoldRate(parseFloat(e.target.value))} 
                        className="focusable"
                      />
                    </div>
                  </div>
                  
                  <div className="rate-input-group">
                    <label>🥈 Silver Rate (per gram)</label>
                    <div className="input-with-symbol">
                      <span>₹</span>
                      <input 
                        type="number" 
                        step="0.01"
                        value={tempSilverRate} 
                        onChange={(e) => setTempSilverRate(parseFloat(e.target.value))} 
                        className="focusable"
                      />
                    </div>
                  </div>
                  
                  <div className="rate-form-actions">
                    <button className="save-rates-btn hover-lift" onClick={handleSaveRates}>
                      <CheckCircle size={18} /> Save Rates
                    </button>
                    <button className="cancel-rates-btn" onClick={handleCancelEdit}>
                      <XCircle size={18} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rates-display">
                  <div className="rate-card gold-rate hover-lift">
                    <div className="rate-icon">
                      <span style={{fontSize: '2rem'}}>💰</span>
                    </div>
                    <div className="rate-content">
                      <h3>Gold Rate (per gram)</h3>
                      <p className="rate-value">₹ {goldRate.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="rate-card silver-rate hover-lift">
                    <div className="rate-icon">
                      <span style={{fontSize: '2rem'}}>🥈</span>
                    </div>
                    <div className="rate-content">
                      <h3>Silver Rate (per gram)</h3>
                      <p className="rate-value">₹ {silverRate.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="rates-footer">
                    <p><Clock size={16} /> Last updated: {lastUpdated}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Summary Cards */}
            <div className="summary-cards">
              <div className="card hover-lift hover-glow">
                <div className="card-icon gold-bg">
                  <TrendingUp size={24} />
                </div>
                <div className="card-content">
                  <h3 className="card-heading">Today's Sales</h3>
                  <p>₹ {dashboardData.todaySales.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="card hover-lift hover-glow">
                <div className="card-icon silver-bg">
                  <PieChart size={24} />
                </div>
                <div className="card-content">
                  <h3 className="card-heading">Monthly Revenue</h3>
                  <p>₹ {dashboardData.monthlyRevenue.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="card hover-lift hover-glow">
                <div className="card-icon gold-bg">
                  <Clock size={24} />
                </div>
                <div className="card-content">
                  <h3 className="card-heading">Pending Payments</h3>
                  <p>₹ {dashboardData.pendingPayments.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="card hover-lift hover-glow">
                <div className="card-icon silver-bg">
                  <AlertTriangle size={24} />
                </div>
                <div className="card-content">
                  <h3 className="card-heading">Low Stock Items</h3>
                  <p className={dashboardData.lowStockItems > 0 ? 'warning' : ''}>
                    {dashboardData.lowStockItems}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Chart and Stock Overview */}
            <div className="chart-stock-container">
              <div className="chart-container hover-lift">
                <div className="chart-header">
                  <h2 className="section-heading">
                    <PieChart className="section-icon" /> Sales Performance
                  </h2>
                  <div className="chart-controls">
                    <div className="time-range-selector">
                      <select 
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="focusable"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    <div className="chart-type-selector">
                      <button 
                        className={chartType === 'bar' ? 'active' : ''}
                        onClick={() => setChartType('bar')}
                      >
                        Bar
                      </button>
                      <button 
                        className={chartType === 'line' ? 'active' : ''}
                        onClick={() => setChartType('line')}
                      >
                        Line
                      </button>
                      <button 
                        className={chartType === 'pie' ? 'active' : ''}
                        onClick={() => setChartType('pie')}
                      >
                        Pie
                      </button>
                    </div>
                  </div>
                </div>
                <div className="chart-wrapper">
                  {chartType === 'bar' ? (
                    <Bar data={chartData} options={chartOptions} />
                  ) : chartType === 'line' ? (
                    <Line data={chartData} options={chartOptions} />
                  ) : (
                    <Pie data={chartData} options={chartOptions} />
                  )}
                </div>
              </div>
              
              <div className="stock-overview hover-lift">
                <h2 className="section-heading">
                  <AlertTriangle className="section-icon" /> Inventory Overview
                </h2>
                <div className="stock-summary">
                  <div className="stock-metric">
                    <h3 className="metric-heading"><Package size={16} /> Total Items</h3>
                    <p>{dashboardData.totalItems}</p>
                  </div>
                  <div className="stock-metric">
                    <h3 className="metric-heading"><AlertTriangle size={16} /> Low Stock</h3>
                    <p className="warning">{dashboardData.lowStockItems}</p>
                  </div>
                  <div className="stock-metric">
                    <h3 className="metric-heading"><Users size={16} /> Total Customers</h3>
                    <p>{dashboardData.totalCustomers}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
        return <AvailableStock />;
      case 'Invoices':
        return (
          <div className="coming-soon">
            <h2><FileText size={48} /> Invoices Management</h2>
            <p>Advanced invoice management system coming soon!</p>
            <div style={{marginTop: '2rem'}}>
              <div className="loading-shimmer" style={{width: '300px', height: '20px', margin: '0 auto'}}></div>
            </div>
          </div>
        );
      case 'Sales Overview':
        return <SalesOverview />;
      case 'Stock Alert':
        return <StockAlert />
        
      default:
        return (
          <div className="coming-soon">
            <h2>{activeMenu}</h2>
            <p>This feature is under development!</p>
          </div>
        );
    }
  };

  return (
    <div className={`dashboard-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Mobile Overlay */}
      {sidebarOpen && window.innerWidth <= 768 && (
        <div className="mobile-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Enhanced Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'} fixed-sidebar`}>
        <div className="sidebar-header">
          <h2>💎 Jewellery Billing</h2>
        </div>
        
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li 
              key={item.name}
              className={activeMenu === item.name ? 'active' : ''}
              onClick={() => handleMenuClick(item.name)}
            >
              <span>
                <item.icon className="menu-icon" size={20} />
                <span>{item.name}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Main Content Area */}
      <div className="main-content-wrapper">
        {/* Enhanced Header */}
        <header className="main-header fixed-header">
          <div className="header-left">
            <button className="mobile-menu-btn" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <h1 className="main-heading">
              {activeMenu === 'Dashboard' && <Home className="header-icon" />}
              {activeMenu === 'Product Registration' && <Package className="header-icon" />}
              {activeMenu === 'Start Sale' && <ShoppingCart className="header-icon" />}
              {activeMenu === 'Registered Products' && <List className="header-icon" />}
              {activeMenu === 'Sales History' && <Printer className="header-icon" />}
              {activeMenu === 'Available Stock' && <Package className="header-icon" />}
              {activeMenu === 'Invoices' && <FileText className="header-icon" />}
              {activeMenu === 'Sales Overview' && <PieChart className="header-icon" />}
              {activeMenu === 'Stock Alert' && <AlertTriangle className="header-icon" />}
              {activeMenu}
            </h1>
          </div>
          
          <div className="header-actions">
            <div className="header-nav">
              <button 
                className={`header-nav-btn ${activeMenu === 'Invoices' ? 'active' : ''}`}
                onClick={() => handleMenuClick('Invoices')}
              >
                <FileText size={18} /> Invoices
              </button>
              <button 
                className={`header-nav-btn ${activeMenu === 'Sales Overview' ? 'active' : ''}`}
                onClick={() => handleMenuClick('Sales Overview')}
              >
                <PieChart size={18} /> Analytics
              </button>
              <button 
                className={`header-nav-btn ${activeMenu === 'Stock Alert' ? 'active' : ''}`}
                onClick={() => handleMenuClick('Stock Alert')}
              >
                <AlertTriangle size={18} /> Alerts
              </button>
            </div>
            
            <div className="header-right">
              <button 
                className="theme-toggle" 
                onClick={toggleDarkMode}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <div className="user-profile" onClick={toggleProfilePanel}>
                <div className="avatar">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="profile-image" />
                  ) : (
                    userData.avatar
                  )}
                </div>
                <div className="user-info">
                  <span className="user-name">{userData.fullName}</span>
                  <span className="user-role"></span>
                </div>
                <ChevronDown size={16} />
              </div>
            </div>
          </div>
        </header>
        
        {/* Enhanced Profile Panel */}
        {showProfilePanel && (
          <div className="profile-panel-overlay" onClick={toggleProfilePanel}>
            <div className="profile-panel" onClick={e => e.stopPropagation()}>
              <button className="close-profile-panel" onClick={toggleProfilePanel}>
                <XCircle size={24} />
              </button>
              
              <div className="profile-header">
                <div className="profile-avatar">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="profile-image" />
                  ) : (
                    <div className="default-avatar">{userData.avatar}</div>
                  )}
                  <label className="change-avatar-btn">
                    <Camera size={16} />
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
                <p className="user-role"></p>
              </div>
              
              
             
               
              
              <div className="profile-actions">
                <button className="logout-btn hover-lift" onClick={handleLogoutClick}>
                  <LogOut size={18} /> {isLoading ? 'Logging out...' : 'Logout'}
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