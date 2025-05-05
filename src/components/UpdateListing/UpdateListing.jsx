import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";
import "./UpdateListing.scss";

const UpdateListing = ({ listing, onClose, onSave }) => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    listerFirstName: "",
    listerLastName: "",
    listerEmailAddress: "",
    listerPhoneNumber: "",
    typeOfListing: "",
    listingType: "",
    price: "",
    details: {
      floor: "",
      bedroom: "",
      bathroom: "",
      kitchen: "",
      dinningRoom: "",
    },
    address: "",
    quartier: "",
    commune: "",
    district: "",
    ville: "",
  });

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        setMessage({ text: "", type: "" });

        if (listing) {
          // If listing is passed as prop (from Listings component)
          const inferredPrice = listing.priceMonthly || listing.priceDaily || listing.priceSale || "";

          setFormData({
            listerFirstName: listing.listerFirstName || "",
            listerLastName: listing.listerLastName || "",
            listerEmailAddress: listing.listerEmailAddress || "",
            listerPhoneNumber: listing.listerPhoneNumber || "",
            typeOfListing: listing.typeOfListing?.toLowerCase() || "",
            listingType: listing.listingType?.toLowerCase() || "",
            price: inferredPrice.toString(),
            details: {
              floor: listing.details?.floor || "",
              bedroom: listing.details?.bedroom || "",
              bathroom: listing.details?.bathroom || "",
              kitchen: listing.details?.kitchen || "",
              dinningRoom: listing.details?.dinningRoom || "",
            },
            address: listing.address || "",
            quartier: listing.quartier || "",
            commune: listing.commune || "",
            district: listing.district || "",
            ville: listing.ville || "",
          });
          setExistingImages(listing.images || []);
          setLoading(false);
        } else if (id) {
          // If no listing prop, fetch from API
          const response = await API.get(`/listings/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.data) {
            throw new Error("Received empty response from server");
          }

          const listingData = response.data;
          const inferredPrice = listingData.priceMonthly || listingData.priceDaily || listingData.priceSale || "";

          setFormData({
            listerFirstName: listingData.listerFirstName || "",
            listerLastName: listingData.listerLastName || "",
            listerEmailAddress: listingData.listerEmailAddress || "",
            listerPhoneNumber: listingData.listerPhoneNumber || "",
            typeOfListing: listingData.typeOfListing?.toLowerCase() || "",
            listingType: listingData.listingType?.toLowerCase() || "",
            price: inferredPrice.toString(),
            details: {
              floor: listingData.details?.floor || "",
              bedroom: listingData.details?.bedroom || "",
              bathroom: listingData.details?.bathroom || "",
              kitchen: listingData.details?.kitchen || "",
              dinningRoom: listingData.details?.dinningRoom || "",
            },
            address: listingData.address || "",
            quartier: listingData.quartier || "",
            commune: listingData.commune || "",
            district: listingData.district || "",
            ville: listingData.ville || "",
          });
          setExistingImages(listingData.images || []);
          setLoading(false);
        } else {
          throw new Error("No listing ID provided");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setMessage({
          text: error.response?.data?.message || error.message || "Failed to load listing",
          type: "error"
        });
        setTimeout(() => navigate("/list-property"), 3000);
      }
    };

    fetchListing();
  }, [id, token, navigate, listing]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name in formData.details) {
      setFormData(prev => ({
        ...prev,
        details: { ...prev.details, [name]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleImageRemove = (index) => {
    const newImages = [...existingImages];
    const removed = newImages.splice(index, 1);
    setExistingImages(newImages);
    setRemovedImages(prev => [...prev, removed[0]]);
  };

  const handlePreviewImageRemove = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const getPriceLabel = () => {
    switch (formData.listingType) {
      case "rent": return "Monthly Rent";
      case "daily": return "Daily Rent";
      case "sale": return "Sale Price";
      default: return "Price";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      const data = new FormData();

      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "details") {
          data.append("details", JSON.stringify(value));
        } else if (key !== "price") {
          data.append(key, value);
        }
      });

      // Handle price based on listing type
      const priceValue = parseFloat(formData.price) || 0;
      if (formData.listingType === "sale") {
        data.append("priceSale", priceValue);
      } else if (formData.listingType === "rent") {
        data.append("priceMonthly", priceValue);
      } else if (formData.listingType === "daily") {
        data.append("priceDaily", priceValue);
      }

      // Handle image updates
      images.forEach(file => data.append("images", file));
      removedImages.forEach(url => data.append("removedImages", url));

      // Use the correct endpoint based on how the component is being used
      if (onSave) {
        // When used in modal from Listings component
        const response = await API.put(
          `/listings/update/${id || listing._id}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        onSave(response.data);
      } else {
        // When used as standalone page
        const response = await API.put(`/listings/${id}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setMessage({
          text: "Listing updated successfully!",
          type: "success"
        });
        setTimeout(() => navigate("/list-property"), 1500);
      }
    } catch (err) {
      console.error("Update error:", err);
      setMessage({
        text: err.response?.data?.message || "Failed to update listing",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="update-listing-container">
        <div className="loading">Loading listing data...</div>
      </div>
    );
  }

  return (
    <div className="update-listing-container">
      <h2>Update Listing</h2>
      
      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <form onSubmit={handleSubmit} className="listing-form">
        {/* Personal Info */}
        <div className="form-section">
          <h3>Contact Information</h3>
          <div className="form-group">
            <input
              type="text"
              name="listerFirstName"
              placeholder="First Name"
              value={formData.listerFirstName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="listerLastName"
              placeholder="Last Name"
              value={formData.listerLastName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              name="listerEmailAddress"
              placeholder="Email"
              value={formData.listerEmailAddress}
              onChange={handleChange}
              required
            />
            <input
              type="tel"
              name="listerPhoneNumber"
              placeholder="Phone"
              value={formData.listerPhoneNumber}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Property Details */}
        <div className="form-section">
          <h3>Property Details</h3>
          <div className="form-group">
            <select
              name="typeOfListing"
              value={formData.typeOfListing}
              onChange={handleChange}
              required
            >
              <option value="">Select Property Type</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="condo">Condo</option>
            </select>
          </div>

          <div className="form-group listing-price">
            <select
              name="listingType"
              value={formData.listingType}
              onChange={handleChange}
              required
            >
              <option value="">Select Listing Type</option>
              <option value="rent">For Rent</option>
              <option value="daily">Daily Rental</option>
              <option value="sale">For Sale</option>
            </select>
            <div className="price-input">
              <span>$</span>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder={getPriceLabel()}
                required
                min="0"
              />
            </div>
          </div>

          <div className="form-group details-group">
            {Object.entries(formData.details).map(([key, value]) => (
              <input
                key={key}
                type="number"
                name={key}
                placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                value={value}
                onChange={handleChange}
                min="0"
              />
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="form-section">
          <h3>Location</h3>
          <div className="form-group">
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="quartier"
              placeholder="Neighborhood"
              value={formData.quartier}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="commune"
              placeholder="Commune"
              value={formData.commune}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="district"
              placeholder="District"
              value={formData.district}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="ville"
              placeholder="City"
              value={formData.ville}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Images */}
        <div className="form-section">
          <h3>Images</h3>
          <div className="form-group">
            <label className="file-upload">
              <span>Add New Images</span>
              <input
                type="file"
                onChange={handleImageChange}
                multiple
                accept="image/*"
              />
            </label>
          </div>

          {existingImages.length > 0 && (
            <div className="image-preview-section">
              <h4>Current Images</h4>
              <div className="image-grid">
                {existingImages.map((img, index) => (
                  <div key={`existing-${index}`} className="image-item">
                    <img src={img} alt={`Listing ${index}`} />
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => handleImageRemove(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {images.length > 0 && (
            <div className="image-preview-section">
              <h4>New Images</h4>
              <div className="image-grid">
                {images.map((img, index) => (
                  <div key={`new-${index}`} className="image-item">
                    <img src={URL.createObjectURL(img)} alt={`New ${index}`} />
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => handlePreviewImageRemove(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={onClose || (() => navigate("/list-property"))}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateListing;
