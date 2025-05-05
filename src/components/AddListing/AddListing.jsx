import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import citiesData from "../../data/citiesData"; // Import the local data
import "./AddListing.scss";

const AddListing = () => {
  // Initial form state remains the same
  const initialFormState = {
    lister: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
    property: {
      type: "",
      listingType: "",
      price: "",
      details: {
        floor: "",
        bedroom: "",
        bathroom: "",
        kitchen: "",
        diningRoom: "",
      },
    },
    location: {
      address: "",
      quartier: "",
      commune: "",
      district: "",
      ville: "",
    },
  };

  const [formData, setFormData] = useState(initialFormState);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const timeoutRef = useRef();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  
  // Location data states - no longer need loading state since data is local
  const [villes, setVilles] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [quartiers, setQuartiers] = useState([]);

  // Initialize villes data from local file
  useEffect(() => {
    const activeCities = citiesData.filter(city => city.isActive).map(city => city.nom);
    setVilles(activeCities);
  }, []);

  // Update districts when city changes
  useEffect(() => {
    if (formData.location.ville) {
      const selectedCity = citiesData.find(city => city.nom === formData.location.ville);
      
      if (selectedCity && selectedCity.locationData) {
        setDistricts(selectedCity.locationData.districts.map(d => d.nom));
      } else {
        setDistricts([]);
      }
      
      // Reset dependent fields
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          district: "",
          commune: "",
          quartier: ""
        }
      }));
      setCommunes([]);
      setQuartiers([]);
    }
  }, [formData.location.ville]);

  // Update communes when district changes
  useEffect(() => {
    if (formData.location.ville && formData.location.district) {
      const selectedCity = citiesData.find(city => city.nom === formData.location.ville);
      
      if (selectedCity && selectedCity.locationData) {
        const districtData = selectedCity.locationData.districts.find(
          d => d.nom === formData.location.district
        );
        
        if (districtData && districtData.communes) {
          setCommunes(districtData.communes.map(c => c.nom));
        } else {
          setCommunes([]);
        }
      }
      
      // Reset dependent fields
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          commune: "",
          quartier: ""
        }
      }));
      setQuartiers([]);
    }
  }, [formData.location.ville, formData.location.district]);

  const resetForm = () => {
    setFormData(initialFormState);
    setImages([]);
    setImagePreviews([]);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested property changes
    if (name.startsWith("lister.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        lister: {
          ...prev.lister,
          [field]: value
        }
      }));
    } else if (name.startsWith("property.details.")) {
      const field = name.split(".")[2];
      setFormData(prev => ({
        ...prev,
        property: {
          ...prev.property,
          details: {
            ...prev.property.details,
            [field]: value
          }
        }
      }));
    } else if (name.startsWith("property.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        property: {
          ...prev.property,
          [field]: value
        }
      }));
    } else if (name.startsWith("location.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [field]: value
        }
      }));
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

      // Append form data with restructured format
      data.append("listerFirstName", formData.lister.firstName);
      data.append("listerLastName", formData.lister.lastName);
      data.append("listerEmailAddress", formData.lister.email);
      data.append("listerPhoneNumber", formData.lister.phone);
      data.append("typeOfListing", formData.property.type);
      data.append("listingType", formData.property.listingType);
      data.append("address", formData.location.address);
      data.append("quartier", formData.location.quartier);
      data.append("commune", formData.location.commune);
      data.append("district", formData.location.district);
      data.append("ville", formData.location.ville);
      data.append("createdBy", user._id);

      // Handle details with parseInt for numeric values
      const detailsObj = {
        floor: parseInt(formData.property.details.floor) || 0,
        bedroom: parseInt(formData.property.details.bedroom) || 0,
        bathroom: parseInt(formData.property.details.bathroom) || 0,
        kitchen: parseInt(formData.property.details.kitchen) || 0,
        diningRoom: parseInt(formData.property.details.diningRoom) || 0,
      };
      data.append("details", JSON.stringify(detailsObj));

      // Handle price based on listing type
      const priceValue = parseFloat(formData.property.price) || 0;
      if (formData.property.listingType === "sale") {
        data.append("priceSale", priceValue);
      } else if (formData.property.listingType === "rent") {
        data.append("priceMonthly", priceValue);
      } else if (formData.property.listingType === "daily") {
        data.append("priceDaily", priceValue);
      }

      // Validate images
      if (images.length === 0) {
        setError("At least one image is required");
        setIsSubmitting(false);
        return;
      }
      
      // Append image files
      images.forEach((file) => data.append("images", file));

      // Submit data
      const response = await API.post("/listings/add", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      // Handle successful submission with minimum display time
      const submissionTime = Date.now() - startTime;
      const minDisplayTime = 1000;
      const remainingTime = Math.max(minDisplayTime - submissionTime, 0);

      setShowSuccess(true);
      setMessage("Listing added successfully!");
      resetForm(); 

      // Redirect after showing success message
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
    switch (formData.property.listingType) {
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
        {/* Personal Info Section */}
        <section className="form-section">
          <h3>Contact Information</h3>
          <div className="form-group">
            <input
              type="text"
              name="lister.firstName"
              placeholder="First Name"
              value={formData.lister.firstName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="lister.lastName"
              placeholder="Last Name"
              value={formData.lister.lastName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="email"
              name="lister.email"
              placeholder="Email"
              value={formData.lister.email}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="lister.phone"
              placeholder="Phone"
              value={formData.lister.phone}
              onChange={handleChange}
              required
            />
          </div>
        </section>
  
        {/* Property Details Section */}
        <section className="form-section">
          <h3>Property Details</h3>
          <div className="form-group">
            <select
              name="property.type"
              value={formData.property.type}
              onChange={handleChange}
              required
            >
              <option value="">Select Type of Property</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="condo">Condo</option>
              <option value="office">Office Space</option>
              <option value="land">Land</option>
            </select>
          </div>
      
          {/* Listing Type and Price */}
          <div className="form-group listing-price">
            <select
              name="property.listingType"
              value={formData.property.listingType}
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
                name="property.price"
                value={formData.property.price}
                onChange={handleChange}
                placeholder={getPriceLabel()}
                required
              />
            </div>
          </div>
      
          {/* Property Features */}
          <div className="form-group details-group">
            <input
              type="number"
              name="property.details.floor"
              placeholder="Floor"
              value={formData.property.details.floor}
              onChange={handleChange}
              min="0"
            />
            <input
              type="number"
              name="property.details.bedroom"
              placeholder="Bedrooms"
              value={formData.property.details.bedroom}
              onChange={handleChange}
              min="0"
            />
            <input
              type="number"
              name="property.details.bathroom"
              placeholder="Bathrooms"
              value={formData.property.details.bathroom}
              onChange={handleChange}
              min="0"
            />
            <input
              type="number"
              name="property.details.kitchen"
              placeholder="Kitchens"
              value={formData.property.details.kitchen}
              onChange={handleChange}
              min="0"
            />
            <input
              type="number"
              name="property.details.diningRoom"
              placeholder="Dining Rooms"
              value={formData.property.details.diningRoom}
              onChange={handleChange}
              min="0"
            />
          </div>
        </section>
  
        {/* Location Section */}
        <section className="form-section">
          <h3>Location</h3>
          <div className="form-group">
            <input
              type="text"
              name="location.address"
              placeholder="Address"
              value={formData.location.address}
              onChange={handleChange}
              required
            />
            
            {/* Location Selection */}
            <select
              name="location.ville"
              value={formData.location.ville}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Select City</option>
              {villes.map((ville) => (
                <option key={ville} value={ville}>
                  {ville}
                </option>
              ))}
            </select>
            
            <select
              name="location.district"
              value={formData.location.district}
              onChange={handleChange}
              required
              disabled={!formData.location.ville || loading}
            >
              <option value="">Select District</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
            
            <select
              name="location.commune"
              value={formData.location.commune}
              onChange={handleChange}
              required
              disabled={!formData.location.district || loading}
            >
              <option value="">Select Commune</option>
              {communes.map((commune) => (
                <option key={commune} value={commune}>
                  {commune}
                </option>
              ))}
            </select>
            
            <select
              name="location.quartier"
              value={formData.location.quartier}
              onChange={handleChange}
              required
              disabled={!formData.location.commune || loading}
            >
              <option value="">Select Quartier</option>
              {quartiers.map((quartier) => (
                <option key={quartier} value={quartier}>
                  {quartier}
                </option>
              ))}
            </select>
          </div>
        </section>
  
        {/* Image Upload Section */}
        <section className="form-section">
          <h3>Property Images</h3>
          <div className="form-group">
            <label className="file-upload-label">
              <span>Select Images</span>
              <input
                type="file"
                name="images"
                onChange={handleImageChange}
                multiple
                accept="image/*"
                required
              />
            </label>
            <small>You can select multiple images (max 10)</small>
          </div>
      
          {/* Image Preview */}
          {imagePreviews.length > 0 && (
            <div className="preview-group">
              {imagePreviews.map((src, idx) => (
                <div key={idx} className="preview-image">
                  <img src={src} alt={`preview-${idx}`} />
                  <button 
                    type="button" 
                    className="remove-image-btn"
                    onClick={() => removeImage(idx)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
  
        {/* Loading Spinner */}
        {isSubmitting && (
          <div className="submission-overlay">
            <div className="spinner"></div>
            <p>Submitting your listing...</p>
          </div>
        )}
  
        {/* Submit Button */}
        <button 
          type="submit" 
          className="submit-button"
          disabled={isSubmitting || loading}
        >
          {isSubmitting ? (
            <span className="button-spinner"></span>
          ) : (
            "Submit Listing"
          )}
        </button>
      </form>
    </div>
  );
};

export default AddListing;
