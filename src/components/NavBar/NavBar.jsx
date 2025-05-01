import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import "./NavBar.scss";

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    if (isAuthenticated && !user?.firstName) {
      // If user is authenticated but firstName is missing, log the user out (optional)
      console.error("User's first name is missing from Redux state!");
    }
  }, [isAuthenticated, user]);

  return (
    <>
      <div className="mainNav">
        <p className="logo">LOGO</p>
        <h1 className="navText">NDAKU</h1>

        <div className="hamburger" onClick={toggleMenu}>
          {isMobileMenuOpen ? (
            <FaTimes size={30} color="white" />
          ) : (
            <FaBars size={30} color="white" />
          )}
        </div>

        <div className={`navLinks ${isMobileMenuOpen ? "active" : ""}`}>
          <Link to="/home" className="navLink" onClick={toggleMenu}>
            Home
          </Link>
          <Link to="/for-rent" className="navLink" onClick={toggleMenu}>
            For Rent
          </Link>
          <Link to="/for-sale" className="navLink" onClick={toggleMenu}>
            For Sale
          </Link>
          <Link to="/contact-us" className="navLink" onClick={toggleMenu}>
            Contact Us
          </Link>
          <Link to="/faq" className="navLink" onClick={toggleMenu}>
            FAQ
          </Link>
          <Link to="/about-us" className="navLink" onClick={toggleMenu}>
            About Us
          </Link>

          <div className="authLinks">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="login" onClick={toggleMenu}>
                  Login
                </Link>
                <Link to="/signup" className="signup" onClick={toggleMenu}>
                  Signup
                </Link>
              </>
            ) : (
              <>
                <span className="navLink">
                  Hi{user?.firstName ? `, ${user.firstName}` : ""}
                </span>
                <Link to="#" className="navLink" onClick={handleLogout}>
                  Logout
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NavBar;
