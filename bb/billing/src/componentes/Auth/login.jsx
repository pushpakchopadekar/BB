import React, { useEffect, useState } from 'react';
import '../Auth/Login.css';

const Login = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState('register');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    captcha: ''
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaText, setCaptchaText] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [popupContent, setPopupContent] = useState({ title: '', message: '' });

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    generateCaptcha();
    return () => clearTimeout(timer);
  }, [activeTab]);

  const generateCaptcha = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
      captcha += chars[Math.floor(Math.random() * chars.length)];
    }
    setCaptchaText(captcha);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMessage({ text: '', type: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePassword = (password) => {
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length >= 8 && hasNumber && hasSymbol;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (activeTab === 'register') {
      if (!validatePassword(formData.password)) {
        setMessage({ 
          text: 'Password must be at least 8 characters with 1 number and 1 symbol', 
          type: 'error' 
        });
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setMessage({ 
          text: 'Passwords do not match', 
          type: 'error' 
        });
        return;
      }
      
      if (formData.captcha !== captchaText) {
        setMessage({ 
          text: 'Invalid CAPTCHA', 
          type: 'error' 
        });
        return;
      }
      
      setPopupContent({
        title: 'Registration Successful!',
        message: 'Your account has been created successfully.'
      });
      setShowSuccessPopup(true);
      
      setTimeout(() => {
        setShowSuccessPopup(false);
        setActiveTab('login');
        setFormData(prev => ({
          ...prev,
          name: '',
          confirmPassword: '',
          captcha: ''
        }));
      }, 3000);
      
    } else {
      if (!formData.email || !formData.password) {
        setMessage({ 
          text: 'Please enter both email and password', 
          type: 'error' 
        });
        return;
      }
      
      setPopupContent({
        title: 'Login Successful!',
        message: 'You have successfully logged in.'
      });
      setShowSuccessPopup(true);
      
      setTimeout(() => {
        setShowSuccessPopup(false);
        onLogin();
      }, 2000);
    }
  };

  const handleForgotPassword = () => {
    if (!formData.email) {
      setMessage({ 
        text: 'Please enter your email address', 
        type: 'error' 
      });
      return;
    }
    setMessage({ 
      text: `Password reset link sent to ${formData.email}`, 
      type: 'success' 
    });
  };

  return (
    <div className="login-container">
    {showSuccessPopup && (
  <div className="success-popup">
    <div className="popup-content">
      <button 
        className="popup-close" 
        onClick={() => setShowSuccessPopup(false)}
      >
        ×
      </button>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.86" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <h3>{popupContent.title}</h3>
      <p>{popupContent.message}</p>
    </div>
  </div>
)}


      <div className={`login-card ${isAnimating ? 'card-animate' : ''}`}>
        <div className="app-logo">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4L4 8V16L12 20L20 16V8L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M12 12L20 8M12 12L4 8M12 12V20" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
          <h2>Welcome Back!</h2>
        </div>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
            <button onClick={() => setMessage({ text: '', type: '' })}>×</button>
          </div>
        )}
        
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => handleTabChange('login')}
          >
            Login
          </button>
          <button 
            className={`tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => handleTabChange('register')}
          >
            Register
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {activeTab === 'register' && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-container">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  autoComplete="name"
                />
                <div className="underline"></div>
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-container">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                autoComplete="email"
              />
              <div className="underline"></div>
            </div>
          </div>
          
          <div className="password-row">
            <div className="form-group password-group">
              <label htmlFor="password">Password</label>
              <div className="input-container password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength="8"
                  autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
                />
                <div className="underline"></div>
                <button 
                  type="button" 
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5C5 5 1 12 1 12C1 12 5 19 12 19C19 19 23 12 23 12C23 12 19 5 12 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.12 14.12C13.8454 14.4147 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1752 15.0074 10.8016 14.8565C10.4281 14.7056 10.0887 14.481 9.80385 14.1962C9.51897 13.9113 9.29439 13.5719 9.14351 13.1984C8.99262 12.8248 8.91853 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2218 9.18488 10.8538C9.34884 10.4859 9.58525 10.1546 9.88 9.88M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.6819 3.96914 7.65661 6.06 6.06L17.94 17.94ZM9.9 4.24C10.5883 4.07888 11.2931 3.99834 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2047 20.84 15.19L9.9 4.24Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M1 1L23 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
              {activeTab === 'register' && (
                <div className="password-hint">
                  Min 8 chars with 1 number & symbol
                </div>
              )}
            </div>
            
            {activeTab === 'register' && (
              <div className="form-group password-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-container password-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    minLength="8"
                    autoComplete="new-password"
                  />
                  <div className="underline"></div>
                  <button 
                    type="button" 
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5C5 5 1 12 1 12C1 12 5 19 12 19C19 19 23 12 23 12C23 12 19 5 12 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.12 14.12C13.8454 14.4147 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1752 15.0074 10.8016 14.8565C10.4281 14.7056 10.0887 14.481 9.80385 14.1962C9.51897 13.9113 9.29439 13.5719 9.14351 13.1984C8.99262 12.8248 8.91853 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2218 9.18488 10.8538C9.34884 10.4859 9.58525 10.1546 9.88 9.88M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.6819 3.96914 7.65661 6.06 6.06L17.94 17.94ZM9.9 4.24C10.5883 4.07888 11.2931 3.99834 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2047 20.84 15.19L9.9 4.24Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M1 1L23 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {activeTab === 'register' && (
            <div className="captcha-row">
              <div className="captcha-display">
                {captchaText.split('').map((char, index) => (
                  <span 
                    key={index} 
                    style={{
                      transform: `rotate(${Math.random() * 20 - 10}deg)`,
                      color: `hsl(${Math.random() * 360}, 70%, 50%)`
                    }}
                  >
                    {char}
                  </span>
                ))}
              </div>
              <div className="form-group captcha-input">
                <label htmlFor="captcha">Enter CAPTCHA</label>
                <div className="input-container">
                  <input
                    type="text"
                    id="captcha"
                    name="captcha"
                    value={formData.captcha}
                    onChange={handleInputChange}
                    required
                  />
                  <div className="underline"></div>
                </div>
              </div>
              <button 
                type="button" 
                className="refresh-captcha"
                onClick={generateCaptcha}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20.49 9C19.9828 7.56678 19.1209 6.28538 17.9845 5.27542C16.8482 4.26546 15.4745 3.55976 14 3.22301C12.5255 2.88625 10.9999 2.92999 9.54704 3.35041C8.09415 3.77082 6.76061 4.55739 5.67 5.64L1 10M23 14L18.33 18.36C17.2394 19.4426 15.9059 20.2292 14.453 20.6496C13.0001 21.07 11.4745 21.1137 11 20.777C8.52547 20.4402 7.1518 19.7345 6.01547 18.7246C4.87914 17.7146 4.01717 16.4332 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
          
          {activeTab === 'login' && (
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" name="remember" id="remember" />
                <span>Remember me</span>
              </label>
              <button 
                type="button" 
                className="forgot-password"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </button>
            </div>
          )}
          
          <button type="submit" className="submit-btn">
            <span>{activeTab === 'register' ? 'Register' : 'Login'}</span>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;