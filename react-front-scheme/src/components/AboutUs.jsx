import React from "react";
import { motion } from "framer-motion";

export default function AboutUs() {
  return (
    <div className="about-container">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="about-hero"
      >
        <h1 className="about-title">
          <span className="title-gradient">About Limphasa Rice Scheme</span>
        </h1>
        <p className="about-subtitle">
          Empowering farmers through sustainable irrigation and cooperative farming
        </p>
        <div className="hero-divider"></div>
      </motion.section>

      {/* Main Content */}
      <div className="about-content">
        {/* Location Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="about-section"
        >
          <div className="section-header">
            <div className="section-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"></path>
              </svg>
            </div>
            <h2 className="section-title">Location</h2>
          </div>
          <p className="section-text">
            Limphasa Rice Scheme is a community-driven agricultural initiative located in <strong>Nkhata Bay District</strong>, in the Northern Region of Malawi. It serves as a critical economic and food security backbone for local households, focusing on rice farming through irrigation.
          </p>
        </motion.section>

        {/* What We Do Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="about-section"
        >
          <div className="section-header">
            <div className="section-icon">
              <svg viewBox="0 0 24 24">
                <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"></path>
              </svg>
            </div>
            <h2 className="section-title">What We Do</h2>
          </div>
          <p className="section-text">
            The scheme brings together local farmers who cultivate rice using a well-managed irrigation system. It is organized into <strong>blocks</strong> and <strong>sections</strong>, each led by representatives like chairpersons and overseen by a president.
          </p>
          
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"></path>
                </svg>
              </div>
              <h3 className="feature-title">Farmer Registration</h3>
              <p className="feature-text">Registration of farmers and allocation of plots</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"></path>
                </svg>
              </div>
              <h3 className="feature-title">Canal Maintenance</h3>
              <p className="feature-text">Regular cleaning of main and block canals</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"></path>
                </svg>
              </div>
              <h3 className="feature-title">Attendance Tracking</h3>
              <p className="feature-text">Monitoring participation in community work</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path>
                </svg>
              </div>
              <h3 className="feature-title">Fee Management</h3>
              <p className="feature-text">Collection and management of irrigation fees</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"></path>
                </svg>
              </div>
              <h3 className="feature-title">Community Governance</h3>
              <p className="feature-text">Handling disciplinary matters and local governance</p>
            </div>
          </div>
        </motion.section>

        {/* Mission Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="about-section mission-section"
        >
          <div className="section-header">
            <div className="section-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"></path>
              </svg>
            </div>
            <h2 className="section-title">Our Mission</h2>
          </div>
          <p className="section-text mission-text">
            To empower smallholder farmers in Nkhata Bay with access to water, land, and collective management structures that ensure consistent rice production, food security, and income generation.
          </p>
          <div className="mission-highlight">
            <svg viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
            </svg>
            <span>Sustainable farming solutions for Malawi's future</span>
          </div>
        </motion.section>

        {/* Impact Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="about-section"
        >
          <div className="section-header">
            <div className="section-icon">
              <svg viewBox="0 0 24 24">
                <path d="M17 20.41L18.41 19 15 15.59 13.59 17 17 20.41zM7.5 8H11v5.59L5.59 19 7 20.41l6-6V8h3.5L12 3.5 7.5 8z"></path>
              </svg>
            </div>
            <h2 className="section-title">Community Impact</h2>
          </div>
          <p className="section-text">
            Limphasa Rice Scheme supports over 100 farmers and their families. It improves livelihoods by promoting sustainable agricultural practices.
          </p>
          
          <div className="impact-stats">
            <div className="stat-item">
              <div className="stat-value">100+</div>
              <div className="stat-label">Farmers Supported</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">24/7</div>
              <div className="stat-label">Irrigation Access</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">100%</div>
              <div className="stat-label">Community Owned</div>
            </div>
          </div>
          
          <div className="impact-grid">
            <div className="impact-card">
              <h3 className="impact-title">Sustainable Agriculture</h3>
              <p className="impact-text">Promoting eco-friendly farming techniques that preserve the land for future generations</p>
            </div>
            <div className="impact-card">
              <h3 className="impact-title">Capacity Building</h3>
              <p className="impact-text">Regular training programs to enhance farming skills and business knowledge</p>
            </div>
            <div className="impact-card">
              <h3 className="impact-title">Environmental Stewardship</h3>
              <p className="impact-text">Water conservation and sustainable resource management practices</p>
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="cta-section"
        >
          <h2 className="cta-title">Want to learn more or get involved?</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="cta-button"
          >
            Contact Us
            <svg viewBox="0 0 24 24">
              <path d="M4 11v2h12l-5.5 5.5 1.42 1.42L19.84 12l-7.92-7.92L10.5 5.5 16 11H4z"></path>
            </svg>
          </motion.button>
        </motion.section>
      </div>

      {/* CSS Styles */}
      <style jsx>{`
        .about-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #333;
        }

        .about-hero {
          text-align: center;
          margin-bottom: 4rem;
          padding: 2rem 0;
        }

        .about-title {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .title-gradient {
          background: linear-gradient(90deg, #4CAF50, #2E7D32);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .about-subtitle {
          font-size: 1.5rem;
          color: #666;
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .hero-divider {
          width: 100px;
          height: 4px;
          background: linear-gradient(90deg, #4CAF50, #2E7D32);
          margin: 2rem auto;
          border-radius: 2px;
        }

        .about-content {
          max-width: 900px;
          margin: 0 auto;
        }

        .about-section {
          margin-bottom: 4rem;
          padding: 0 1rem;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .section-icon {
          width: 48px;
          height: 48px;
          background: #e8f5e9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .section-icon svg {
          width: 24px;
          height: 24px;
          fill: #4CAF50;
        }

        .section-title {
          font-size: 1.75rem;
          color: #2E7D32;
          font-weight: 600;
          margin: 0;
        }

        .section-text {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #555;
          margin-bottom: 2rem;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .feature-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          background: #f5f5f5;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .feature-icon svg {
          width: 24px;
          height: 24px;
          fill: #4CAF50;
        }

        .feature-title {
          font-size: 1.2rem;
          color: #2E7D32;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .feature-text {
          font-size: 1rem;
          color: #666;
          line-height: 1.6;
        }

        .mission-section {
          background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(46, 125, 50, 0.1));
          border-radius: 16px;
          padding: 2rem;
          margin: 3rem 0;
        }

        .mission-text {
          font-size: 1.2rem;
          font-weight: 500;
          color: #333;
        }

        .mission-highlight {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: white;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          margin-top: 2rem;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          max-width: fit-content;
        }

        .mission-highlight svg {
          width: 24px;
          height: 24px;
          fill: #4CAF50;
        }

        .mission-highlight span {
          font-weight: 600;
          color: #2E7D32;
        }

        .impact-stats {
          display: flex;
          justify-content: space-around;
          gap: 1rem;
          margin: 2rem 0;
          flex-wrap: wrap;
        }

        .stat-item {
          text-align: center;
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          min-width: 150px;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #4CAF50;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 1rem;
          color: #666;
        }

        .impact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .impact-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          border-left: 4px solid #4CAF50;
        }

        .impact-title {
          font-size: 1.2rem;
          color: #2E7D32;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .impact-text {
          font-size: 1rem;
          color: #666;
          line-height: 1.6;
        }

        .cta-section {
          text-align: center;
          margin-top: 4rem;
          padding: 3rem 1rem;
          background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(46, 125, 50, 0.1));
          border-radius: 16px;
        }

        .cta-title {
          font-size: 1.75rem;
          color: #2E7D32;
          margin-bottom: 1.5rem;
          font-weight: 600;
        }

        .cta-button {
          background: linear-gradient(90deg, #4CAF50, #2E7D32);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
        }

        .cta-button svg {
          width: 20px;
          height: 20px;
          fill: white;
        }

        @media (max-width: 768px) {
          .about-title {
            font-size: 2rem;
          }

          .about-subtitle {
            font-size: 1.2rem;
          }

          .section-title {
            font-size: 1.5rem;
          }

          .section-text {
            font-size: 1rem;
          }

          .feature-grid, .impact-grid {
            grid-template-columns: 1fr;
          }

          .mission-section {
            padding: 1.5rem;
          }

          .cta-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}