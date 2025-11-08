import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { assets } from "../assets/assets";
import LoginModal from "./auth/LoginModal"; // ✅ import modal
import axios from "axios";

const Navbar = () => {
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Hotels", path: "/rooms" },
    { name: "Experience", path: "/" },
    { name: "About", path: "/" },
  ];

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false); // ✅ modal state
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/") setIsScrolled(true);
    else setIsScrolled(false);

    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  // ✅ handle login request
  const handleLogin = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:3001/api/auth/login", {
        email,
        password,
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        setIsLoginOpen(false);
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      alert("Login failed. Please check your credentials.");
    }
  };

  // ✅ logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
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
            <a
              key={i}
              href={link.path}
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
            </a>
          ))}
          {user && (
            <button
              className={`border px-4 py-1 text-sm font-light rounded-full cursor-pointer ${
                isScrolled ? "text-black" : "text-white"
              } transition-all`}
              onClick={() => navigate("/owner")}
            >
              Dashboard
            </button>
          )}
        </div>

        {/* Right Section */}
        <div className="hidden md:flex items-center gap-4">
          <img
            src={assets.searchIcon}
            alt="search"
            className={`${isScrolled && "invert"} h-7 transition-all duration-500`}
          />

          {user ? (
            <button
              onClick={handleLogout}
              className={`px-8 py-2.5 rounded-full ml-4 transition-all duration-500 ${
                isScrolled ? "text-white bg-black" : "bg-white text-black"
              }`}
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => setIsLoginOpen(true)} // ✅ open modal
              className={`px-8 py-2.5 rounded-full ml-4 transition-all duration-500 ${
                isScrolled ? "text-white bg-black" : "bg-white text-black"
              }`}
            >
              Login
            </button>
          )}
        </div>
      </nav>

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
