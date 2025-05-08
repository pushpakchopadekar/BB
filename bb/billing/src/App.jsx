import React, { useState } from 'react';
import WelcomePage from './componentes/Auth/WelcomePage';
import Login from './componentes/Auth/login';
import Dashboard from './componentes/Dashboard/Dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('welcome');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleAdminClick = () => {
    setCurrentPage('login');
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('welcome');
  };

  return (
    <div className="app">
      {currentPage === 'welcome' && <WelcomePage onAdminClick={handleAdminClick} />}
      {currentPage === 'login' && <Login onLogin={handleLogin} />}
      {currentPage === 'dashboard' && <Dashboard onLogout={handleLogout} />}
    </div>
  );
}

export default App;