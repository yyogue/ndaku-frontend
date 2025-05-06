import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../services/api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./ListingDetail.scss";

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

const ListingDetail = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [relatedListings, setRelatedListings] = useState([]);
  const [position, setPosition] = useState([-4.3276, 15.3136]); // Default to Kinshasa center
  const [geocodeError, setGeocodeError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/listings/${id}`);
        const listingData = response.data;
        setListing(listingData);

        if (!response.data) {
          throw new Error("Listing data not found");
        }

        if (listingData.expiryDate) {
          const today = new Date();
          const expiryDate = new Date(listingData.expiryDate);
          const timeDiff = expiryDate.getTime() - today.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
          setDaysRemaining(daysDiff > 0 ? daysDiff : 0);
        }

        await geocodeAddress(listingData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching listing:", err);
        setError(
          "Failed to load the property details. Please try again later."
        );
        setLoading(false);
      }
    };

    const fetchRelatedListings = async () => {
      try {
        const response = await API.get("/listings");
        const allListings = Array.isArray(response.data)
          ? response.data
          : response.data?.data || response.data?.listings || [];

        const related = allListings
          .filter((item) => item._id !== id)
          .slice(0, 3);

        setRelatedListings(related);
      } catch (err) {
        console.error("Error fetching related listings:", err);
      }
    };

    const geocodeAddress = async (listingData) => {
      try {
        if (!listingData.address) {
          throw new Error("No address provided");
        }

        // Try Google Maps API if available
        if (process.env.REACT_APP_GOOGLE_MAPS_API_KEY) {
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                `${listingData.address}, ${listingData.quartier}, ${listingData.commune}, DR Congo`
              )}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
            );

            const data = await response.json();

            if (data.status === "OK" && data.results.length > 0) {
              const { lat, lng } = data.results[0].geometry.location;
              setPosition([lat, lng]);
              setGeocodeError(null);
              setMapLoaded(true);
              return;
            }
          } catch (err) {
            console.log("Google Geocoding failed, falling back to OSM");
          }
        }

        // Fallback to OpenStreetMap
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            `${listingData.address}, ${listingData.quartier}, ${listingData.commune}, DR Congo`
          )}`
        );

        const data = await response.json();

        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          setPosition([parseFloat(lat), parseFloat(lon)]);
          setGeocodeError(null);
          setMapLoaded(true);
        } else {
          throw new Error("Address not found");
        }
      } catch (err) {
        console.error("Geocoding error:", err);
        setGeocodeError(
          "Could not pinpoint exact location. Showing approximate area."
        );
        setPosition(getDistrictCoordinates(listingData.district));
        setMapLoaded(true);
      }
    };

    const getDistrictCoordinates = (district) => {
      const districtCoordinates = {
        Funa: [-4.3276, 15.3136], // Gombe area
        Lukunga: [-4.3317, 15.2667], // Ngaliema
        "Mont Amba": [-4.3833, 15.3333], // Lemba/Limete
        Tshangu: [-4.4167, 15.4167], // Masina/Ndjili
      };
      return districtCoordinates[district] || [-4.3276, 15.3136];
    };

    if (id) {
      fetchListing();
      fetchRelatedListings();
    }
  }, [id]);

  const handlePrevImage = () => {
    setActiveImageIndex(
      (prevIndex) =>
        (prevIndex - 1 + (listing.images?.length || 1)) %
        (listing.images?.length || 1)
    );
  };

  const handleNextImage = () => {
    setActiveImageIndex(
      (prevIndex) => (prevIndex + 1) % (listing.images?.length || 1)
    );
  };

  const handleDotClick = (index) => {
    setActiveImageIndex(index);
  };

  const openImageModal = () => {
    setShowModal(true);
  };

  const closeImageModal = (e) => {
    e.stopPropagation();
    setShowModal(false);
  };

  const getFeatureIcon = (feature) => {
    const icons = {
      bedroom: "fas fa-bed",
      bathroom: "fas fa-bath",
      kitchen: "fas fa-utensils",
      dinningRoom: "fas fa-chair",
      floor: "fas fa-building",
      parking: "fas fa-car",
      garden: "fas fa-tree",
      wifi: "fas fa-wifi",
    };
    return icons[feature] || "fas fa-home";
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading property details...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="error-container">
        <i className="fas fa-exclamation-circle"></i>
        <h2>Oops! Something went wrong</h2>
        <p>{error || "This listing could not be found."}</p>
        <Link to="/" className="back-button">
          Back to Home
        </Link>
      </div>
    );
  }

  const price =
    listing.listingType === "rent"
      ? listing.priceMonthly
      : listing.listingType === "sale"
      ? listing.priceSale
      : listing.listingType === "daily"
      ? listing.priceDaily
      : 0;

  const priceDisplay =
    listing.listingType === "rent"
      ? `$${price?.toLocaleString()}/month`
      : listing.listingType === "sale"
      ? `$${price?.toLocaleString()}`
      : listing.listingType === "daily"
      ? `$${price?.toLocaleString()}/day`
      : "";

  return (
    <div className="listing-detail-container">
      {/* Image Gallery Section */}
      <div className="listing-header">
        <div className="image-gallery">
          <div className="main-image-container">
            {listing.images?.length > 0 && (
              <>
                <img
                  src={listing.images[activeImageIndex]}
                  alt={`${listing.typeOfListing} ${activeImageIndex + 1}`}
                  className="main-image"
                  onClick={openImageModal}
                />
                {listing.images.length > 1 && (
                  <>
                    <button
                      className="gallery-nav prev"
                      onClick={handlePrevImage}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <button
                      className="gallery-nav next"
                      onClick={handleNextImage}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                    <div className="gallery-dots">
                      {listing.images.map((_, index) => (
                        <span
                          key={index}
                          className={`gallery-dot ${
                            index === activeImageIndex ? "active" : ""
                          }`}
                          onClick={() => handleDotClick(index)}
                        ></span>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {listing.images?.length > 1 && (
            <div className="thumbnail-container">
              {listing.images.slice(0, 5).map((image, index) => (
                <div
                  key={index}
                  className={`thumbnail ${
                    index === activeImageIndex ? "active" : ""
                  }`}
                  onClick={() => handleDotClick(index)}
                >
                  <img src={image} alt={`Thumbnail ${index + 1}`} />
                  {index === 4 && listing.images.length > 5 && (
                    <div className="more-photos">
                      +{listing.images.length - 5}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="listing-content">
        <div className="listing-main">
          {/* Property Header */}
          <div className="listing-title-section">
            <h1>
              {listing.typeOfListing} for{" "}
              {listing.listingType === "rent"
                ? "Rent"
                : listing.listingType === "sale"
                ? "Sale"
                : "Daily Rental"}
            </h1>
            <div className="listing-price">{priceDisplay}</div>
            <div className="listing-address">
              <i className="fas fa-map-marker-alt"></i>
              <span>
                {listing.address}, {listing.quartier}, {listing.commune},{" "}
                {listing.district}, {listing.ville}
              </span>
            </div>

            {daysRemaining > 0 && (
              <div className="listing-availability">
                <i className="far fa-calendar-alt"></i>
                <span>
                  Available for {daysRemaining} more{" "}
                  {daysRemaining === 1 ? "day" : "days"}
                </span>
              </div>
            )}
          </div>

          {/* Property Description */}
          {listing.description && (
            <div className="listing-description">
              <h2>Description</h2>
              <p>{listing.description}</p>
            </div>
          )}

          {/* Features Section */}
          <div className="listing-features-section">
            <h2>Property Features</h2>
            <div className="features-grid">
              {listing.details &&
                Object.entries(listing.details).map(([key, value]) => (
                  <div className="feature-item" key={key}>
                    <i className={getFeatureIcon(key)}></i>
                    <div className="feature-details">
                      <span className="feature-value">{value}</span>
                      <span className="feature-name">
                        {key === "bedroom"
                          ? "Bedrooms"
                          : key === "bathroom"
                          ? "Bathrooms"
                          : key === "dinningRoom"
                          ? "Dining Rooms"
                          : key === "floor"
                          ? "Floors"
                          : key.charAt(0).toUpperCase() + key.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Map Section */}
          <div className="listing-map-section">
            <h2>Location</h2>
            {geocodeError && (
              <div className="map-warning">
                <i className="fas fa-exclamation-triangle"></i> {geocodeError}
              </div>
            )}
            <div className="map-container">
              {mapLoaded && (
                <MapContainer
                  center={position}
                  zoom={15}
                  scrollWheelZoom={false}
                  style={{ height: "400px", width: "100%" }}
                  key={`${position[0]}-${position[1]}`}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={position}>
                    <Popup>
                      <strong>{listing.typeOfListing}</strong>
                      <br />
                      {listing.address}
                      <br />
                      {listing.quartier}, {listing.commune}
                    </Popup>
                  </Marker>
                </MapContainer>
              )}
            </div>
            <div className="map-disclaimer">
              <small>
                Note: Map shows approximate location. For precise directions,
                contact the lister.
              </small>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="listing-sidebar">
          {/* Contact Card */}
          <div className="contact-card">
            <h3>Contact Information</h3>
            <div className="lister-info">
              <div className="lister-avatar">
                {listing.listerProfileImage ? (
                  <img src={listing.listerProfileImage} alt="Lister" />
                ) : (
                  <i className="fas fa-user-circle"></i>
                )}
              </div>
              <div className="lister-details">
                <h4>
                  {listing.listerFirstName} {listing.listerLastName}
                </h4>
                <p className="lister-title">Property Lister</p>
              </div>
            </div>

            <div className="contact-details">
              <div className="contact-item">
                <i className="fas fa-phone"></i>
                <a href={`tel:${listing.listerPhoneNumber}`}>
                  {listing.listerPhoneNumber}
                </a>
              </div>
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <a href={`mailto:${listing.listerEmailAddress}`}>
                  {listing.listerEmailAddress}
                </a>
              </div>
            </div>

            <div className="contact-actions">
              <a
                href={`mailto:${listing.listerEmailAddress}?subject=Inquiry about ${listing.typeOfListing} at ${listing.address}`}
                className="contact-button email"
              >
                <i className="fas fa-envelope"></i> Email
              </a>
              <a
                href={`tel:${listing.listerPhoneNumber}`}
                className="contact-button call"
              >
                <i className="fas fa-phone"></i> Call
              </a>
            </div>
          </div>

          {/* Action Buttons */}
        </div>
      </div>

      {/* Related Listings */}
      {relatedListings.length > 0 && (
        <div className="related-listings-section">
          <h2>Similar Properties</h2>
          <div className="related-listings-grid">
            {relatedListings.map((relatedListing) => {
              const relatedPrice =
                relatedListing.listingType === "rent"
                  ? relatedListing.priceMonthly
                  : relatedListing.listingType === "sale"
                  ? relatedListing.priceSale
                  : relatedListing.listingType === "daily"
                  ? relatedListing.priceDaily
                  : 0;

              const relatedPriceDisplay =
                relatedListing.listingType === "rent"
                  ? `$${relatedPrice?.toLocaleString()}/mo`
                  : relatedListing.listingType === "sale"
                  ? `$${relatedPrice?.toLocaleString()}`
                  : relatedListing.listingType === "daily"
                  ? `$${relatedPrice?.toLocaleString()}/day`
                  : "";

              return (
                <div className="related-listing-card" key={relatedListing._id}>
                  <div className="related-listing-image">
                    {relatedListing.images?.length > 0 && (
                      <img
                        src={relatedListing.images[0]}
                        alt={relatedListing.typeOfListing}
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="related-listing-info">
                    <h3>{relatedListing.typeOfListing}</h3>
                    <p className="related-listing-location">
                      <i className="fas fa-map-marker-alt"></i>{" "}
                      {relatedListing.commune}
                    </p>
                    <div className="related-listing-features">
                      <span>
                        <i className="fas fa-bed"></i>{" "}
                        {relatedListing.details?.bedroom || 0}
                      </span>
                      <span>
                        <i className="fas fa-bath"></i>{" "}
                        {relatedListing.details?.bathroom || 0}
                      </span>
                    </div>
                    <div className="related-listing-price">
                      {relatedPriceDisplay}
                    </div>
                    <Link
                      to={`/listing/${relatedListing._id}`}
                      className="view-details-button"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showModal && (
        <div className="image-modal" onClick={closeImageModal}>
          <button className="modal-close" onClick={closeImageModal}>
            <i className="fas fa-times"></i>
          </button>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={listing.images[activeImageIndex]}
              alt={`${listing.typeOfListing} full view`}
            />
            {listing.images.length > 1 && (
              <>
                <button
                  className="modal-nav prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button
                  className="modal-nav next"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
                <div className="modal-counter">
                  {activeImageIndex + 1} / {listing.images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetail;
