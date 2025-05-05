import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../services/api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./ListingDetail.scss";

// Fix for Leaflet icon issue
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
  const [position, setPosition] = useState([0, 0]);

  // Placeholder location coordinates - you'd ideally get these from geocoding the address
  const getDefaultPosition = () => {
    return [48.8566, 2.3522]; // Paris coordinates as fallback
  };

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/listings/${id}`);
        const listingData = response.data;
        setListing(listingData);

        // If response.data is empty or null
        if (!response.data) {
          throw new Error("Listing data not found");
        }

        // Calculate days remaining until expiry
        if (listingData.expiryDate) {
          const today = new Date();
          const expiryDate = new Date(listingData.expiryDate);
          const timeDiff = expiryDate.getTime() - today.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
          setDaysRemaining(daysDiff > 0 ? daysDiff : 0);
        }

        // Set map position - In a real implementation, you would geocode the address
        // Here we're using placeholder coordinates
        setPosition(getDefaultPosition());

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
        // This would ideally fetch listings with similar parameters
        const response = await API.get("/listings");
        const allListings = Array.isArray(response.data)
          ? response.data
          : response.data?.data || response.data?.listings || [];

        // Filter out the current listing and limit to 3 related listings
        const related = allListings
          .filter((item) => item._id !== id)
          .slice(0, 3);

        setRelatedListings(related);
      } catch (err) {
        console.error("Error fetching related listings:", err);
      }
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

  const closeImageModal = () => {
    setShowModal(false);
  };

  const getFeatureIcon = (feature) => {
    switch (feature) {
      case "bedroom":
        return "fas fa-bed";
      case "bathroom":
        return "fas fa-bath";
      case "kitchen":
        return "fas fa-utensils";
      case "dinningRoom":
        return "fas fa-chair";
      case "floor":
        return "fas fa-building";
      default:
        return "fas fa-home";
    }
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

  // Calculate price based on listing type
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
      {/* Header with Property Images */}
      <div className="listing-header">
        <div className="image-gallery">
          <div className="main-image-container">
            {listing.images && listing.images.length > 0 && (
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
                      aria-label="Previous image"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <button
                      className="gallery-nav next"
                      onClick={handleNextImage}
                      aria-label="Next image"
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

          {listing.images && listing.images.length > 1 && (
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
                      <span>+{listing.images.length - 5}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="listing-content">
        <div className="listing-main">
          {/* Property Title and Basic Info */}
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

          {/* Property Features */}
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
            <div className="map-container">
              <MapContainer
                center={position}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: "400px", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                  <Popup>
                    {listing.address}, {listing.commune}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="listing-sidebar">
          {/* Contact Information */}
          <div className="contact-card">
            <h3>Contact Information</h3>
            <div className="lister-info">
              <div className="lister-avatar">
                <i className="fas fa-user-circle"></i>
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
                <span>{listing.listerPhoneNumber}</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <span>{listing.listerEmailAddress}</span>
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

          {/* Save Listing Card - This would be linked to a user account system */}
          <div className="save-listing-card">
            <button className="save-listing-button">
              <i className="far fa-heart"></i> Save to Favorites
            </button>
            <button className="share-listing-button">
              <i className="fas fa-share-alt"></i> Share Property
            </button>
          </div>
        </div>
      </div>

      {/* Related Listings Section */}
      {relatedListings.length > 0 && (
        <div className="related-listings-section">
          <h2>Similar Properties</h2>
          <div className="related-listings-grid">
            {relatedListings.map((listing) => {
              const listingPrice =
                listing.listingType === "rent"
                  ? listing.priceMonthly
                  : listing.listingType === "sale"
                  ? listing.priceSale
                  : listing.listingType === "daily"
                  ? listing.priceDaily
                  : 0;

              const listingPriceDisplay =
                listing.listingType === "rent"
                  ? `$${listingPrice?.toLocaleString()}/mo`
                  : listing.listingType === "sale"
                  ? `$${listingPrice?.toLocaleString()}`
                  : listing.listingType === "daily"
                  ? `$${listingPrice?.toLocaleString()}/day`
                  : "";

              return (
                <div className="related-listing-card" key={listing._id}>
                  <div className="related-listing-image">
                    {listing.images && listing.images.length > 0 && (
                      <img
                        src={listing.images[0]}
                        alt={listing.typeOfListing}
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="related-listing-info">
                    <h3>{listing.typeOfListing}</h3>
                    <p className="related-listing-location">
                      <i className="fas fa-map-marker-alt"></i>{" "}
                      {listing.address}, {listing.commune}
                    </p>
                    <div className="related-listing-features">
                      <span>
                        <i className="fas fa-bed"></i>{" "}
                        {listing.details?.bedroom || 0}
                      </span>
                      <span>
                        <i className="fas fa-bath"></i>{" "}
                        {listing.details?.bathroom || 0}
                      </span>
                    </div>
                    <div className="related-listing-price">
                      {listingPriceDisplay}
                    </div>
                    <Link
                      to={`/listing/${listing._id}`}
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

      {/* Full-screen Image Modal */}
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
