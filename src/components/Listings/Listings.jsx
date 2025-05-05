import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "../../services/api";
import ModalWrapper from "../../components/ModalWrapper/ModalWrapper";
import UpdateListing from "../../components/UpdateListing/UpdateListing";
import ConfirmDialog from "./confimDialog/ConfirmDialog";
import "./Listings.scss";



const Listings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentListing, setCurrentListing] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => {});
  const [confirmMessage, setConfirmMessage] = useState("");

  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await API.get("/listings/my-listings");
        setListings(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching listings:", err);
        setError("Failed to load listings. Please try again later.");
        setLoading(false);
      }
    };

    fetchListings();
  }, [token]);

  const handleEdit = (listing) => {
    setCurrentListing(listing);
    setShowModal(true);
  };

  const handleDelete = async (listingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this listing?"
    );
    if (confirmed) {
      try {
        await API.delete(`/listings/delete/${listingId}`);
        setListings(listings.filter((listing) => listing._id !== listingId));
      } catch (err) {
        console.error("Error deleting listing:", err);
        setError("Failed to delete listing. Please try again.");
      }
    }
  };

  const handlePublishToggle = (listingId, currentStatus) => {
    const action = currentStatus ? 'publish' : 'unpublish';
    setConfirmMessage(`Are you sure you want to ${action} this listing?`);
    setShowConfirm(true);
    setConfirmAction(() => async () => {
      try {
        const response = await API.put(
          `/listings/update/${listingId}`,
          { isDeleted: !currentStatus }
        );
        setListings(listings.map(listing => 
          listing._id === listingId ? response.data.listing : listing
        ));
      } catch (err) {
        console.error(`Error ${action}ing listing:`, err);
        setError(`Failed to ${action} listing. Please try again.`);
      }
      setShowConfirm(false);
    });
  };
  

  if (loading) {
    return <div className="loading">Loading listings...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="listings-container">
      <h1>My Property Listings</h1>
  
      {listings.length === 0 ? (
        <div className="no-listings">
          <p>You haven't created any listings yet.</p>
          <a href="/add-listing" className="create-listing-btn">
            Create Your First Listing
          </a>
        </div>
      ) : (
        <div className="listings-grid">
          {listings.map((listing) => (
            <div
              className={`listing-card ${listing.isDeleted ? "unpublished" : ""}`}
              key={listing._id}
            >
              {listing.isDeleted && (
                <div className="unpublished-badge">Unpublished</div>
              )}
  
              <div className="listing-images">
                {listing.images?.slice(0, 1).map((img, index) => (
                  <img key={index} src={img} alt={`listing-${index}`} />
                ))}
              </div>
  
              <div className="listing-details">
                <div className="listing-header">
                  <h3>
                    {listing.details?.bedroom || 0}-Bedroom {listing.typeOfListing}
                  </h3>
                  <p className="price">
                    {listing.listingType === "rent" &&
                      `$${listing.priceMonthly?.toLocaleString() || 0}/mo`}
                    {listing.listingType === "daily" &&
                      `$${listing.priceDaily?.toLocaleString() || 0}/day`}
                    {listing.listingType === "sale" &&
                      `$${listing.priceSale?.toLocaleString() || 0}`}
                  </p>
                </div>
  
                <div className="listing-body">
                  <p className="address">
                    <i className="fas fa-map-marker-alt"></i>
                    {listing.address}, {listing.quartier}, {listing.commune}
                  </p>
  
                  <div className="features">
                    <span>
                      <i className="fas fa-layer-group"></i>{" "}
                      {listing.details?.floor || 0} floors
                    </span>
                    <span>
                      <i className="fas fa-bed"></i>{" "}
                      {listing.details?.bedroom || 0} beds
                    </span>
                    <span>
                      <i className="fas fa-bath"></i>{" "}
                      {listing.details?.bathroom || 0} baths
                    </span>
                  </div>
                </div>
  
                <div className="listing-actions">
                  <button className="edit-btn" onClick={() => handleEdit(listing)}>
                    <i className="fas fa-edit"></i> Edit
                  </button>
  
                  <button className="delete-btn" onClick={() => handleDelete(listing._id)}>
                    <i className="fas fa-trash"></i> Delete
                  </button>
  
                  <button
                    className={listing.isDeleted ? "publish-btn" : "unpublish-btn"}
                    onClick={() => handlePublishToggle(listing._id, listing.isDeleted)}
                  >
                    <i
                      className={
                        listing.isDeleted ? "fas fa-eye" : "fas fa-eye-slash"
                      }
                    ></i>
                    {listing.isDeleted ? " Publish" : " Unpublish"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
  
      {showModal && (
        <ModalWrapper onClose={() => setShowModal(false)}>
          <UpdateListing
            listing={currentListing}
            onClose={() => setShowModal(false)}
            onSave={async (updatedListing) => {
              if (updatedListing._id) {
                const formData = new FormData();
  
                Object.keys(updatedListing).forEach((key) => {
                  if (key === "details") {
                    formData.append(
                      "details",
                      JSON.stringify(updatedListing.details)
                    );
                  } else if (key !== "images" && key !== "_id") {
                    formData.append(key, updatedListing[key]);
                  }
                });
  
                if (
                  updatedListing.newImages &&
                  updatedListing.newImages.length > 0
                ) {
                  updatedListing.newImages.forEach((file) => {
                    formData.append("images", file);
                  });
                }
  
                try {
                  const response = await API.put(
                    `/listings/update/${updatedListing._id}`,
                    formData,
                    {
                      headers: {
                        "Content-Type": "multipart/form-data",
                      },
                    }
                  );
  
                  setListings(
                    listings.map((listing) =>
                      listing._id === updatedListing._id
                        ? response.data.listing
                        : listing
                    )
                  );
                } catch (err) {
                  console.error("Error updating listing:", err);
                  setError("Failed to update listing. Please try again.");
                }
              }
              setShowModal(false);
            }}
          />
        </ModalWrapper>
      )}
  
      {showConfirm && (
        <ConfirmDialog
          message={confirmMessage}
          onConfirm={confirmAction}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};

export default Listings;
