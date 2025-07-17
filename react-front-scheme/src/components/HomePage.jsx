import React from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import "./HomePage.css";

export default function HomePage() {
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    fade: true
  };

  const features = [
    {
      title: "Land Preparation",
      description: "Modern techniques for optimal soil conditions",
      icon: "🌱"
    },
    {
      title: "Smart Planting",
      description: "Precision seeding for maximum yield",
      icon: "🪴"
    },
    {
      title: "Crop Monitoring",
      description: "Real-time tracking of field conditions",
      icon: "📱"
    },
    {
      title: "Eco Irrigation",
      description: "Water-efficient systems",
      icon: "💧"
    },
    {
      title: "Quality Harvest",
      description: "Timely collection at peak ripeness",
      icon: "✂️"
    },
    {
      title: "Market Connect",
      description: "Direct access to premium markets",
      icon: "🛒"
    }
  ];

  return (
    <div className="home-page">
      {/* Modern Hero Carousel */}
      <section className="hero-carousel">
        <Slider {...carouselSettings}>
          <div className="hero-slide slide-1">
            <div className="hero-content">
              <h1>Limphasa Rice Excellence</h1>
              <p className="subtitle">Where tradition meets modern agriculture</p>
              <div className="cta-container">
                <Link to="/dashboard" className="cta-button primary">
                  Explore Dashboard
                </Link>
                <Link to="/about" className="cta-button secondary">
                  Our Story
                </Link>
              </div>
            </div>
          </div>
          <div className="hero-slide slide-2">
            <div className="hero-content">
              <h1>Premium Quality Rice</h1>
              <p className="subtitle">Nurtured from seed to shelf</p>
              <div className="cta-container">
                <Link to="/products" className="cta-button primary">
                  Our Products
                </Link>
              </div>
            </div>
          </div>
          <div className="hero-slide slide-3">
            <div className="hero-content">
              <h1>Farmer Community</h1>
              <p className="subtitle">Empowering growers through innovation</p>
              <div className="cta-container">
                <Link to="/join" className="cta-button primary">
                  Join Us
                </Link>
              </div>
            </div>
          </div>
        </Slider>
      </section>

      {/* Modern Features Grid */}
      <section className="modern-features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Innovative Approach</h2>
            <p className="section-subtitle">Transforming rice farming through technology and tradition</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="feature-wave"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rice Journey */}
      <section className="rice-journey">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">The Rice Journey</h2>
            <p className="section-subtitle">From our fields to your table</p>
          </div>
          <div className="journey-steps">
            <div className="journey-card">
              <div className="journey-image" style={{backgroundImage: "url('/rice1.jpg')"}}></div>
              <div className="journey-content">
                <span className="step-number">01</span>
                <h3>Land Preparation</h3>
                <p>Our team prepares the fields using sustainable methods that protect the soil ecosystem while ensuring optimal growing conditions.</p>
              </div>
            </div>
            <div className="journey-card reverse">
              <div className="journey-image" style={{backgroundImage: "url('/rice2.jpg')"}}></div>
              <div className="journey-content">
                <span className="step-number">02</span>
                <h3>Planting Season</h3>
                <p>Using carefully selected seeds and precision planting techniques to maximize yield potential and resource efficiency.</p>
              </div>
            </div>
            <div className="journey-card">
              <div className="journey-image" style={{backgroundImage: "url('/rice3.jpg')"}}></div>
              <div className="journey-content">
                <span className="step-number">03</span>
                <h3>Crop Growth</h3>
                <p>Regular monitoring and care using both traditional knowledge and modern agricultural technology.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stat-item">
            <div className="stat-value">500+</div>
            <div className="stat-label">Farmers Empowered</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">1000+</div>
            <div className="stat-label">Acres Cultivated</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">5</div>
            <div className="stat-label">Processing Centers</div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="modern-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>Limphasa Rice Scheme</h3>
              <p>Nurturing Africa's Rice Bowl</p>
            </div>
            <div className="footer-links">
              <div className="link-group">
                <h4>Explore</h4>
                <Link to="/about">About Us</Link>
                <Link to="/farmers">Our Farmers</Link>
                <Link to="/process">Our Process</Link>
              </div>
              <div className="link-group">
                <h4>Connect</h4>
                <Link to="/contact">Contact</Link>
                <Link to="/careers">Careers</Link>
                <Link to="/visit">Visit Us</Link>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Limphasa Rice Scheme. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}