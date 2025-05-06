import React from "react";
import FeaturedListings from "../FeaturedListings/FeaturedListings";

const SearchResults = ({ results }) => {
  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Résultats de la recherche</h2>
      <FeaturedListings listings={results} />
    </div>
  );
};

export default SearchResults;
