import React, { useState, useEffect } from "react";
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

const PropertyFilter = ({ onFilterChange, initialFilters }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Get location data from Redux store
  const { quartiers, communes, districts, villes, status, relationships } = useSelector(
    (state) => state.location
  );

  // Get current filters from URL parameters
  const searchParams = new URLSearchParams(location.search);

  // Set initial state from props, URL params, or default values
  const [filters, setFilters] = useState(() => {
    // Start with empty filters
    const defaultFilters = {
      commune: "",
      quartier: "",
      district: "",
      ville: "Kinshasa", // Default to Kinshasa
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

  // State to track if filters are expanded (mobile)
  const [isExpanded, setIsExpanded] = useState(false);
  
  // State to track available options for dependent dropdowns
  const [availableCommunes, setAvailableCommunes] = useState([]);
  const [availableQuartiers, setAvailableQuartiers] = useState([]);

  // Fetch location data if not already loaded
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchLocationData());
    }
  }, [dispatch, status]);

  // Apply initialFilters when they change
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
  }, [initialFilters, onFilterChange]);

  // Update available communes when district changes
  useEffect(() => {
    if (filters.district && relationships?.districtToCommunes) {
      const communesForDistrict = relationships.districtToCommunes[filters.district] || [];
      setAvailableCommunes(communesForDistrict);
      
      // If current commune is not in the list of available communes, reset it
      if (filters.commune && !communesForDistrict.includes(filters.commune)) {
        setFilters(prev => ({ ...prev, commune: "", quartier: "" }));
      }
      
      // Apply filter immediately when district changes
      const updatedFilters = {
        ...filters,
        district: filters.district,
        commune: filters.commune && communesForDistrict.includes(filters.commune) ? filters.commune : "",
        quartier: ""
      };
      
      // Update URL and notify parent
      updateUrlAndNotify(updatedFilters);
    } else {
      // If no district selected, show all communes
      setAvailableCommunes(communes || []);
    }
  }, [filters.district, communes, relationships]);

  // Update available quartiers when commune changes
  useEffect(() => {
    if (filters.commune && relationships?.communeToQuartiers) {
      const quartiersForCommune = relationships.communeToQuartiers[filters.commune] || [];
      setAvailableQuartiers(quartiersForCommune);
      
      // If current quartier is not in the list of available quartiers, reset it
      if (filters.quartier && !quartiersForCommune.includes(filters.quartier)) {
        setFilters(prev => ({ ...prev, quartier: "" }));
      }
      
      // Apply filter immediately when commune changes
      const updatedFilters = {
        ...filters,
        commune: filters.commune,
        quartier: filters.quartier && quartiersForCommune.includes(filters.quartier) ? filters.quartier : ""
      };
      
      // Update URL and notify parent
      updateUrlAndNotify(updatedFilters);
    } else {
      // If no commune selected, show empty quartiers list
      setAvailableQuartiers([]);
    }
  }, [filters.commune, relationships]);

  // Helper function to update URL and notify parent component
  const updateUrlAndNotify = (updatedFilters) => {
    // Build query string from non-empty filters
    const queryParams = new URLSearchParams();

    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value) {
        queryParams.set(key, value);
      }
    });

    // Update URL with filters (but don't navigate to avoid page reload)
    const newUrl = `${location.pathname}?${queryParams.toString()}`;
    window.history.replaceState({}, '', newUrl);

    // Pass filters to parent component to filter listings
    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
  };

  // Available options for static dropdowns
  const propertyTypes = [
    "apartment",
    "house",
    "land",
  ];
  const listingTypes = ["rent", "sale", "daily"];
  const bedroomOptions = ["1", "2", "3", "4", "5+"];
  const bathroomOptions = ["1", "2", "3", "4+"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle cascading selection for location filters
    if (name === "district") {
      setFilters({ 
        ...filters, 
        [name]: value,
        commune: "", // Reset commune when district changes
        quartier: ""  // Reset quartier when district changes
      });
      
      // When district changes, let parent component know immediately
      if (onFilterChange && value) {
        onFilterChange({
          ...filters,
          district: value,
          commune: "",
          quartier: ""
        });
      }
    } else if (name === "commune") {
      setFilters({ 
        ...filters, 
        [name]: value,
        quartier: ""  // Reset quartier when commune changes
      });
      
      // When commune changes, let parent component know immediately
      if (onFilterChange && value) {
        onFilterChange({
          ...filters,
          commune: value,
          quartier: ""
        });
      }
    } else if (name === "quartier") {
      setFilters({ 
        ...filters, 
        [name]: value
      });
      
      // When quartier changes, let parent component know immediately
      if (onFilterChange && value) {
        onFilterChange({
          ...filters,
          quartier: value
        });
      }
    } else {
      setFilters({ ...filters, [name]: value });
    }
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
      ville: "Kinshasa", // Keep default ville
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
      ville: params.get("ville") || "Kinshasa",
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
  }, [location.search, filters, initialFilters]);

  // Calculate active filter count for badge
  const getActiveFilterCount = () => {
    // Don't count ville as active filter since it's always set to Kinshasa
    return Object.entries(filters)
      .filter(([key, value]) => key !== 'ville' && value !== "")
      .length;
  };

  // Toggle filter expansion (mobile)
  const toggleFilters = () => {
    setIsExpanded(!isExpanded);
  };

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
                {/* Hidden Ville Filter - Always set to Kinshasa */}
                <input 
                  type="hidden" 
                  name="ville" 
                  value={filters.ville} 
                />

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
                    {filters.district && availableCommunes.length > 0 
                      ? availableCommunes.map((commune) => (
                          <option key={commune} value={commune}>
                            {commune}
                          </option>
                        ))
                      : communes && communes.map((commune) => (
                          <option key={commune} value={commune}>
                            {commune}
                          </option>
                        ))}
                  </select>
                </div>
              </div>

              <div className="filter-row">
                {/* Quartier Filter */}
                <div className="filter-group full-width">
                  <select
                    id="quartier"
                    name="quartier"
                    value={filters.quartier}
                    onChange={handleChange}
                    disabled={status === "loading" || !filters.commune}
                    aria-label="Quartier"
                  >
                    <option value="">Quartier</option>
                    {filters.commune && availableQuartiers.length > 0
                      ? availableQuartiers.map((quartier) => (
                          <option key={quartier} value={quartier}>
                            {quartier}
                          </option>
                        ))
                      : []}
                  </select>
                </div>
              </div>
            </div>

            {/* Property Info Filters Group */}
            {/* <div className="filter-category">
              <h4>
                <FaHome /> Propriété
              </h4>
              <div className="filter-row">
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
                          : type === "land"
                          ? "Terrain"
                          : type}
                      </option>
                    ))}
                  </select>
                </div>

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
            </div> */}

            {/* Price Filter Group - Commented out as in your original code */}
            {/* <div className="filter-category price-category">
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
            </div> */}
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
