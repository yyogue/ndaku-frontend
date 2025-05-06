import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import Logo from "../Logo/logo"
import "./NavBar.scss";



const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/home");
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    if (isAuthenticated && !user?.firstName) {
      console.error("User's first name is missing from Redux state!");
    }
  }, [isAuthenticated, user]);

  return (
    <div className="mainNav">
      <Link to="/">
        <span className="navLink">LOGO</span>
        {/* < Logo /> */}
      </Link>
      <h1 className="navText">NDAKU</h1>

      <div className="hamburger" onClick={toggleMenu}>
        {isMobileMenuOpen ? (
          <FaTimes size={30} color="white" />
        ) : (
          <FaBars size={30} color="white" />
        )}
      </div>

      <div className={`navLinks ${isMobileMenuOpen ? "active" : ""}`}>
        {isAuthenticated && (
          <Link to="/list-property" className="listPropertyBtn" onClick={toggleMenu}>
            Publier un bien
          </Link>
        )}

        <div className="authLinks">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="login" onClick={toggleMenu}>
                Se connecter
              </Link>
              <Link to="/signup" className="signup" onClick={toggleMenu}>
                S'inscrire
              </Link>
            </>
          ) : (
            <>
              <span className="navLink">
                Salut{user?.firstName ? `, ${user.firstName}` : ""}
              </span>
              <Link to="/home" className="navLink" onClick={handleLogout}>
                Se déconnecter
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavBar;
