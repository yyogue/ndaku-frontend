import React from "react";
import "./Search.scss";

const Search = () => {
  return (
    <div className="searchBox">
      <div className="searchContainer">
        <input
          className="searchInput"
          type="search"
          placeholder="Rechercher une commune..."
        />
        <button className="searchButton">🔍</button>
      </div>
    </div>
  );
};

export default Search;
