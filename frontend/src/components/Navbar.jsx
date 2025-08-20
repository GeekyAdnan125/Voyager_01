import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import LanguageChanger from "./LanguageChanger";
import { useAppContext } from "../context/AppContext";
import Profile from "../pages/Profile";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// Destinations for search
const searchDestinations = [
  { name: "Bishnupur", path: "/bishupur" },
  { name: "Doars", path: "/doars" },
  { name: "Jhargram", path: "/jhargram" },
  { name: "Kankrajhor", path: "/kankrajhor" },
  { name: "Ayodha Pahar", path: "/AyodhaPahar" },
  { name: "Jaldapara National Park", path: "/jaldapara" },
  { name: "Sandakhpu", path: "/sandakhpu" },
  { name: "Kalimpong", path: "/kalimpong" },
  { name: "Purulia", path: "/purulia" },
  { name: "Kashmir", path: "/kashmir" },
  { name: "Delhi", path: "/delhi" },
  { name: "Paris", path: "/paris" },
  { name: "Kerala", path: "/kerala" },
  { name: "Andaman", path: "/andaman" },
  { name: "Digha", path: "/digha" },
];

const Navbar = () => {
  const {
    profileOpen,
    setProfileOpen,
    sidebarOpen,
    setSidebarOpen,
    userDetails,
  } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const sidebarItems = [
    t("navbar.sidebarItems.home"),
    t("navbar.sidebarItems.weather"),
    t("navbar.sidebarItems.map"),
    t("navbar.sidebarItems.booking"),
    t("navbar.sidebarItems.community"),
    t("navbar.sidebarItems.emergency"),
    t("navbar.sidebarItems.contact"),
  ];

  // Progress bar on route change
  useEffect(() => {
    NProgress.start();
    NProgress.set(0.4);

    const timer = setTimeout(() => {
      NProgress.done();
    }, 500);

    return () => clearTimeout(timer);
  }, [location]);

  // Handle search input changes
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 0) {
      const results = searchDestinations.filter((destination) =>
        destination.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      NProgress.start(); // start loading
      navigate(searchResults[0].path);
      setSearchQuery("");
      setShowResults(false);
      setTimeout(() => {
        NProgress.done(); // complete after navigation
      }, 400);
    }
  };

  // Handle clicking on a search result
  const handleResultClick = (path) => {
    NProgress.start();
    navigate(path);
    window.scrollTo(0, 0);
    setSearchQuery("");
    setShowResults(false);
    setTimeout(() => {
      NProgress.done();
    }, 400);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showResults) {
        setShowResults(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showResults]);

  return (
    <>
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-gray-900 to-gray-800 fixed w-full h-16 top-0 z-50 backdrop-blur-md shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-full">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center space-x-4 ">
            {/* Hamburger */}
            <button
              className="relative w-8 h-8 focus:outline-none group"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={t("navbar.menuToggle")}
            >
              <span
                className={`absolute left-0 w-full h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out 
                ${
                  sidebarOpen
                    ? "top-1/2 transform -translate-y-1/2 rotate-45"
                    : "top-1/4"
                }`}
              ></span>
              <span
                className={`absolute left-0 w-full h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out 
                ${
                  sidebarOpen
                    ? "opacity-0"
                    : "top-1/2 transform -translate-y-1/2"
                }`}
              ></span>
              <span
                className={`absolute left-0 w-full h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out 
                ${
                  sidebarOpen
                    ? "top-1/2 transform -translate-y-1/2 -rotate-45"
                    : "top-3/4"
                }`}
              ></span>
            </button>

            {/* Logo */}
            <Link
              to="/"
              className="text-white text-2xl font-bold tracking-tight hover:text-cyan-400 transition-colors duration-300"
            >
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                {t("navbar.logoText")}
              </span>
            </Link>
          </div>

          {/* Right: Search + Auth/Profile */}
          <div className="flex items-center space-x-6">
            {/* Search bar */}
            <div className="relative hidden md:block">
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder={t("navbar.searchPlaceholder")}
                  className="transition-all duration-300 ease-in-out
         w-64 h-10 px-4 pl-10 rounded-full 
         bg-gray-800 text-white placeholder-gray-400
         border border-white 
         hover:w-72 focus:w-80 
         focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 
         text-sm shadow-sm"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  type="submit"
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-cyan-400"
                  aria-label={t("navbar.searchButton")}
                >
                  🔍
                </button>
              </form>

              {/* Search results */}
              {showResults && searchResults.length > 0 && (
                <div
                  className="absolute top-12 left-0 right-0 bg-gray-800 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto border border-gray-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 hover:bg-gray-700 cursor-pointer text-white flex items-center"
                      onClick={() => handleResultClick(result.path)}
                    >
                      📍 <span className="ml-2">{result.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Owner's Section */}
            {user?.role === "owner" && (
              <Link
                to="/hotelApp"
                className="hidden md:inline-block px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold ml-4 hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-pink-500/20"
              >
                Owner's section
              </Link>
            )}

            {/* Auth/Profile */}
            {user == null ? (
              <div className="flex gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md hover:shadow-cyan-500/20"
                >
                  {t("navbar.login")}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-full bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 transition shadow-md hover:shadow-white/20"
                >
                  {t("navbar.register")}
                </Link>
              </div>
            ) : (
              <button
                onClick={() => setProfileOpen(true)}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-400 hover:border-cyan-300 transition-all duration-200 shadow-md hover:shadow-cyan-400/30 relative"
                aria-label={t("navbar.profileButton")}
              >
                <img
                  src={
                    userDetails?.avatarUrl ||
                    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                  }
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      {/* ... keep your existing Sidebar & Profile code unchanged ... */}
      <Profile isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
};

export default Navbar;
