import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "../../services/api";
import ModalWrapper from "../../components/ModalWrapper/ModalWrapper";
import UpdateListing from "../../components/UpdateListing/UpdateListing";
import ConfirmDialog from "./confimDialog/ConfirmDialog";
import "./Listings.scss";

const Listings = ({ onAddListingClick }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentListing, setCurrentListing] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => {});
  const [confirmMessage, setConfirmMessage] = useState("");

  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await API.get(`/listings/user/current`);
        setListings(res.data);
      } catch (err) {
        console.error("Erreur lors du chargement des annonces :", err);
        setError(
          err.response?.data?.message || 
          "Échec du chargement des annonces. Veuillez réessayer plus tard."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token && user?._id) {
      fetchListings();
    }
  }, [token, user]);

  const handleEdit = (listing) => {
    setCurrentListing(listing);
    setShowEditModal(true);
  };

  const handleDelete = (listingId) => {
    setConfirmMessage(
      "Êtes-vous sûr de vouloir supprimer définitivement cette annonce ?"
    );
    setShowConfirm(true);
    setConfirmAction(() => async () => {
      try {
        await API.delete(`/listings/${listingId}`);
        setListings(listings.filter((listing) => listing._id !== listingId));
        setShowConfirm(false);
      } catch (err) {
        console.error("Erreur lors de la suppression de l'annonce :", err);
        setError("Échec de la suppression de l'annonce. Veuillez réessayer.");
      }
    });
  };

  const handlePublishToggle = (listing, currentStatus) => {
    const action = currentStatus ? "retirer" : "publier";
    setConfirmMessage(`Êtes-vous sûr de vouloir ${action} cette annonce ?`);
    setShowConfirm(true);
    setConfirmAction(() => async () => {
      try {
        const response = await API.patch(
          `/listings/${listing._id}/status`,
          { isDeleted: !currentStatus },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setListings(
          listings.map((item) =>
            item._id === listing._id ? response.data.listing : item
          )
        );
        setShowConfirm(false);
      } catch (err) {
        console.error(
          `Erreur lors de la tentative de ${action} de l'annonce :`,
          err
        );
        setError(
          `Échec de la tentative de ${action} de l'annonce. Veuillez réessayer.`
        );
      }
    });
  };

  if (loading) return <div className="loading">Chargement des annonces...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="listings-container">
      <h1>Mes Annonces</h1>

      {listings.length === 0 ? (
        <div className="no-listings">
          <p>Vous n'avez pas encore créé d'annonces.</p>
          <button 
            className="create-listing-btn"
            onClick={onAddListingClick}
          >
            Créer votre première annonce
          </button>
        </div>
      ) : (
        <div className="listings-grid">
          {listings.map((listing) => (
            <div
              className={`listing-card ${
                listing.isDeleted ? "unpublished" : ""
              }`}
              key={listing._id}
            >
              {listing.isDeleted && (
                <div className="unpublished-badge">Non Publiée</div>
              )}

              <div className="listing-images">
                {listing.images?.slice(0, 1).map((img) => (
                  <img key={img} src={img} alt="listing" loading="lazy" />
                ))}
              </div>

              <div className="listing-details">
                <div className="listing-header">
                  <h3>
                    {listing.details?.bedroom ?? "N/A"}-Chambre{" "}
                    {listing.typeOfListing}
                  </h3>
                  <p className="price">
                    {listing.listingType === "location" &&
                      `$${listing.priceMonthly?.toLocaleString() ?? 0}/mo`}
                    {listing.listingType === "quotidien" &&
                      `$${listing.priceDaily?.toLocaleString() ?? 0}/jour`}
                    {listing.listingType === "vente" &&
                      `$${listing.priceSale?.toLocaleString() ?? 0}`}
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
                      {listing.details?.floor ?? "N/A"} étages
                    </span>
                    <span>
                      <i className="fas fa-bed"></i>{" "}
                      {listing.details?.bedroom ?? "N/A"} Chambres
                    </span>
                    <span>
                      <i className="fas fa-bath"></i>{" "}
                      {listing.details?.bathroom ?? "N/A"} Toilettes
                    </span>
                  </div>
                </div>

                <div className="listing-actions">
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(listing)}
                  >
                    <i className="fas fa-edit"></i> Modifier
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(listing._id)}
                  >
                    <i className="fas fa-trash"></i> Supprimer
                  </button>

                  <button
                    className={
                      listing.isDeleted ? "publish-btn" : "unpublish-btn"
                    }
                    onClick={() =>
                      handlePublishToggle(listing, listing.isDeleted)
                    }
                  >
                    <i
                      className={
                        listing.isDeleted ? "fas fa-eye" : "fas fa-eye-slash"
                      }
                    ></i>
                    {listing.isDeleted ? " Publier" : " Retirer"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showEditModal && (
        <ModalWrapper onClose={() => setShowEditModal(false)}>
          <UpdateListing
            listing={currentListing}
            onClose={() => setShowEditModal(false)}
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

                if (updatedListing.newImages?.length > 0) {
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
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );

                  setListings(
                    listings.map((listing) =>
                      listing._id === updatedListing._id
                        ? response.data.listing || response.data
                        : listing
                    )
                  );
                } catch (err) {
                  console.error(
                    "Erreur lors de la mise à jour de l'annonce :",
                    err
                  );
                  setError(
                    "Échec de la mise à jour de l'annonce. Veuillez réessayer."
                  );
                }
              }
              setShowEditModal(false);
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
