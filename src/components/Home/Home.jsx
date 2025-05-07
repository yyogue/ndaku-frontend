import React, { useState } from "react";
import Search from "../Search/Search";
import Message from "../Message/Message";
import FeaturedListings from "../FeaturedListings/FeaturedListings";
import Footer from "../Footer/Footer";
import "./Home.scss"; // Create this file for styling

const Home = () => {
  const [filteredListings, setFilteredListings] = useState(null);

  return (
    <div className="home-container">
      {/* Hero section with background image */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="kin">KINSHASA</h1>
          {/* <p>
            Découvrez les meilleures propriétés à l'emplacement de votre choix
          </p> */}
          <Search setFilteredListings={setFilteredListings} />
        </div>
      </div>

      <Message />
      <FeaturedListings filteredListings={filteredListings} />
      <Footer />
    </div>
  );
};

export default Home;
