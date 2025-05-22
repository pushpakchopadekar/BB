import React, { useEffect, useState, useRef } from 'react';
import '../Auth/Login.css';
import { 
  auth,
  database,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from '../../Firebase';
import { ref, set, get } from 'firebase/database';

const Login = ({ onLogin }) => {
  // State management
  const [activeTab, setActiveTab] = useState('login');
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
  const [notifications, setNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef(null);

  // Component lifecycle
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    generateCaptcha();
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Helper functions
  const generateCaptcha = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
      captcha += chars[Math.floor(Math.random() * chars.length)];
    }
    setCaptchaText(captcha);
  };

  const addNotification = (text, type) => {
    const id = Date.now();
    const notification = { id, text, type };
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      captcha: ''
    });
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

  // Form submission handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (activeTab === 'register') {
        await handleRegistration();
      } else {
        await handleLogin();
      }
    } catch (error) {
      addNotification(error.message || 'An error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistration = async () => {
    // Frontend validation
    if (!formData.name) {
      throw new Error('Please enter your full name');
    }
    
    if (!formData.email) {
      throw new Error('Please enter your email address');
    }
    
    if (!validatePassword(formData.password)) {
      throw new Error('Password must be at least 8 characters with 1 number and 1 symbol');
    }
    
    if (formData.password !== formData.confirmPassword) {
      throw new Error('Passwords do not match');
    }
    
    if (formData.captcha !== captchaText) {
      throw new Error('Invalid CAPTCHA');
    }

    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      const user = userCredential.user;
      
      // Save additional user data to Realtime Database
      await set(ref(database, 'users/' + user.uid), {
        name: formData.name,
        email: formData.email,
        createdAt: new Date().toISOString()
      });

      // Show success modal
      setModalContent({
        title: 'Registration Successful!',
        message: 'Your account has been created successfully.'
      });
      setShowModal(true);
      
      setTimeout(() => {
        setShowModal(false);
        setActiveTab('login');
        setFormData(prev => ({
          ...prev,
          name: '',
          confirmPassword: '',
          captcha: ''
        }));
      }, 3000);
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email already in use.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled.';
          break;
        default:
          errorMessage = error.message || 'An unexpected error occurred.';
      }
      throw new Error(errorMessage);
    }
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      throw new Error('Please enter both email and password');
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      const user = userCredential.user;
      
      // Get additional user data from Realtime Database
      const userRef = ref(database, 'users/' + user.uid);
      const snapshot = await get(userRef);
      const userData = snapshot.val();

      // Show success modal
      setModalContent({
        title: 'Login Successful!',
        message: `Welcome back, ${userData?.name || 'User'}!`
      });
      setShowModal(true);
      
      // Save user data to localStorage
      localStorage.setItem('authToken', user.accessToken);
      localStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        name: userData?.name || 'User',
        email: user.email
      }));

      setTimeout(() => {
        setShowModal(false);
        if (onLogin) onLogin();
      }, 2000);
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'User not found. Please register.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        default:
          console.error('Login error:', error);
      }
      throw new Error(errorMessage);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      addNotification('Please enter your email address', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, formData.email);
      addNotification(`Password reset link sent to ${formData.email}`, 'success');
    } catch (error) {
      let errorMessage = 'Failed to send reset link';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      }
      addNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Notification container */}
      <div className="notification-container">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`notification ${notification.type}`}
            onClick={() => removeNotification(notification.id)}
          >
            <div className="notification-content">
              {notification.type === 'success' ? (
                <svg className="notification-icon" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              ) : (
                <svg className="notification-icon" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              )}
              <span>{notification.text}</span>
            </div>
            <div className="notification-progress"></div>
          </div>
        ))}
      </div>

      {/* 3D Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div 
            className="modal-3d" 
            ref={modalRef}
            style={{
              transform: showModal ? 'translateY(0) rotateX(0)' : 'translateY(100px) rotateX(-30deg)'
            }}
          >
            <div className="modal-content">
              <button 
                className="modal-close" 
                onClick={() => setShowModal(false)}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
              <div className="modal-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3>{modalContent.title}</h3>
              <p>{modalContent.message}</p>
              <div className="modal-confetti">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="confetti-piece" style={{
                    backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    transform: `rotate(${Math.random() * 360}deg)`
                  }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login card */}
      <div className={`login-card ${isAnimating ? 'card-animate' : ''}`}>
        <div className="app-logo">
          <svg viewBox="0 0 24 24">
            <path d="M12 4L4 8V16L12 20L20 16V8L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M12 12L20 8M12 12L4 8M12 12V20" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
          <h2>Welcome Back!</h2>
        </div>
        
        {/* Tabs */}
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
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {activeTab === 'register' && (
            <div className="form-group">
              <div className="input-container">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  autoComplete="name"
                  placeholder=" "
                />
                <label htmlFor="name">Full Name</label>
                <div className="underline"></div>
              </div>
            </div>
          )}
          
          <div className="form-group">
            <div className="input-container">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                autoComplete="email"
                placeholder=" "
              />
              <label htmlFor="email">Email Address</label>
              <div className="underline"></div>
            </div>
          </div>
          
          <div className="password-row">
            <div className="form-group password-group">
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
                  placeholder=" "
                />
                <label htmlFor="password">Password</label>
                <div className="underline"></div>
                <button 
                  type="button" 
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24">
                      <path d="M12 5C5 5 1 12 1 12C1 12 5 19 12 19C19 19 23 12 23 12C23 12 19 5 12 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24">
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
                    placeholder=" "
                  />
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="underline"></div>
                  <button 
                    type="button" 
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <svg viewBox="0 0 24 24">
                        <path d="M12 5C5 5 1 12 1 12C1 12 5 19 12 19C19 19 23 12 23 12C23 12 19 5 12 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24">
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
                <div className="input-container">
                  <input
                    type="text"
                    id="captcha"
                    name="captcha"
                    value={formData.captcha}
                    onChange={handleInputChange}
                    required
                    placeholder=" "
                  />
                  <label htmlFor="captcha">Enter CAPTCHA</label>
                  <div className="underline"></div>
                </div>
              </div>
              <button 
                type="button" 
                className="refresh-captcha"
                onClick={generateCaptcha}
                aria-label="Refresh CAPTCHA"
              >
                <svg viewBox="0 0 24 24">
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
          
          <button type="submit" className="submit-btn" disabled={isLoading}>
            <span>
              {isLoading ? (
                <span className="loading-spinner">
                  <svg viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="5"></circle>
                  </svg>
                </span>
              ) : (
                activeTab === 'register' ? 'Register' : 'Login'
              )}
            </span>
            {!isLoading && (
              <svg className="submit-arrow" viewBox="0 0 24 24">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;