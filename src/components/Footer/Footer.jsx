import React from "react";
import "./Footer.scss";

const Footer = () => {
  return (
    <footer className="mainFooter">
      <div className="footerContent">
        <div className="footerLogo">
          <h2>LOGO</h2>
          <p>Votre service de confiance pour trouver des appartements à Kinshasa.</p>
        </div>
        <div className="footerNav">
          <h4>Quick Links</h4>
          <ul>
            <li>Home</li>
            <li>Listings</li>
            <li>About</li>
            <li>Contact</li>
          </ul>
        </div>
        <div className="footerContact">
          <h4>Contact</h4>
          <p>Email: info@example.com</p>
          <p>Phone: +243 123 456 789</p>
        </div>
      </div>
      <div className="footerBottom">
        <p>&copy; {new Date().getFullYear()} Ndaku. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
