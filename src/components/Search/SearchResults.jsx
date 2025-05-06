import React from "react";
import MapWithListings from "./MapWithListings";
import "./SearchResults.scss";

const SearchResults = ({ results, location, isLoading, error }) => {
  return (
    <div className="search-results-container">
      <h2 className="search-results-title">
        {location ? `Résultats pour "${location}"` : "Résultats de la recherche"}
      </h2>
      
      {/* Pass the search results to MapWithListings */}
      <MapWithListings 
        location={location} 
        preloadedListings={results} 
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default SearchResults;