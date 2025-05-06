import React, { useState } from "react";
import Search from "../Search/Search";
import Message from "../Message/Message";
import FeaturedListings from "../FeaturedListings/FeaturedListings";
import Footer from "../Footer/Footer";

const Home = () => {
  const [filteredListings, setFilteredListings] = useState(null);

  return (
    <div>
      <Search setFilteredListings={setFilteredListings} />
      <Message />
      <FeaturedListings filteredListings={filteredListings} />
      <Footer />
    </div>
  );
};

export default Home;
