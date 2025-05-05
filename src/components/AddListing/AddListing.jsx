import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./AddListing.scss";

const AddListing = () => {
  // Initial form state
  const initialFormState = {
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
  };

  const [formData, setFormData] = useState(initialFormState);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const timeoutRef = useRef();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Clean up object URLs
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const resetForm = () => {
    setFormData(initialFormState);
    setImages([]);
    setImagePreviews([]);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.details) {
      setFormData((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setImages(selectedFiles);
    const previewUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(previewUrls);
  };

  const removeImage = (index) => {
    const updatedImages = [...images];
    const updatedPreviews = [...imagePreviews];
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedImages.splice(index, 1);
    updatedPreviews.splice(index, 1);
    setImages(updatedImages);
    setImagePreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);
    setShowSuccess(false);

    if (!token || !user?._id) {
      setError("Authentication failed. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const data = new FormData();
      const startTime = Date.now();

      // Append form data
      data.append("listerFirstName", formData.listerFirstName);
      data.append("listerLastName", formData.listerLastName);
      data.append("listerEmailAddress", formData.listerEmailAddress);
      data.append("listerPhoneNumber", formData.listerPhoneNumber);
      data.append("typeOfListing", formData.typeOfListing);
      data.append("listingType", formData.listingType);
      data.append("address", formData.address);
      data.append("quartier", formData.quartier);
      data.append("commune", formData.commune);
      data.append("district", formData.district);
      data.append("ville", formData.ville);
      data.append("createdBy", user._id);

      const detailsObj = {
        floor: parseInt(formData.details.floor) || 0,
        bedroom: parseInt(formData.details.bedroom) || 0,
        bathroom: parseInt(formData.details.bathroom) || 0,
        kitchen: parseInt(formData.details.kitchen) || 0,
        dinningRoom: parseInt(formData.details.dinningRoom) || 0,
      };
      data.append("details", JSON.stringify(detailsObj));

      const priceValue = parseFloat(formData.price) || 0;
      if (formData.listingType === "sale") {
        data.append("priceSale", priceValue);
      } else if (formData.listingType === "rent") {
        data.append("priceMonthly", priceValue);
      } else if (formData.listingType === "daily") {
        data.append("priceDaily", priceValue);
      }

      if (images.length === 0) {
        setError("At least one image is required");
        setIsSubmitting(false);
        return;
      }
      images.forEach((file) => data.append("images", file));

      // Submit data
      await API.post("/listings/add", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const submissionTime = Date.now() - startTime;
      const minDisplayTime = 1000;
      const remainingTime = Math.max(minDisplayTime - submissionTime, 0);

      setShowSuccess(true);
      setMessage("Listing added successfully!");
      resetForm(); // Reset all form values

      timeoutRef.current = setTimeout(() => {
        navigate("/list-property");
      }, remainingTime);

    } catch (err) {
      console.error("Submission Error:", err);
      setError(
        err.response?.data?.message ||
        "Failed to submit listing. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriceLabel = () => {
    switch (formData.listingType) {
      case "rent": return "Monthly Rent";
      case "daily": return "Daily Rent";
      case "sale": return "Sale Price";
      default: return "Price";
    }
  };


  return (
    <div className="add-listing-container">
      <h2>Add New Listing</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {message && showSuccess && (
        <div className="success-message">{message}</div>
      )}
  
      <form onSubmit={handleSubmit} className="listing-form">
        {/* Personal Info */}
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
            type="text"
            name="listerPhoneNumber"
            placeholder="Phone"
            value={formData.listerPhoneNumber}
            onChange={handleChange}
            required
          />
        </div>
  
        {/* Type of Listing */}
        <div className="form-group">
          <select
            name="typeOfListing"
            value={formData.typeOfListing}
            onChange={handleChange}
            required
          >
            <option value="">Select Type of Listing</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="condo">Condo</option>
          </select>
        </div>
  
        {/* Listing Type and Price */}
        <div className="form-group listing-price">
          <select
            name="listingType"
            value={formData.listingType}
            onChange={handleChange}
            required
          >
            <option value="">Select Listing Type</option>
            <option value="rent">Rent</option>
            <option value="daily">Daily</option>
            <option value="sale">Sale</option>
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
            />
          </div>
        </div>
  
        {/* Details */}
        <div className="form-group details-group">
          <input
            type="number"
            name="floor"
            placeholder="Floor"
            value={formData.details.floor}
            onChange={handleChange}
          />
          <input
            type="number"
            name="bedroom"
            placeholder="Bedrooms"
            value={formData.details.bedroom}
            onChange={handleChange}
          />
          <input
            type="number"
            name="bathroom"
            placeholder="Bathrooms"
            value={formData.details.bathroom}
            onChange={handleChange}
          />
          <input
            type="number"
            name="kitchen"
            placeholder="Kitchens"
            value={formData.details.kitchen}
            onChange={handleChange}
          />
          <input
            type="number"
            name="dinningRoom"
            placeholder="Dining Rooms"
            value={formData.details.dinningRoom}
            onChange={handleChange}
          />
        </div>
  
        {/* Address */}
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
            placeholder="Quartier"
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
  
        {/* Image Upload */}
        <div className="form-group">
          <input
            type="file"
            name="images"
            onChange={handleImageChange}
            multiple
            accept="image/*"
            required
          />
        </div>
  
        {/* Image Preview */}
        {imagePreviews.length > 0 && (
          <div className="preview-group">
            {imagePreviews.map((src, idx) => (
              <div key={idx} className="preview-image">
                <img src={src} alt={`preview-${idx}`} />
                <button type="button" onClick={() => removeImage(idx)}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
  
        {isSubmitting && (
          <div className="submission-overlay">
            <div className="spinner"></div>
            <p>Submitting your listing...</p>
          </div>
        )}
  
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="button-spinner"></span>
          ) : (
            "Submit"
          )}
        </button>
      </form>
    </div>
  );
};

export default AddListing;
