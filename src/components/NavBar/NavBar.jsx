import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaChevronDown } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import "./NavBar.scss";

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/home");
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="mainNav">
      <Link to="/" className="logo-link">
        <span className="sr-only">Home</span>
      </Link>

      <div className="hamburger" onClick={toggleMenu}>
        {isMobileMenuOpen ? (
          <FaTimes size={24} color="white" />
        ) : (
          <FaBars size={24} color="white" />
        )}
      </div>

      <div className={`navLinks ${isMobileMenuOpen ? "active" : ""}`}>
        <div className="authLinks">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="login"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Se connecter
              </Link>
              <Link
                to="/signup"
                className="signup"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                S'inscrire
              </Link>
            </>
          ) : (
            <div className="user-menu-container" ref={userMenuRef}>
              <div className="user-menu-trigger" onClick={toggleUserMenu}>
                <span className="navLink">
                  Salut{user?.firstName ? `, ${user.firstName}` : ""}
                </span>
                <FaChevronDown
                  size={14}
                  className={`chevron ${isUserMenuOpen ? "open" : ""}`}
                />
              </div>

              {isUserMenuOpen && (
                <div className="user-dropdown">
                  {isAuthenticated && (
                    <Link
                      to="/list-property"
                      className="listPropertyBtn"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Publier un bien
                    </Link>
                  )}
                  <button onClick={handleLogout}>Se déconnecter</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;

