import React from "react";
import Search from "../Search/Search";
import Message from "../Message/Message";
import FeaturedListings from "../FeaturedListings/FeaturedListings";
import Footer from "../Footer/Footer";

const Home = () => {
  return (
    <div>
      <Search />
      <Message />
      <FeaturedListings />
      <Footer />
    </div>
  );
};

export default Home;
