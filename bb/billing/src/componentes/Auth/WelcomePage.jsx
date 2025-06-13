import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './WelcomePage.css';
import BgVideo from '../images/video/bg3.mp4';

const WelcomePage = ({ onAdminClick }) => {
  const [typingComplete, setTypingComplete] = useState(false);
  
  // Typing animation effect
  const titleText = "Jewellery Billing System";
  const [displayText, setDisplayText] = useState("");
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (charIndex < titleText.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + titleText[charIndex]);
        setCharIndex(prev => prev + 1);
      }, 150);
      
      return () => clearTimeout(timeout);
    } else {
      setTypingComplete(true);
    }
  }, [charIndex, titleText]);

  return (
    <div className="welcome-page">
      <video className="background-video" autoPlay loop muted playsInline>
        <source src={BgVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="overlay"></div>

      

      <div className="main-content">
        <motion.h1
          className="typing-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {displayText}
        </motion.h1>
        
        {typingComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="welcome-message"
          >
            <p className="welcome-text">
              Welcome to our comprehensive jewellery billing and inventory management solution designed 
              specifically for jewellery businesses to streamline operations, manage inventory, 
              and generate professional invoices with ease.
            </p>
            <div className="gradient-text">Premium Business Management Solution</div>
          </motion.div>
        )}
        
        <motion.button
          className="admin-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAdminClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: typingComplete ? 1 : 0 }}
          transition={{ delay: 1.2 }}
        >
          Enter Admin Panel
        </motion.button>
      </div>
    </div>
  );
};

export default WelcomePage;