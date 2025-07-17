import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useAuth } from "../components/AuthContext";
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const { authToken, user } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!authToken);
  }, [authToken]);

  const handleLogout = async () => {
    const refresh = localStorage.getItem('refresh');

    try {
      if (refresh) {
        await axios.post('http://localhost:8000/logout/', { refresh });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }

    localStorage.clear();
    setIsAuthenticated(false);
    setMenuOpen(false);

    Swal.fire({
      icon: 'success',
      title: 'Logged Out',
      text: 'You have been logged out successfully.',
      timer: 1500,
      showConfirmButton: false,
    });

    navigate('/login');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    // Toggle body scroll when menu is open
    document.body.style.overflow = menuOpen ? 'auto' : 'hidden';
  };

  // Close menu when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest('.navbar-container')) {
        setMenuOpen(false);
        document.body.style.overflow = 'auto';
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Role helpers
  const role = user?.role || '';
  const isAdminOrPresident = ['admin', 'president'].includes(role);
  const isTreasurer = role === 'treasurer';
  const isSecretary = role === 'secretary';
  const isBlockChair = role === 'block_chair';

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="navbar-container">
        <Link 
          className="navbar-brand" 
          to="/" 
          onClick={() => {
            setMenuOpen(false);
            document.body.style.overflow = 'auto';
          }}
          aria-label="Home"
        >
          <span className="logo-icon">🌾</span>
          <span className="brand-text">Limphasa Rice Scheme</span>
        </Link>

        <button
          className={`mobile-toggle ${menuOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          aria-controls="navbar-menu"
        >
          <span className="toggle-bar"></span>
          <span className="toggle-bar"></span>
          <span className="toggle-bar"></span>
        </button>

        <div 
          className={`navbar-menu ${menuOpen ? 'active' : ''}`}
          id="navbar-menu"
        >
          <ul className="navbar-links">
            {/* Public links */}
            <li className="nav-item">
              <Link 
                className="nav-link" 
                to="/aboutUs" 
                onClick={() => {
                  setMenuOpen(false);
                  document.body.style.overflow = 'auto';
                }}
                aria-label="About Us"
              >
                About Us
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className="nav-link" 
                to="/contactUs" 
                onClick={() => {
                  setMenuOpen(false);
                  document.body.style.overflow = 'auto';
                }}
                aria-label="Contact Us"
              >
                Contact Us
              </Link>
            </li>

            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link 
                    className="nav-link" 
                    to="/dashboard" 
                    onClick={() => {
                      setMenuOpen(false);
                      document.body.style.overflow = 'auto';
                    }}
                    aria-label="Dashboard"
                  >
                    Dashboard
                  </Link>
                </li>

                {(isAdminOrPresident || isSecretary) && (
                  <li className="nav-item">
                    <Link 
                      className="nav-link" 
                      to="/farmers" 
                      onClick={() => {
                        setMenuOpen(false);
                        document.body.style.overflow = 'auto';
                      }}
                      aria-label="Farmers"
                    >
                      Farmers
                    </Link>
                  </li>
                )}

                {!isTreasurer && (
                  <li className="nav-item">
                    <Link 
                      className="nav-link" 
                      to="/attendance" 
                      onClick={() => {
                        setMenuOpen(false);
                        document.body.style.overflow = 'auto';
                      }}
                      aria-label="Attendance"
                    >
                      Attendance
                    </Link>
                  </li>
                )}

                {(isAdminOrPresident || isTreasurer) && (
                  <li className="nav-item">
                    <Link 
                      className="nav-link" 
                      to="/payments" 
                      onClick={() => {
                        setMenuOpen(false);
                        document.body.style.overflow = 'auto';
                      }}
                      aria-label="Payments"
                    >
                      Payments
                    </Link>
                  </li>
                )}

                <li className="nav-item">
                  <Link 
                    className="nav-link" 
                    to="/discipline" 
                    onClick={() => {
                      setMenuOpen(false);
                      document.body.style.overflow = 'auto';
                    }}
                    aria-label="Discipline"
                  >
                    Discipline
                  </Link>
                </li>

                <li className="nav-item">
                  <button 
                    className="logout-btn" 
                    onClick={handleLogout}
                    aria-label="Logout"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link 
                    className="nav-link" 
                    to="/login" 
                    onClick={() => {
                      setMenuOpen(false);
                      document.body.style.overflow = 'auto';
                    }}
                    aria-label="Login"
                  >
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className="nav-link register-btn" 
                    to="/register" 
                    onClick={() => {
                      setMenuOpen(false);
                      document.body.style.overflow = 'auto';
                    }}
                    aria-label="Register"
                  >
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}