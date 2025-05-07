import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MapWithListings from "./MapWithListings";
import PropertyFilter from "./PropertyFilter/PropertyFilter";
import API from "../../services/api";
import "./SearchResults.scss";

const SearchResults = ({ location }) => {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilters, setActiveFilters] = useState({});

  // Extract filters from URL parameters on initial load and when URL changes
  useEffect(() => {
    // Get parameters from URL
    const searchParams = new URLSearchParams(routeLocation.search);
    
    // Create a new filters object based on URL parameters
    const filtersFromUrl = {};
    
    // Check for each location type parameter in the URL
    const locationTypes = ['quartier', 'commune', 'district', 'ville', 'search'];
    locationTypes.forEach(type => {
      const value = searchParams.get(type);
      if (value) {
        filtersFromUrl[type] = value;
      }
    });
    
    // Check for other filter parameters
    ['typeOfListing', 'listingType', 'priceMin', 'priceMax', 'bedroom', 'bathroom'].forEach(param => {
      const value = searchParams.get(param);
      if (value) {
        filtersFromUrl[param] = value;
      }
    });
    
    console.log("SearchResults - URL parameters:", searchParams.toString());
    console.log("SearchResults - Filters from URL:", filtersFromUrl);
    
    // Update active filters if URL parameters exist
    if (Object.keys(filtersFromUrl).length > 0) {
      setActiveFilters(filtersFromUrl);
    }
    // Also handle state-based navigation if present
    else if (location?.state?.searchTerm && location?.state?.locationType) {
      const stateFilters = {
        [location.state.locationType]: location.state.searchTerm
      };
      console.log("SearchResults - Filters from state:", stateFilters);
      setActiveFilters(stateFilters);
    }
  }, [routeLocation.search, location]);

  // Fetch listings when activeFilters change
  useEffect(() => {
    console.log("SearchResults - Active filters changed:", activeFilters);
    if (Object.keys(activeFilters).length > 0) {
      fetchListings();
    }
  }, [activeFilters]);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      
      // Build query params from active filters
      const queryParams = new URLSearchParams();
      
      // Add all active filters to query
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value) {
          queryParams.set(key, value);
        }
      });
      
      console.log("SearchResults - Fetching with parameters:", queryParams.toString());
      
      // Make API request with the exact parameters needed
      const response = await API.get(`/listings?${queryParams.toString()}`);
      
      // Handle different API response structures
      let listings = Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.listings || [];
      
      console.log("SearchResults - API response:", response.data);
      console.log("SearchResults - Listings count:", listings.length);
      
      setResults(listings);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError("Une erreur s'est produite lors de la recherche. Veuillez réessayer.");
      setIsLoading(false);
    }
  };

  // Update URL when filters change (to make filters shareable)
  useEffect(() => {
    if (Object.keys(activeFilters).length > 0) {
      const queryParams = new URLSearchParams();
      
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value) {
          queryParams.set(key, value);
        }
      });
      
      // Update URL without triggering a re-render
      const newUrl = `${routeLocation.pathname}?${queryParams.toString()}`;
      window.history.replaceState(null, '', newUrl);
    }
  }, [activeFilters, routeLocation.pathname]);

  // Handle filter changes from the PropertyFilter component
  const handleFilterChange = (filters) => {
    console.log("SearchResults - Filter change from PropertyFilter:", filters);
    setActiveFilters(filters);
  };

  // Get location display name for the title
  const getLocationTitle = () => {
    // Check for each location type in activeFilters
    const locationTypes = ['quartier', 'commune', 'district', 'ville'];
    for (const type of locationTypes) {
      if (activeFilters[type]) {
        const typeName = {
          'quartier': 'Quartier',
          'commune': 'Commune', 
          'district': 'District',
          'ville': 'Ville'
        }[type];
        return `${typeName} "${activeFilters[type]}"`;
      }
    }
    
    // If a search term is present
    if (activeFilters.search) {
      return `"${activeFilters.search}"`;
    }
    
    return "Résultats de la recherche";
  };

  return (
    <div className="search-results-container">
      <h2 className="search-results-title">
        Résultats pour {getLocationTitle()}
      </h2>
      
      {/* Property Filter Component with initialFilters */}
      <PropertyFilter 
        onFilterChange={handleFilterChange} 
        initialFilters={activeFilters}
      />
      
      {/* Map With Listings Component */}
      <MapWithListings 
        preloadedListings={results} 
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default SearchResults;
