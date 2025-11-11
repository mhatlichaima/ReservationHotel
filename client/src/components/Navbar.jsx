import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { assets } from "../assets/assets";
import LoginModal from "./auth/LoginModal";
import axios from "axios";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";

const Navbar = () => {
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Hotels", path: "/rooms" },
    { name: "Experience", path: "/" },
    { name: "About", path: "/" },
  ];

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const location = useLocation();

  // ✅ Récupérer toutes les données du contexte
  const { 
    user, 
    login, 
    logout, 
    navigate, 
    isOwner, 
    setShowHotelReg,
    hasHotels,
    userHotels,
    fetchUserHotels
  } = useAppContext();

  // ✅ Debug: Voir l'état actuel
  useEffect(() => {
    console.log("🔄 Navbar - User:", user);
    console.log("🔄 Navbar - isOwner:", isOwner);
    console.log("🔄 Navbar - User role:", user?.role);
    console.log("🔄 Navbar - hasHotels:", hasHotels);
    console.log("🔄 Navbar - userHotels count:", userHotels?.length);
  }, [user, isOwner, hasHotels, userHotels]);

  useEffect(() => {
    if (location.pathname !== "/") setIsScrolled(true);
    else setIsScrolled(false);

    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  // ✅ Handle login - CORRIGÉ
  const handleLogin = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:3001/api/auth/login", {
        email,
        password,
      });

      if (res.data.success) {
        console.log("✅ Login Response - User role:", res.data.user.role);
        login(res.data.user, res.data.token);
        
        // ✅ Recharger les hôtels après le login si c'est un owner
        if (res.data.user.role === "host" || res.data.user.role === "admin") {
          setTimeout(() => {
            fetchUserHotels();
          }, 1000);
        }
        
        setIsLoginOpen(false);
        toast.success(`Welcome back, ${res.data.user.username}!`);
      } else {
        toast.error(res.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || "Login failed. Please check your credentials.";
      toast.error(errorMessage);
    }
  };

  // ✅ Gérer le clic sur le bouton principal - CORRIGÉ
  const handleMainButtonClick = () => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }

    if (hasHotels) {
      // ✅ SI L'UTILISATEUR A DES HÔTELS : REDIRIGER VERS LE DASHBOARD
      navigate("/owner");
      console.log("📍 Redirecting to owner dashboard - Hotels count:", userHotels?.length);
    } else {
      // ✅ SI L'UTILISATEUR N'A PAS D'HÔTELS : OUVIR LE MODAL D'ENREGISTREMENT
      setShowHotelReg(true);
      console.log("📍 Opening hotel registration modal - No hotels yet");
    }
  };

  // ✅ NOUVELLE FONCTION : Accéder au profil utilisateur
  const handleUserProfileClick = () => {
    navigate("/profile");
    setIsMenuOpen(false); // Fermer le menu mobile si ouvert
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 transition-all duration-500 z-50 ${
          isScrolled
            ? "bg-white/80 shadow-md text-gray-700 backdrop-blur-lg py-3 md:py-4"
            : "py-4 md:py-6"
        }`}
      >
        {/* Logo */}
        <Link to="/">
          <img
            src={assets.logo}
            alt="logo"
            className={`h-9 ${isScrolled && "invert opacity-80"}`}
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8">
          {navLinks.map((link, i) => (
            <Link
              key={i}
              to={link.path}
              className={`group flex flex-col gap-0.5 ${
                isScrolled ? "text-gray-700" : "text-white"
              }`}
            >
              {link.name}
              <div
                className={`${
                  isScrolled ? "bg-gray-700" : "bg-white"
                } h-0.5 w-0 group-hover:w-full transition-all duration-300`}
              />
            </Link>
          ))}
          
          {/* ✅ BOUTON PRINCIPAL : "LIST YOUR HOTEL" ou "DASHBOARD" */}
          {user && (isOwner || user.role === "host" || user.role === "admin") && (
            <button
              className={`border px-4 py-1 text-sm font-light rounded-full cursor-pointer hover:bg-opacity-10 hover:bg-gray-500 transition-all ${
                isScrolled 
                  ? hasHotels 
                    ? "text-green-600 border-green-600 hover:bg-green-50" 
                    : "text-black border-black hover:bg-gray-100"
                  : hasHotels
                    ? "text-green-300 border-green-300 hover:bg-green-900/20"
                    : "text-white border-white hover:bg-white/10"
              }`}
              onClick={handleMainButtonClick}
            >
              {hasHotels ? "Dashboard" : "List Your Hotel"}
            </button>
          )}
        </div>

        {/* Right Section */}
        <div className="hidden md:flex items-center gap-4">
          <img
            src={assets.searchIcon}
            alt="search"
            className={`${isScrolled && "invert"} h-7 transition-all duration-500 cursor-pointer`}
          />

          {user ? (
            <div className="flex items-center gap-3">
              {/* ✅ USER INFO - MAINTENANT CLIQUABLE */}
              <div 
                className="flex items-center gap-2 cursor-pointer group"
                onClick={handleUserProfileClick}
              >
                {user.image ? (
                  <img 
                    src={user.image} 
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover group-hover:ring-2 group-hover:ring-blue-500 transition-all"
                  />
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center group-hover:ring-2 group-hover:ring-blue-500 transition-all ${
                    isScrolled ? "bg-gray-200 text-gray-700" : "bg-white/20 text-white"
                  }`}>
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className={`text-sm group-hover:text-blue-600 transition-colors ${
                  isScrolled ? "text-gray-700" : "text-white"
                }`}>
                  {user.username}
                </span>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={logout}
                className={`px-6 py-2 rounded-full transition-all duration-500 ${
                  isScrolled 
                    ? "text-white bg-black hover:bg-gray-800" 
                    : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginOpen(true)}
              className={`px-8 py-2.5 rounded-full ml-4 transition-all duration-500 ${
                isScrolled 
                  ? "text-white bg-black hover:bg-gray-800" 
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className={`w-6 h-6 ${isScrolled ? "text-gray-700" : "text-white"}`}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/95 z-40 md:hidden pt-20">
          <div className="flex flex-col items-center gap-6 p-8">
            {navLinks.map((link, i) => (
              <Link
                key={i}
                to={link.path}
                className="text-white text-xl"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <>
                {/* ✅ USER INFO MOBILE - CLIQUABLE */}
                <div 
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => {
                    handleUserProfileClick();
                    setIsMenuOpen(false);
                  }}
                >
                  {user.image ? (
                    <img 
                      src={user.image} 
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover group-hover:ring-2 group-hover:ring-blue-500 transition-all"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 text-white group-hover:ring-2 group-hover:ring-blue-500 transition-all">
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-white text-lg font-medium group-hover:text-blue-400 transition-colors">
                      {user.username}
                    </div>
                    <div className="text-gray-300 text-sm group-hover:text-blue-300 transition-colors">
                      Voir mon profil
                    </div>
                  </div>
                </div>
                
                {/* ✅ BOUTON PRINCIPAL MOBILE */}
                {(isOwner || user.role === "host" || user.role === "admin") && (
                  <button
                    className={`border px-6 py-2 rounded-full ${
                      hasHotels 
                        ? "border-green-400 text-green-400" 
                        : "border-white text-white"
                    }`}
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleMainButtonClick();
                    }}
                  >
                    {hasHotels ? "Dashboard" : "List Your Hotel"}
                  </button>
                )}
                
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="bg-white text-black px-8 py-2 rounded-full"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setIsLoginOpen(true);
                  setIsMenuOpen(false);
                }}
                className="bg-white text-black px-8 py-2 rounded-full"
                >
                Login
              </button>
            )}
          </div>
        </div>
      )}

      {/* ✅ Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
      />
    </>
  );
};

export default Navbar;