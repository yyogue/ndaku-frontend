import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";
import "./UpdateListing.scss";

const UpdateListing = () => {
  const { id } = useParams();
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
        // Validate the ID first
        if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
          throw new Error("Invalid listing ID");
        }
  
        const response = await API.get(`/api/listings/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const listing = response.data;
        
        if (!listing) {
          throw new Error("Listing not found");
        }
  
        // Rest of your existing code...
        const inferredPrice =
          listing.priceMonthly || listing.priceDaily || listing.priceSale || "";
  
        setFormData({
          listerFirstName: listing.listerFirstName || "",
          listerLastName: listing.listerLastName || "",
          listerEmailAddress: listing.listerEmailAddress || "",
          listerPhoneNumber: listing.listerPhoneNumber || "",
          typeOfListing: listing.typeOfListing || "",
          listingType: listing.listingType || "",
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
      } catch (error) {
        console.error("Error fetching listing:", error);
        setMessage({ 
          text: error.message || "Error fetching listing.", 
          type: "error" 
        });
        // Optionally redirect after showing error
        setTimeout(() => navigate("/list-property"), 2000);
      }
    };
    
    fetchListing();
  }, [id, token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name in formData.details) {
      setFormData((prev) => ({
        ...prev,
        details: { ...prev.details, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
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

      // Append basic fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "details") {
          data.append("details", JSON.stringify(value));
        } else if (key !== "price") {
          data.append(key, value);
        }
      });

      // Append price based on listing type
      const priceValue = parseFloat(formData.price) || 0;
      if (formData.listingType === "sale") {
        data.append("priceSale", priceValue);
      } else if (formData.listingType === "rent") {
        data.append("priceMonthly", priceValue);
      } else if (formData.listingType === "daily") {
        data.append("priceDaily", priceValue);
      }

      // Append new images
      images.forEach((file) => {
        data.append("images", file);
      });

      // Append removed images
      removedImages.forEach((imageUrl) => {
        data.append("removedImages", imageUrl);
      });

      await API.put(`/api/listings/update/${id}`, data, {
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
    } catch (err) {
      console.error("Update error:", err.response?.data || err.message);
      setMessage({ 
        text: err.response?.data?.message || "Error updating listing",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="update-listing-container">
      <h2>Update Listing</h2>
      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
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

        {/* Contact Info */}
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

        {/* Listing Type */}
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

        {/* Price Section */}
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
          {["floor", "bedroom", "bathroom", "kitchen", "dinningRoom"].map((key) => (
            <input
              key={key}
              type="number"
              name={key}
              placeholder={key[0].toUpperCase() + key.slice(1)}
              value={formData.details[key]}
              onChange={handleChange}
            />
          ))}
        </div>

        {/* Address */}
        <div className="form-group">
          {["address", "quartier", "commune", "district", "ville"].map((field) => (
            <input
              key={field}
              type="text"
              name={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={formData[field]}
              onChange={handleChange}
              required
            />
          ))}
        </div>

        {/* Image Upload */}
        <div className="form-group">
          <label>
            Add New Images
            <input
              type="file"
              onChange={handleImageChange}
              multiple
              accept="image/*"
            />
          </label>

          {/* New Image Previews */}
          {images.length > 0 && (
            <div className="image-section">
              <h4>New Images to Upload</h4>
              <div className="image-previews">
                {images.map((image, index) => (
                  <div key={`new-${index}`} className="image-preview">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index}`}
                    />
                    <button
                      type="button"
                      onClick={() => handlePreviewImageRemove(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="image-section">
              <h4>Current Images</h4>
              <div className="image-previews">
                {existingImages.map((image, index) => (
                  <div key={`existing-${index}`} className="image-preview">
                    <img src={image} alt={`Existing ${index}`} />
                    <button
                      type="button"
                      onClick={() => handleImageRemove(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Listing"}
        </button>
      </form>
    </div>
  );
};

export default UpdateListing;
