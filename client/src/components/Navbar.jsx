import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import LoginModal from "./auth/LoginModal";
import axios from "axios";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";

const Navbar = () => {
  const navLinks = [
    { name: "Accueil", path: "/", icon: "icon-home" },
    { name: "Hôtels", path: "/rooms", icon: "icon-hotel" },
    { name: "Recommandations", path: "/recommendations", icon: "icon-recommendations" },
    { name: "Mes Réservations", path: "/my-bookings", icon: "icon-bookings" },
  ];

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const { 
    user, 
    login, 
    logout, 
    isOwner, 
    setShowHotelReg,
    hasHotels,
    userHotels,
    fetchUserHotels
  } = useAppContext();

  useEffect(() => {
    const handleScroll = () => {
      const scroll = window.scrollY > 20;
      setIsScrolled(scroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:3001/api/auth/login", {
        email,
        password,
      });

      if (res.data.success) {
        login(res.data.user, res.data.token);
        
        if (res.data.user.role === "host" || res.data.user.role === "admin") {
          setTimeout(() => {
            fetchUserHotels();
          }, 1000);
        }
        
        setIsLoginOpen(false);
        toast.success(`Bienvenue, ${res.data.user.username} !`);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Échec de la connexion";
      toast.error(errorMessage);
    }
  };

  const handleHostAction = () => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }

    if (hasHotels) {
      navigate("/owner");
    } else {
      setShowHotelReg(true);
    }
    setIsUserMenuOpen(false);
  };

  const handleProfileClick = () => {
    console.log("🎯 Navigation vers le profil");
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    navigate("/profile");
  };

  const handleBookingsClick = () => {
    console.log("🎯 Navigation vers les réservations");
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    navigate("/my-bookings");
  };

  const handleLogoutClick = () => {
    console.log("🎯 Déconnexion");
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    logout();
    setTimeout(() => navigate('/'), 100);
    toast.success("Déconnexion réussie !");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
      
      if (isMenuOpen && !event.target.closest('.mobile-menu') && !event.target.closest('.mobile-toggle')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen, isMenuOpen]);

  const isActiveLink = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? "navbar-scrolled" : ""}`}>
        <div className="navbar-container">
          
          {/* Logo */}
          <Link to="/" className="navbar-brand">
            <img src={assets.logo} alt="HotelHub" className="brand-logo" />
            <span className="brand-text">HotelHub</span>
          </Link>

          {/* Navigation Desktop */}
          <div className="navbar-links">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${isActiveLink(link.path) ? "nav-link-active" : ""}`}
              >
                <span className={`nav-icon ${link.icon}`}></span>
                <span className="nav-text">{link.name}</span>
                <div className="nav-indicator"></div>
              </Link>
            ))}
          </div>

          {/* Actions Desktop - CORRECTION STRUCTURELLE */}
          <div className="navbar-actions">
            {user ? (
              <div className="user-actions-wrapper">
                {/* ✅ CORRECTION : BOUTON DASHBOARD À DROITE DU MENU UTILISATEUR */}
                {(isOwner || user?.role === "host" || user?.role === "admin") && (
                  <button
                    onClick={handleHostAction}
                    className={`host-btn ${hasHotels ? "host-btn-dashboard" : "host-btn-list"}`}
                  >
                    <span className={`btn-icon ${hasHotels ? "icon-dashboard" : "icon-become-host"}`}></span>
                    <span className="btn-text">
                      {hasHotels ? "Dashboard" : "Devenir Hôte"}
                    </span>
                  </button>
                )}

                {/* Menu utilisateur */}
                <div className="user-menu-container">
                  <button
                    className="user-trigger"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <div className="user-avatar">
                      {user.image ? (
                        <img src={user.image} alt={user.username} />
                      ) : (
                        <div className="avatar-placeholder">
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="user-name">{user.username}</span>
                    <span className={`dropdown-arrow ${isUserMenuOpen ? "rotate" : ""}`}>
                      ▼
                    </span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="user-menu">
                      <div className="user-info">
                        <div className="user-avatar large">
                          {user.image ? (
                            <img src={user.image} alt={user.username} />
                          ) : (
                            <div className="avatar-placeholder">
                              {user.username?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="user-details">
                          <div className="user-name">{user.username}</div>
                          <div className="user-email">{user.email}</div>
                        </div>
                      </div>

                      <div className="menu-divider"></div>

                      <button className="menu-item" onClick={handleProfileClick}>
                        <span className="menu-icon">👤</span>
                        Mon Profil
                      </button>

                      <button className="menu-item" onClick={handleBookingsClick}>
                        <span className="menu-icon">📋</span>
                        Mes Réservations
                      </button>

                      <div className="menu-divider"></div>

                      <button className="menu-item logout-btn" onClick={handleLogoutClick}>
                        <span className="menu-icon">🚪</span>
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Boutons Connexion/Inscription pour utilisateurs non connectés
              <div className="auth-buttons">
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="login-btn"
                >
                  Connexion
                </button>
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="signup-btn"
                >
                  Inscription
                </button>
              </div>
            )}
          </div>

          {/* Menu Mobile Toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className={`hamburger ${isMenuOpen ? "hamburger-open" : ""}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>

        {/* Menu Mobile */}
        <div className={`mobile-menu ${isMenuOpen ? "mobile-menu-open" : ""}`}>
          <div className="mobile-menu-content">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`mobile-nav-link ${isActiveLink(link.path) ? "mobile-nav-link-active" : ""}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className={`mobile-nav-icon ${link.icon}`}></span>
                <span className="mobile-nav-text">{link.name}</span>
              </Link>
            ))}

            <div className="mobile-divider"></div>

            {user ? (
              <>
                <div className="mobile-user-info">
                  <div className="mobile-user-avatar">
                    {user.image ? (
                      <img src={user.image} alt={user.username} />
                    ) : (
                      <div className="mobile-avatar-placeholder">
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="mobile-user-details">
                    <div className="mobile-user-name">{user.username}</div>
                    <div className="mobile-user-email">{user.email}</div>
                  </div>
                </div>

                {/* Bouton Hôte dans le menu mobile */}
                {(isOwner || user.role === "host" || user.role === "admin") && (
                  <button
                    onClick={() => {
                      handleHostAction();
                      setIsMenuOpen(false);
                    }}
                    className="mobile-host-btn"
                  >
                    <span className={`mobile-btn-icon ${hasHotels ? "icon-dashboard" : "icon-become-host"}`}></span>
                    {hasHotels ? "Dashboard" : "Devenir Hôte"}
                  </button>
                )}

                <button className="mobile-menu-item" onClick={handleProfileClick}>
                  <span className="mobile-menu-icon">👤</span>
                  Mon Profil
                </button>

                <button className="mobile-menu-item" onClick={handleBookingsClick}>
                  <span className="mobile-menu-icon">📋</span>
                  Mes Réservations
                </button>

                <button className="mobile-menu-item mobile-logout" onClick={handleLogoutClick}>
                  <span className="mobile-menu-icon">🚪</span>
                  Déconnexion
                </button>
              </>
            ) : (
              <div className="mobile-auth-buttons">
                <button
                  onClick={() => {
                    setIsLoginOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="mobile-login-btn"
                >
                  Connexion
                </button>
                <button
                  onClick={() => {
                    setIsLoginOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="mobile-signup-btn"
                >
                  Inscription
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Overlay pour menu mobile */}
      {isMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* Overlay du menu utilisateur */}
      {isUserMenuOpen && (
        <div 
          className="user-menu-overlay"
          onClick={() => setIsUserMenuOpen(false)}
        ></div>
      )}

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
      />
    </>
  );
};

export default Navbar;