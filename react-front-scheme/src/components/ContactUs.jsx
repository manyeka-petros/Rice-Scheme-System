import React, { useState } from "react";
import { motion } from "framer-motion";

export default function ContactUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState({ type: "", message: "" });
  const [sending, setSending] = useState(false);
  const [activeField, setActiveField] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus({ type: "error", message: "Please fill all required fields." });
      return;
    }
    if (!validateEmail(form.email)) {
      setStatus({ type: "error", message: "Please enter a valid email address." });
      return;
    }

    setSending(true);
    setStatus({ type: "", message: "" });

    setTimeout(() => {
      setSending(false);
      setStatus({ type: "success", message: "Message sent successfully. Thank you!" });
      setForm({ name: "", email: "", subject: "", message: "" });
    }, 1500);
  };

  return (
    <div className="contact-container">
      {/* Hero Section */}
      <div className="contact-hero">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="contact-title"
        >
          Get in Touch
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="contact-subtitle"
        >
          We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </motion.p>
      </div>

      {/* Main Content */}
      <div className="contact-content">
        {/* Contact Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="contact-form-container"
        >
          <div className="contact-form-card">
            <h2 className="form-title">Send us a message</h2>
            
            {status.message && (
              <div className={`status-message ${status.type}`}>
                {status.message}
                <button 
                  onClick={() => setStatus({ type: "", message: "" })}
                  className="status-close"
                >
                  &times;
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className={`form-group ${activeField === 'name' ? 'active' : ''}`}>
                <label htmlFor="name" className="form-label">
                  <span className="label-text">Full Name</span>
                  <span className="required-asterisk">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="form-input"
                  value={form.name}
                  onChange={handleChange}
                  onFocus={() => setActiveField('name')}
                  onBlur={() => setActiveField(null)}
                  placeholder=" "
                  required
                />
                <div className="underline"></div>
              </div>

              <div className={`form-group ${activeField === 'email' ? 'active' : ''}`}>
                <label htmlFor="email" className="form-label">
                  <span className="label-text">Email Address</span>
                  <span className="required-asterisk">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setActiveField('email')}
                  onBlur={() => setActiveField(null)}
                  placeholder=" "
                  required
                />
                <div className="underline"></div>
              </div>

              <div className={`form-group ${activeField === 'subject' ? 'active' : ''}`}>
                <label htmlFor="subject" className="form-label">
                  <span className="label-text">Subject</span>
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  className="form-input"
                  value={form.subject}
                  onChange={handleChange}
                  onFocus={() => setActiveField('subject')}
                  onBlur={() => setActiveField(null)}
                  placeholder=" "
                />
                <div className="underline"></div>
              </div>

              <div className={`form-group ${activeField === 'message' ? 'active' : ''}`}>
                <label htmlFor="message" className="form-label">
                  <span className="label-text">Your Message</span>
                  <span className="required-asterisk">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  className="form-textarea"
                  rows="5"
                  value={form.message}
                  onChange={handleChange}
                  onFocus={() => setActiveField('message')}
                  onBlur={() => setActiveField(null)}
                  placeholder=" "
                  required
                ></textarea>
                <div className="underline"></div>
              </div>

              <motion.button
                type="submit"
                className="submit-button"
                disabled={sending}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {sending ? (
                  <>
                    <span className="spinner"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="send-icon" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                    </svg>
                    Send Message
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="contact-info-container"
        >
          <div className="contact-info-card">
            <h2 className="info-title">Contact Information</h2>
            
            <div className="info-item">
              <div className="info-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path>
                </svg>
              </div>
              <div className="info-content">
                <h3>Email</h3>
                <a href="mailto:info@limphasaricescheme.mw">info@limphasaricescheme.mw</a>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"></path>
                </svg>
              </div>
              <div className="info-content">
                <h3>Phone</h3>
                <a href="tel:+265123456789">+265 123 456 789</a>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"></path>
                </svg>
              </div>
              <div className="info-content">
                <h3>Office Address</h3>
                <p>Limphasa Rice Scheme Office<br />Nkhata Bay, Malawi</p>
              </div>
            </div>

            <div className="social-links">
              <a href="#" className="social-icon" aria-label="Facebook">
                <svg viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="Twitter">
                <svg viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="Instagram">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"></path>
                </svg>
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Map Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="map-container"
      >
        <h2 className="map-title">Our Location</h2>
        <div className="map-embed">
          <iframe
            title="Limphasa Rice Scheme Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3904.4961350193017!2d34.2911933!3d-11.5567896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1947e16e61f30b79%3A0xa6f5e19c5160e216!2sLimphasa%20Irrigation%20Scheme!5e0!3m2!1sen!2smw!4v1720463300000"
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      </motion.div>

      {/* CSS Styles */}
      <style jsx>{`
        .contact-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #333;
        }

        .contact-hero {
          text-align: center;
          margin-bottom: 4rem;
          padding: 2rem 0;
        }

        .contact-title {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 1rem;
          background: linear-gradient(90deg, #4CAF50, #2E7D32);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .contact-subtitle {
          font-size: 1.25rem;
          color: #666;
          max-width: 600px;
          margin: 0 auto;
        }

        .contact-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 4rem;
        }

        .contact-form-container {
          position: relative;
        }

        .contact-form-card {
          background: white;
          border-radius: 16px;
          padding: 2.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .form-title {
          font-size: 1.75rem;
          margin-bottom: 2rem;
          color: #2E7D32;
          font-weight: 600;
        }

        .form-group {
          position: relative;
          margin-bottom: 2rem;
        }

        .form-group.active .underline {
          transform: scaleX(1);
          background: linear-gradient(90deg, #4CAF50, #2E7D32);
        }

        .form-label {
          position: absolute;
          top: 0;
          left: 0;
          transform: translateY(0);
          transition: all 0.3s ease;
          pointer-events: none;
          color: #666;
        }

        .form-group.active .form-label {
          transform: translateY(-24px);
          font-size: 0.85rem;
          color: #4CAF50;
        }

        .label-text {
          display: inline-block;
          transform-origin: left center;
        }

        .required-asterisk {
          color: #f44336;
          margin-left: 4px;
        }

        .form-input, .form-textarea {
          width: 100%;
          border: none;
          border-bottom: 1px solid #ddd;
          padding: 8px 0;
          font-size: 1rem;
          background: transparent;
          transition: all 0.3s ease;
        }

        .form-input:focus, .form-textarea:focus {
          outline: none;
        }

        .form-textarea {
          resize: none;
          min-height: 120px;
        }

        .underline {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: #ddd;
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 0.3s ease;
        }

        .submit-button {
          background: linear-gradient(90deg, #4CAF50, #2E7D32);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          margin-top: 1rem;
          transition: all 0.3s ease;
        }

        .submit-button:hover {
          box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .send-icon {
          width: 20px;
          height: 20px;
          fill: white;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .status-message {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        .status-message.success {
          background: #e8f5e9;
          color: #2E7D32;
          border-left: 4px solid #4CAF50;
        }

        .status-message.error {
          background: #ffebee;
          color: #f44336;
          border-left: 4px solid #f44336;
        }

        .status-close {
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: inherit;
        }

        .contact-info-container {
          position: relative;
        }

        .contact-info-card {
          background: white;
          border-radius: 16px;
          padding: 2.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.05);
          height: 100%;
        }

        .info-title {
          font-size: 1.75rem;
          margin-bottom: 2rem;
          color: #2E7D32;
          font-weight: 600;
        }

        .info-item {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .info-icon {
          width: 48px;
          height: 48px;
          background: #e8f5e9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .info-icon svg {
          width: 24px;
          height: 24px;
          fill: #4CAF50;
        }

        .info-content h3 {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
          color: #333;
        }

        .info-content p, .info-content a {
          color: #666;
          line-height: 1.6;
        }

        .info-content a {
          text-decoration: none;
          transition: color 0.3s;
        }

        .info-content a:hover {
          color: #4CAF50;
        }

        .social-links {
          display: flex;
          gap: 1rem;
          margin-top: 3rem;
        }

        .social-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .social-icon:hover {
          background: #4CAF50;
        }

        .social-icon:hover svg {
          fill: white;
        }

        .social-icon svg {
          width: 18px;
          height: 18px;
          fill: #666;
          transition: fill 0.3s ease;
        }

        .map-container {
          margin-top: 4rem;
        }

        .map-title {
          font-size: 1.75rem;
          margin-bottom: 1.5rem;
          color: #2E7D32;
          font-weight: 600;
          text-align: center;
        }

        .map-embed {
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          height: 400px;
        }

        .map-embed iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        @media (max-width: 1024px) {
          .contact-content {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .contact-container {
            padding: 1rem;
          }

          .contact-title {
            font-size: 2rem;
          }

          .contact-subtitle {
            font-size: 1rem;
          }

          .contact-form-card, .contact-info-card {
            padding: 1.5rem;
          }

          .form-title, .info-title {
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}