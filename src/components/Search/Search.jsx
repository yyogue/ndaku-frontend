import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchLocationData } from "../../redux/slices/locationSlice";
import API from "../../services/api";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const justSelected = useRef(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchLocationData());
    }
  }, [dispatch, status]);

  // Handle clicks outside the suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm.length > 1 && !justSelected.current) {
      // Group suggestions by type for better organization
      const filteredQuartiers = quartiers
        .filter((item) =>
          item.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        )
        .map((item) => ({ text: item, type: "quartier" }));

      const filteredCommunes = communes
        .filter((item) =>
          item.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        )
        .map((item) => ({ text: item, type: "commune" }));

      const filteredDistricts = districts
        .filter((item) =>
          item.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        )
        .map((item) => ({ text: item, type: "district" }));

      const filteredVilles = villes
        .filter((item) =>
          item.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        )
        .map((item) => ({ text: item, type: "ville" }));

      // Combine all suggestions with their types
      const allSuggestions = [
        ...filteredQuartiers,
        ...filteredCommunes,
        ...filteredDistricts,
        ...filteredVilles,
      ];

      // Sort alphabetically within each group
      allSuggestions.sort((a, b) => a.text.localeCompare(b.text));

      // Limit to 15 suggestions for better UX
      const limitedSuggestions = allSuggestions.slice(0, 15);

      setSuggestions(limitedSuggestions);
      setShowSuggestions(limitedSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      justSelected.current = false;
    }
  }, [debouncedSearchTerm, quartiers, communes, districts, villes]);

  const handleSuggestionClick = (suggestion) => {
    justSelected.current = true;
    setSearchTerm(suggestion.text);
    setSuggestions([]);
    setShowSuggestions(false);

    // Navigate directly to search results with filter in URL
    const queryParams = new URLSearchParams();
    queryParams.set(suggestion.type, suggestion.text);

    navigate({
      pathname: "/search-results",
      search: queryParams.toString(),
    });
  };

  const handleSearch = () => {
    if (searchTerm.trim().length < 2) {
      return; // Don't search if term is too short
    }

    // Try to determine the type of location
    let locationType = null;

    if (quartiers.includes(searchTerm)) {
      locationType = "quartier";
    } else if (communes.includes(searchTerm)) {
      locationType = "commune";
    } else if (districts.includes(searchTerm)) {
      locationType = "district";
    } else if (villes.includes(searchTerm)) {
      locationType = "ville";
    }

    // If we found a location type, navigate with that parameter
    if (locationType) {
      const queryParams = new URLSearchParams();
      queryParams.set(locationType, searchTerm);

      navigate({
        pathname: "/search-results",
        search: queryParams.toString(),
      });
    } else {
      // If no specific location type found, use generic search
      navigate(`/search-results?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (showSuggestions && suggestions.length > 0) {
        // Select the first suggestion on Enter
        handleSuggestionClick(suggestions[0]);
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    } else if (e.key === "ArrowDown" && showSuggestions) {
      // Focus the first suggestion
      const suggestionElements = suggestionsRef.current?.querySelectorAll("li");
      if (suggestionElements?.length > 0) {
        suggestionElements[0].focus();
      }
    }
  };

  const handleSuggestionKeyDown = (e, index) => {
    const suggestionElements = suggestionsRef.current?.querySelectorAll("li");
    if (!suggestionElements || suggestionElements.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = (index + 1) % suggestionElements.length;
      suggestionElements[nextIndex].focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex =
        (index - 1 + suggestionElements.length) % suggestionElements.length;
      suggestionElements[prevIndex].focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSuggestionClick(suggestions[index]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
  };

  const handleFocus = () => {
    if (
      searchTerm.length > 1 &&
      suggestions.length > 0 &&
      !justSelected.current
    ) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="searchBox">
      <div className="searchContainer">
        <div className="searchInputContainer">
          <div className="inputWrapper">
            <FaMapMarkerAlt className="searchIcon" />
            <input
              ref={inputRef}
              type="text"
              className="searchInput"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => {
                justSelected.current = false;
                setSearchTerm(e.target.value);
                if (e.target.value.length > 1) {
                  setShowSuggestions(true);
                } else {
                  setShowSuggestions(false);
                }
              }}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
              aria-label="Recherche de location"
              aria-expanded={showSuggestions}
              aria-autocomplete="list"
              aria-controls={
                showSuggestions ? "location-suggestions" : undefined
              }
            />
            {searchTerm && (
              <button
                className="clearButton"
                onClick={() => {
                  setSearchTerm("");
                  setShowSuggestions(false);
                  inputRef.current?.focus();
                }}
                aria-label="Effacer la recherche"
              >
                ×
              </button>
            )}
            <button
              className={`searchButton ${isLoading ? "loading" : ""}`}
              onClick={handleSearch}
              disabled={isLoading || searchTerm.trim().length < 2}
              aria-label="Lancer la recherche"
            >
              {isLoading ? (
                <span className="loadingSpinner"></span>
              ) : (
                <FaSearch className="searchButtonIcon" />
              )}
            </button>
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <ul
              className="suggestionsList"
              ref={suggestionsRef}
              id="location-suggestions"
              role="listbox"
            >
              {suggestions.map((suggestion, index) => (
                <li
                  key={`${suggestion.type}-${suggestion.text}-${index}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onKeyDown={(e) => handleSuggestionKeyDown(e, index)}
                  tabIndex="0"
                  role="option"
                  aria-selected={false}
                >
                  <span className="suggestionText">{suggestion.text}</span>
                  <span className="suggestionType">
                    {suggestion.type === "quartier"
                      ? "Quartier"
                      : suggestion.type === "commune"
                      ? "Commune"
                      : suggestion.type === "district"
                      ? "District"
                      : suggestion.type === "ville"
                      ? "Ville"
                      : suggestion.type}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {error && <div className="errorMessage">{error}</div>}

      {searchTerm.length > 0 && suggestions.length === 0 && showSuggestions && (
        <div className="noResults">
          Aucune suggestion trouvée pour "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default Search;
