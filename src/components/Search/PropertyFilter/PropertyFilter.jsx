import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchLocationData } from "../../../redux/slices/locationSlice";
import {
  FaFilter,
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaHome,
  FaTag,
  FaDollarSign,
  FaChevronDown,
  FaTimes,
} from "react-icons/fa";
import API from "../../../services/api";
import "./PropertyFilter.scss";

// Update the props to accept initialFilters
const PropertyFilter = ({ onFilterChange, initialFilters }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Get location data from Redux store
  const { quartiers, communes, districts, villes, status } = useSelector(
    (state) => state.location
  );

  // Get current filters from URL parameters
  const searchParams = new URLSearchParams(location.search);

  // Set initial state from props, URL params, or default values
  // Priority: initialFilters > URL params > empty
  const [filters, setFilters] = useState(() => {
    // Start with empty filters
    const defaultFilters = {
      commune: "",
      quartier: "",
      district: "",
      ville: "",
      typeOfListing: "",
      listingType: "",
      priceMin: "",
      priceMax: "",
      bedroom: "",
      bathroom: "",
    };

    // Add URL parameters if present
    for (const key of Object.keys(defaultFilters)) {
      const value = searchParams.get(key);
      if (value) {
        defaultFilters[key] = value;
      }
    }

    // Override with initialFilters if provided
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      return { ...defaultFilters, ...initialFilters };
    }

    return defaultFilters;
  });

  // Apply initialFilters when they change (e.g. when coming from search)
  useEffect(() => {
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      setFilters(prevFilters => ({
        ...prevFilters,
        ...initialFilters
      }));
      
      // Notify parent about initial filters
      if (onFilterChange) {
        onFilterChange(initialFilters);
      }
    }
  }, [initialFilters]);

  // State to track if filters are expanded (mobile)
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch location data if not already loaded
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchLocationData());
    }
  }, [dispatch, status]);

  // Available options for static dropdowns
  const propertyTypes = [
    "apartment",
    "house",
    // "studio",
    // "villa",
    // "office",
    "land",
  ];
  const listingTypes = ["rent", "sale", "daily"];
  const bedroomOptions = ["1", "2", "3", "4", "5+"];
  const bathroomOptions = ["1", "2", "3", "4+"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Build query string from non-empty filters
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.set(key, value);
      }
    });

    // Update URL with filters
    navigate({
      pathname: location.pathname,
      search: queryParams.toString(),
    });

    // Pass filters to parent component
    if (onFilterChange) {
      onFilterChange(filters);
    }

    // Collapse filter on mobile after submit
    setIsExpanded(false);
  };

  const clearFilters = () => {
    const emptyFilters = {
      commune: "",
      quartier: "",
      district: "",
      ville: "",
      typeOfListing: "",
      listingType: "",
      priceMin: "",
      priceMax: "",
      bedroom: "",
      bathroom: "",
    };
    
    setFilters(emptyFilters);

    // Clear URL params
    navigate(location.pathname);

    // Pass empty filters to parent component
    if (onFilterChange) {
      onFilterChange(emptyFilters);
    }
  };

  // Track changes to URL and update filters accordingly
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlFilters = {
      commune: params.get("commune") || "",
      quartier: params.get("quartier") || "",
      district: params.get("district") || "",
      ville: params.get("ville") || "",
      typeOfListing: params.get("typeOfListing") || "",
      listingType: params.get("listingType") || "",
      priceMin: params.get("priceMin") || "",
      priceMax: params.get("priceMax") || "",
      bedroom: params.get("bedroom") || "",
      bathroom: params.get("bathroom") || "",
    };

    // Only update state if filters actually changed and not coming from initialFilters
    if (JSON.stringify(urlFilters) !== JSON.stringify(filters) && 
        !(initialFilters && Object.keys(initialFilters).length > 0)) {
      setFilters(urlFilters);
    }
  }, [location.search]);

  // Calculate active filter count for badge
  const getActiveFilterCount = () => {
    return Object.values(filters).filter((value) => value !== "").length;
  };

  // Toggle filter expansion (mobile)
  const toggleFilters = () => {
    setIsExpanded(!isExpanded);
  };

  // Debug: log the current filters and initialFilters
  useEffect(() => {
    console.log("PropertyFilter - Current filters:", filters);
    console.log("PropertyFilter - Initial filters:", initialFilters);
    console.log("PropertyFilter - URL params:", searchParams.toString());
  }, [filters, initialFilters, searchParams]);

  return (
    <div className="property-filter">
      {/* Mobile Filter Toggle */}
      <div className="filter-mobile-toggle">
        <button onClick={toggleFilters} className="toggle-button">
          <FaFilter /> Filtres
          {getActiveFilterCount() > 0 && (
            <span className="filter-badge">{getActiveFilterCount()}</span>
          )}
          <FaChevronDown
            className={`toggle-icon ${isExpanded ? "expanded" : ""}`}
          />
        </button>
      </div>

      {/* Filter Container */}
      <div className={`filter-container ${isExpanded ? "expanded" : ""}`}>
        <div className="filter-header">
          <h3>
            <FaFilter /> Filtres
          </h3>
          {getActiveFilterCount() > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="clear-all-button"
            >
              <FaTimes /> Effacer tout
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="filter-grid">
            {/* Location Filters Group */}
            <div className="filter-category">
              <h4>
                <FaMapMarkerAlt /> Localisation
              </h4>
              <div className="filter-row">
                {/* Ville Filter */}
                <div className="filter-group">
                  <select
                    id="ville"
                    name="ville"
                    value={filters.ville}
                    onChange={handleChange}
                    disabled={status === "loading"}
                    aria-label="Ville"
                  >
                    <option value="">Ville</option>
                    {villes &&
                      villes.map((ville) => (
                        <option key={ville} value={ville}>
                          {ville}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Commune Filter */}
                <div className="filter-group">
                  <select
                    id="commune"
                    name="commune"
                    value={filters.commune}
                    onChange={handleChange}
                    disabled={status === "loading"}
                    aria-label="Commune"
                  >
                    <option value="">Commune</option>
                    {communes &&
                      communes.map((commune) => (
                        <option key={commune} value={commune}>
                          {commune}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="filter-row">
                {/* District Filter */}
                <div className="filter-group">
                  <select
                    id="district"
                    name="district"
                    value={filters.district}
                    onChange={handleChange}
                    disabled={status === "loading"}
                    aria-label="District"
                  >
                    <option value="">District</option>
                    {districts &&
                      districts.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Quartier Filter */}
                <div className="filter-group">
                  <select
                    id="quartier"
                    name="quartier"
                    value={filters.quartier}
                    onChange={handleChange}
                    disabled={status === "loading"}
                    aria-label="Quartier"
                  >
                    <option value="">Quartier</option>
                    {quartiers &&
                      quartiers.map((quartier) => (
                        <option key={quartier} value={quartier}>
                          {quartier}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Property Info Filters Group */}
            <div className="filter-category">
              <h4>
                <FaHome /> Propriété
              </h4>
              <div className="filter-row">
                {/* Property Type Filter */}
                <div className="filter-group">
                  <select
                    id="typeOfListing"
                    name="typeOfListing"
                    value={filters.typeOfListing}
                    onChange={handleChange}
                    aria-label="Type de propriété"
                  >
                    <option value="">Type</option>
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type === "apartment"
                          ? "Appartement"
                          : type === "house"
                          ? "Maison"
                          : type === "studio"
                          ? "Studio"
                          : type === "villa"
                          ? "Villa"
                          : type === "office"
                          ? "Bureau"
                          : type === "land"
                          ? "Terrain"
                          : type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Listing Type Filter */}
                <div className="filter-group">
                  <select
                    id="listingType"
                    name="listingType"
                    value={filters.listingType}
                    onChange={handleChange}
                    aria-label="Type d'annonce"
                  >
                    <option value="">Statut</option>
                    {listingTypes.map((type) => (
                      <option key={type} value={type}>
                        {type === "rent"
                          ? "À Louer"
                          : type === "sale"
                          ? "À Vendre"
                          : type === "daily"
                          ? "Journalier"
                          : type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="filter-row">
                {/* Bedrooms Filter */}
                <div className="filter-group">
                  <div className="input-with-icon">
                    <FaBed className="input-icon" />
                    <select
                      id="bedroom"
                      name="bedroom"
                      value={filters.bedroom}
                      onChange={handleChange}
                      aria-label="Chambres"
                    >
                      <option value="">Chambres</option>
                      {bedroomOptions.map((option) => (
                        <option
                          key={option}
                          value={option === "5+" ? "5" : option}
                        >
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Bathrooms Filter */}
                <div className="filter-group">
                  <div className="input-with-icon">
                    <FaBath className="input-icon" />
                    <select
                      id="bathroom"
                      name="bathroom"
                      value={filters.bathroom}
                      onChange={handleChange}
                      aria-label="Salles de bain"
                    >
                      <option value="">Sdb</option>
                      {bathroomOptions.map((option) => (
                        <option
                          key={option}
                          value={option === "4+" ? "4" : option}
                        >
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Filter Group */}
            <div className="filter-category price-category">
              <h4>
                <FaDollarSign /> Prix
              </h4>
              <div className="filter-row">
                <div className="price-inputs">
                  <input
                    type="number"
                    name="priceMin"
                    placeholder="Min"
                    value={filters.priceMin}
                    onChange={handleChange}
                    min="0"
                    aria-label="Prix minimum"
                  />
                  <span className="price-separator">-</span>
                  <input
                    type="number"
                    name="priceMax"
                    placeholder="Max"
                    value={filters.priceMax}
                    onChange={handleChange}
                    min="0"
                    aria-label="Prix maximum"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="filter-actions">
            <button
              type="button"
              onClick={clearFilters}
              className="clear-button"
            >
              Réinitialiser
            </button>
            <button type="submit" className="apply-button">
              Appliquer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyFilter;

