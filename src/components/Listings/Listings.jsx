import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import API from '../../services/api';
import ModalWrapper from '../../components/ModalWrapper/ModalWrapper';
import UpdateListing from '../../components/UpdateListing/UpdateListing'; // Import the UpdateListing component
import './Listings.scss';

const Listings = () => {
  const [listings, setListings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentListing, setCurrentListing] = useState(null);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await API.get('/listings/my-listings', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setListings(res.data);
      } catch (err) {
        console.error('Error fetching listings:', err);
      }
    };

    fetchListings();
  }, [token]);

  // Handle Edit Listing
  const handleEdit = (listing) => {
    setCurrentListing(listing); // Set the listing data to edit
    setShowModal(true); // Show the modal for editing
  };

  // Handle Delete Listing
  const handleDelete = async (listingId) => {
    const confirmed = window.confirm('Are you sure you want to delete this listing?');
    if (confirmed) {
      try {
        await API.delete(`/listings/delete/${listingId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setListings(listings.filter(listing => listing._id !== listingId)); // Remove deleted listing from UI
      } catch (err) {
        console.error('Error deleting listing:', err);
      }
    }
  };

  // Handle Unpublish Listing (Mark as Deleted)
  const handleUnpublish = async (listingId) => {
    const confirmed = window.confirm('Are you sure you want to unpublish this listing?');
    if (confirmed) {
      try {
        await API.put(
          `/listings/update/${listingId}`,
          { isDeleted: true }, // Set isDeleted flag to true
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setListings(listings.map(listing => listing._id === listingId ? { ...listing, isDeleted: true } : listing));
      } catch (err) {
        console.error('Error unpublishing listing:', err);
      }
    }
  };

  return (
    <div className="listings">
      {listings.length === 0 ? (
        <p>No listings found.</p>
      ) : (
        listings.map((listing) => (
          <div className="listing-card" key={listing._id}>
            <div className="listing-header">
              <h3>{listing.details?.bedroom}-Bedroom {listing.typeOfListing}</h3>
              <p>${listing.priceMonthly} / {listing.listingType}</p>
            </div>

            <div className="listing-body">
              <p><strong>Address:</strong> {listing.address}, {listing.quartier}, {listing.commune}, {listing.ville}</p>
              <p><strong>Phone:</strong> {listing.listerPhoneNumber}</p>
              <p><strong>Email:</strong> {listing.listerEmailAddress}</p>
              <p><strong>Floor:</strong> {listing.details?.floor}</p>
              <p><strong>Kitchen:</strong> {listing.details?.kitchen}</p>
              <p><strong>Dinning Room:</strong> {listing.details?.dinningRoom}</p>
              <p><strong>Bathroom:</strong> {listing.details?.bathroom}</p>
              <div className="listing-images">
                {listing.images?.map((img, index) => (
                  <img key={index} src={img} alt={`listing-${index}`} />
                ))}
              </div>
            </div>

            <div className="listing-actions">
              <button onClick={() => handleEdit(listing)}>Edit</button>
              <button onClick={() => handleDelete(listing._id)}>Delete</button>
              <button onClick={() => handleUnpublish(listing._id)}>Unpublish</button>
            </div>
          </div>
        ))
      )}

      {/* Modal for editing listing */}
      {showModal && (
        <ModalWrapper onClose={() => setShowModal(false)}>
          <UpdateListing
            listing={currentListing}
            onClose={() => setShowModal(false)}
            onSave={async (updatedListing) => {
              if (updatedListing._id) {
                // Update the existing listing
                try {
                  await API.put(
                    `/listings/update/${updatedListing._id}`,
                    updatedListing,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );
                  setListings(listings.map(listing => listing._id === updatedListing._id ? updatedListing : listing));
                } catch (err) {
                  console.error('Error updating listing:', err);
                }
              }
              setShowModal(false); // Close the modal after saving
            }}
          />
        </ModalWrapper>
      )}
    </div>
  );
};

export default Listings;
