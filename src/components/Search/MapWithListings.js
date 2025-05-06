import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import API from "../../services/api";
import "./MapWithListings.scss";
import { useMediaQuery } from "react-responsive";

// Fix for Leaflet icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker component
const createCustomIcon = (active) => {
  return L.divIcon({
    className: `custom-marker ${active ? 'active' : ''}`,
    html: `<div class="marker-inner">${active ? '<div class="pulse"></div>' : ''}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
};

// Map center updater component
const MapCenterUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 14);
    }
  }, [center, map]);
  return null;
};

// Image Carousel Component
const ImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };
  
  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  
  const goToSlide = (index, e) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };
  
  return (
    <div className="image-carousel">
      <div 
        className="carousel-images" 
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="carousel-image">
            <img src={image} alt={`Property view ${index + 1}`} loading="lazy" />
          </div>
        ))}
      </div>
      
      {images.length > 1 && (
        <>
          <div className="carousel-nav">
            <button className="carousel-button prev" onClick={handlePrev}>
              <i className="fas fa-chevron-left"></i>
            </button>
            <button className="carousel-button next" onClick={handleNext}>
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
          
          <div className="carousel-dots">
            {images.map((_, index) => (
              <div 
                key={index} 
                className={`dot ${index === currentIndex ? 'active' : ''}`} 
                onClick={(e) => goToSlide(index, e)}
              ></div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const MapWithListings = ({ location, preloadedListings, isLoading, error }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);
  const [mapCenter, setMapCenter] = useState([-4.3276, 15.3136]); // Kinshasa center
  const [mapVisible, setMapVisible] = useState(true);
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  const isDesktop = useMediaQuery({ minWidth: 992 });
  const isMobile = useMediaQuery({ maxWidth: 991 });
  const mapRef = useRef(null);
  
  // Determine if we should show the map based on screen size and toggle state
  const showMap = isDesktop || (isMobile && mapVisible);
  
  useEffect(() => {
    // If preloaded listings are provided (from search results), use them directly
    if (preloadedListings) {
      setListings(preloadedListings);
      setLoading(false);
      
      // Calculate map center from first listing with coordinates
      if (preloadedListings.length > 0) {
        const listingWithCoords = preloadedListings.find(l => l.latitude && l.longitude);
        if (listingWithCoords) {
          setMapCenter([listingWithCoords.latitude, listingWithCoords.longitude]);
        }
      }
      return;
    }
    
    // Otherwise fetch listings from API
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await API.get("/listings");
        let allListings = Array.isArray(response.data)
          ? response.data
          : response.data?.data || response.data?.listings || [];

        // Filter by location if provided
        if (location) {
          allListings = allListings.filter((listing) => {
            const locationFields = [
              listing.ville,
              listing.district,
              listing.commune,
              listing.quartier,
              listing.address,
            ];
            return locationFields.some((field) =>
              field?.toLowerCase().includes(location.toLowerCase())
            );
          });
        }

        setListings(allListings);
        
        // Calculate map bounds if we have listings with coordinates
        if (allListings.length > 0) {
          const listingWithCoords = allListings.find(l => l.latitude && l.longitude);
          if (listingWithCoords) {
            setMapCenter([listingWithCoords.latitude, listingWithCoords.longitude]);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching listings:", err);
        setFetchError("Failed to load listings. Please try again later.");
        setLoading(false);
      }
    };

    fetchListings();
  }, [location, preloadedListings]);

  // Sort listings
  const sortedListings = React.useMemo(() => {
    let sortedList = [...listings];
    
    switch (sortBy) {
      case 'price-low':
        return sortedList.sort((a, b) => {
          const priceA = a.priceMonthly || a.priceSale || a.priceDaily || 0;
          const priceB = b.priceMonthly || b.priceSale || b.priceDaily || 0;
          return priceA - priceB;
        });
      case 'price-high':
        return sortedList.sort((a, b) => {
          const priceA = a.priceMonthly || a.priceSale || a.priceDaily || 0;
          const priceB = b.priceMonthly || b.priceSale || b.priceDaily || 0;
          return priceB - priceA;
        });
      case 'bedrooms':
        return sortedList.sort((a, b) => {
          const bedroomsA = a.details?.bedroom || 0;
          const bedroomsB = b.details?.bedroom || 0;
          return bedroomsB - bedroomsA;
        });
      case 'newest':
        return sortedList.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });
      default:
        return sortedList;
    }
  }, [listings, sortBy]);

  const handleMarkerClick = (listingId) => {
    setActiveMarker(activeMarker === listingId ? null : listingId);
    
    // Find the listing
    const listing = listings.find(l => l._id === listingId);
    if (listing && listing.latitude && listing.longitude) {
      setMapCenter([listing.latitude, listing.longitude]);
    }
    
    // Scroll to the clicked listing card
    if (activeMarker !== listingId) {
      const element = document.getElementById(`listing-${listingId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleListingCardHover = (listingId) => {
    if (isDesktop) {
      setActiveMarker(listingId);
    }
  };

  const handleListingCardLeave = () => {
    if (isDesktop) {
      setActiveMarker(null);
    }
  };

  const toggleMapVisibility = () => {
    setMapVisible(!mapVisible);
  };

  const getListingPrice = (listing) => {
    if (listing.listingType === "rent") return `$${listing.priceMonthly?.toLocaleString()}/mo`;
    if (listing.listingType === "sale") return `$${listing.priceSale?.toLocaleString()}`;
    if (listing.listingType === "daily") return `$${listing.priceDaily?.toLocaleString()}/day`;
    return "";
  };

  // Use provided error and loading states if they exist, otherwise use local state
  const displayLoading = isLoading !== undefined ? isLoading : loading;
  const displayError = error || fetchError;

  if (displayLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading properties...</p>
      </div>
    );
  }

  if (displayError) {
    return (
      <div className="error-container">
        <i className="fas fa-exclamation-circle"></i>
        <h2>Oops! Something went wrong</h2>
        <p>{displayError}</p>
      </div>
    );
  }

  return (
    <div className="apartments-container">
      {/* Mobile Map Toggle */}
      {isMobile && (
        <div className="mobile-map-toggle">
          <button onClick={toggleMapVisibility}>
            {mapVisible ? (
              <>
                <i className="fas fa-list"></i> Voir la liste
              </>
            ) : (
              <>
                <i className="fas fa-map-marked-alt"></i> Voir la carte
              </>
            )}
          </button>
        </div>
      )}

      <div className={`apartments-layout ${showMap ? 'show-map' : 'hide-map'}`}>
        {/* Map Section */}
        {showMap && (
          <div className="map-section">
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              ref={mapRef}
              whenCreated={(map) => {
                // Fit bounds to markers if we have them
                if (listings.some(l => l.latitude && l.longitude)) {
                  const markerBounds = L.latLngBounds(
                    listings
                      .filter(l => l.latitude && l.longitude)
                      .map(l => [l.latitude, l.longitude])
                  );
                  map.fitBounds(markerBounds);
                }
              }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <MapCenterUpdater center={mapCenter} />
              
              {sortedListings
                .filter(listing => listing.latitude && listing.longitude)
                .map((listing) => (
                  <Marker
                    key={listing._id}
                    position={[listing.latitude, listing.longitude]}
                    icon={createCustomIcon(activeMarker === listing._id)}
                    eventHandlers={{
                      click: () => handleMarkerClick(listing._id),
                    }}
                  >
                    <Popup>
                      <div className="map-popup">
                        <div className="popup-image">
                          {listing.images?.length > 0 ? (
                            <img
                              src={listing.images[0]}
                              alt={listing.typeOfListing}
                            />
                          ) : (
                            <div className="no-image">
                              <i className="fas fa-home"></i>
                            </div>
                          )}
                        </div>
                        <div className="popup-content">
                          <h4>{listing.typeOfListing}</h4>
                          <p className="popup-address">{listing.address || ''}{listing.quartier ? `, ${listing.quartier}` : ''}</p>
                          <p className="popup-price">{getListingPrice(listing)}</p>
                          <div className="popup-features">
                            <span>{listing.details?.bedroom || 0} ch</span>
                            <span>{listing.details?.bathroom || 0} sdb</span>
                          </div>
                          <a href={`/listing/${listing._id}`} className="popup-link">
                            Voir détails
                          </a>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>
        )}

        {/* Listings Section */}
        <div className="listings-section">
          <div className="listings-header">
            <div className="listings-count">
              <h2>{listings.length} {listings.length === 1 ? 'propriété' : 'propriétés'}</h2>
              <p>{location ? `à ${location}` : ''}</p>
            </div>
            
            <div className="listings-controls">
              
              <div className="view-control">
                <button 
                  className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Affichage en grille"
                >
                  <i className="fas fa-th-large"></i>
                </button>
                <button 
                  className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="Affichage en liste"
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>
            </div>
          </div>
          
          {listings.length === 0 ? (
            <div className="no-results">
              <i className="fas fa-home"></i>
              <p>Aucun résultat trouvé {location && `à ${location}`}</p>
            </div>
          ) : (
            <div className={`listings-grid ${viewMode}`}>
              {sortedListings.map((listing) => (
                <div
                  id={`listing-${listing._id}`}
                  key={listing._id}
                  className={`listing-card ${
                    activeMarker === listing._id ? "active" : ""
                  } ${viewMode}`}
                  onClick={() => handleMarkerClick(listing._id)}
                  onMouseEnter={() => handleListingCardHover(listing._id)}
                  onMouseLeave={handleListingCardLeave}
                >
                  <div className="listing-image">
                    {listing.images?.length > 0 ? (
                      // Replace static image with carousel for multiple images
                      listing.images.length > 1 ? (
                        <ImageCarousel images={listing.images} />
                      ) : (
                        <img
                          src={listing.images[0]}
                          alt={listing.typeOfListing}
                          loading="lazy"
                        />
                      )
                    ) : (
                      <div className="no-image">
                        <i className="fas fa-home"></i>
                      </div>
                    )}
                    <div className="listing-badge">
                      {listing.listingType === "rent" && "À Louer"}
                      {listing.listingType === "sale" && "À Vendre"}
                      {listing.listingType === "daily" && "Journalier"}
                    </div>
                    
                    {listing.images?.length > 1 && (
                      <div className="image-count">
                        <i className="fas fa-camera"></i> {listing.images.length}
                      </div>
                    )}
                  </div>
                  
                  <div className="listing-info">
                    <div className="listing-primary">
                      <h3 className="listing-title">{listing.typeOfListing}</h3>
                      <div className="listing-price">{getListingPrice(listing)}</div>
                    </div>
                    
                    <p className="listing-location">
                      <i className="fas fa-map-marker-alt"></i> {listing.address || ''}{listing.quartier ? `, ${listing.quartier}` : ''}
                    </p>
                    
                    <div className="listing-features">
                      <span>
                        <i className="fas fa-bed"></i> {listing.details?.bedroom || 0} chambre{listing.details?.bedroom !== 1 ? 's' : ''}
                      </span>
                      <span>
                        <i className="fas fa-bath"></i> {listing.details?.bathroom || 0} salle{listing.details?.bathroom !== 1 ? 's' : ''} de bain
                      </span>
                      {listing.details?.propertySize && (
                        <span>
                          <i className="fas fa-vector-square"></i> {listing.details.propertySize} m²
                        </span>
                      )}
                    </div>
                    
                    {/* Additional details shown in list view */}
                    {viewMode === 'list' && listing.description && (
                      <p className="listing-description">
                        {listing.description.length > 150 
                          ? `${listing.description.substring(0, 150)}...` 
                          : listing.description
                        }
                      </p>
                    )}
                    
                    <div className="listing-actions">
                      <a href={`/listing/${listing._id}`} className="view-details">
                        Voir les détails
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapWithListings;
