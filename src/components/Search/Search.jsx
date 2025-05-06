import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchLocationData } from "../../redux/slices/locationSlice";
import axios from "../../services/api";
import "./Search.scss";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

const Search = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { quartiers, communes, districts, villes, status } = useSelector(
    (state) => state.location
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const justSelected = useRef(false); // Track if we just selected a suggestion

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchLocationData());
    }
  }, [dispatch, status]);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm.length > 1 && !justSelected.current) {
      const filtered = [
        ...quartiers.filter((item) =>
          item.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        ),
        ...communes.filter((item) =>
          item.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        ),
        ...districts.filter((item) =>
          item.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        ),
        ...villes.filter((item) =>
          item.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        ),
      ];
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      justSelected.current = false; // Reset the flag
    }
  }, [debouncedSearchTerm, quartiers, communes, districts, villes]);

  const handleSuggestionClick = (suggestion) => {
    justSelected.current = true; // Set flag to prevent immediate re-show
    setSearchTerm(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSearch = async () => {
    try {
      const res = await axios.get("/listings");
      const listings = res.data.listings || [];
      const filtered = listings.filter((listing) => {
        const locationFields = [
          listing.ville,
          listing.district,
          listing.commune,
          listing.quartier,
          listing.address,
        ];
        return locationFields.some((field) =>
          field?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      navigate("/search-results", { state: { results: filtered } });
    } catch (error) {
      console.error("Error searching listings:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (!justSelected.current) {
        setShowSuggestions(false);
      }
    }, 200);
  };

  const handleFocus = () => {
    if (searchTerm.length > 1 && suggestions.length > 0 && !justSelected.current) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="searchBox">
      <div className="searchContainer">
        <div className="searchInputContainer">
          <input
            type="text"
            className="searchInput"
            placeholder="Rechercher par location"
            value={searchTerm}
            onChange={(e) => {
              justSelected.current = false;
              setSearchTerm(e.target.value);
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
          {showSuggestions && (
            <ul className="suggestionsList">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button className="searchButton" onClick={handleSearch}>
          Rechercher
        </button>
      </div>
    </div>
  );
};

export default Search;
