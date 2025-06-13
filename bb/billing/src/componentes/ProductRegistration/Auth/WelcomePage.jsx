import React, { useState, useRef } from 'react';
import Tilt from 'react-parallax-tilt';
import { motion } from 'framer-motion';
import './WelcomePage.css';
import ProfilePhoto from '../images/admin.jpg';
import BgVideo from '../images/video/bg3.mp4';

const WelcomePage = ({ onAdminClick }) => {
  const [profileImage, setProfileImage] = useState(ProfilePhoto); 
  const fileInputRef = useRef(null);

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

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="welcome-container">
      {/* Video Background */}
      <div className="video-background">
        <video autoPlay loop muted playsInline>
          <source src={BgVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="video-overlay"></div>
      </div>

      {/* Floating Particles */}
      <div className="floating-particles">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="particle" 
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="hero">
        <Tilt 
          tiltMaxAngleX={10} 
          tiltMaxAngleY={10} 
          glareEnable={true} 
          glareMaxOpacity={0.2}
          glarePosition="all"
          glareBorderRadius="20px"
        >
          <motion.div
            className="hero-content glass-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            {/* Profile Photo Section */}
            <div className="profile-section">
              <div 
                className="profile-image-container"
                onClick={triggerFileInput}
              >
                <img 
                  src={profileImage} 
                  alt="Admin Profile" 
                  className="profile-image" 
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E"
                  }}
                />
                <div className="profile-upload-hint">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <h3 className="profile-title">Admin Access</h3>
            </div>

            <h1 className="hero-title">Welcome to Your Jewelry Billing Dashboard</h1>
            <div className="cta-buttons">
              <motion.button 
                className="btn btn-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAdminClick}
              >
                Admin
              </motion.button>
            </div>
          </motion.div>
        </Tilt>
      </section>
    </div>
  );
};

export default WelcomePage;