import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";
import citiesData from "../../data/citiesData";
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

  // Location dropdown states
  const [villes, setVilles] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [quartiers, setQuartiers] = useState([]);

  // Initialize villes data
  useEffect(() => {
    const activeCities = citiesData.filter(city => city.isActive).map(city => city.nom);
    setVilles(activeCities);
  }, []);

  // Update districts when city changes
  useEffect(() => {
    if (formData.ville) {
      const selectedCity = citiesData.find(city => city.nom === formData.ville);
      
      if (selectedCity && selectedCity.locationData) {
        setDistricts(selectedCity.locationData.districts.map(d => d.nom));
        
        // Check if current district is still valid for this city
        const isDistrictValid = selectedCity.locationData.districts.some(d => d.nom === formData.district);
        
        if (!isDistrictValid) {
          // If district is invalid, reset dependent fields
          setFormData(prev => ({
            ...prev,
            district: "",
            commune: "",
            quartier: ""
          }));
          setCommunes([]);
          setQuartiers([]);
        }
      } else {
        setDistricts([]);
      }
    } else {
      // If no city selected, reset all dependent fields
      setDistricts([]);
      setCommunes([]);
      setQuartiers([]);
      setFormData(prev => ({
        ...prev,
        district: "",
        commune: "",
        quartier: ""
      }));
    }
  }, [formData.ville]);

  // Update communes when district changes
  useEffect(() => {
    if (formData.ville && formData.district) {
      const selectedCity = citiesData.find(city => city.nom === formData.ville);
      
      if (selectedCity && selectedCity.locationData) {
        const districtData = selectedCity.locationData.districts.find(
          d => d.nom === formData.district
        );
        
        if (districtData && districtData.communes) {
          setCommunes(districtData.communes.map(c => c.nom));
          
          // Check if current commune is still valid for this district
          const isCommuneValid = districtData.communes.some(c => c.nom === formData.commune);
          
          if (!isCommuneValid) {
            // If commune is invalid, reset dependent fields
            setFormData(prev => ({
              ...prev,
              commune: "",
              quartier: ""
            }));
            setQuartiers([]);
          }
        } else {
          setCommunes([]);
        }
      }
    } else if (formData.district === "") {
      // If district is cleared, reset dependent fields
      setCommunes([]);
      setQuartiers([]);
      setFormData(prev => ({
        ...prev,
        commune: "",
        quartier: ""
      }));
    }
  }, [formData.district, formData.ville]);

  // Update quartiers when commune changes
  useEffect(() => {
    if (formData.ville && formData.district && formData.commune) {
      const selectedCity = citiesData.find(city => city.nom === formData.ville);
      
      if (selectedCity && selectedCity.locationData) {
        const districtData = selectedCity.locationData.districts.find(
          d => d.nom === formData.district
        );
        
        if (districtData && districtData.communes) {
          const communeData = districtData.communes.find(
            c => c.nom === formData.commune
          );
          
          if (communeData && communeData.quartiers) {
            setQuartiers(communeData.quartiers);
            
            // Check if current quartier is still valid for this commune
            const isQuartierValid = communeData.quartiers.includes(formData.quartier);
            
            if (!isQuartierValid) {
              // If quartier is invalid, reset it
              setFormData(prev => ({
                ...prev,
                quartier: ""
              }));
            }
          } else {
            setQuartiers([]);
          }
        }
      }
    } else if (formData.commune === "") {
      // If commune is cleared, reset quartier
      setQuartiers([]);
      setFormData(prev => ({
        ...prev,
        quartier: ""
      }));
    }
  }, [formData.commune, formData.district, formData.ville]);

  // Load listing data
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        setMessage({ text: "", type: "" });

        let listingData;
        if (listing) {
          listingData = listing;
        } else if (id) {
          const response = await API.get(`/listings/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          listingData = response.data;
        } else {
          throw new Error("No listing ID provided");
        }

        const inferredPrice = listingData.priceMonthly || listingData.priceDaily || listingData.priceSale || "";

        // Set form data
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
        
        // Initialize location data manually to ensure correct cascading
        if (listingData.ville) {
          const selectedCity = citiesData.find(city => city.nom === listingData.ville);
          if (selectedCity?.locationData) {
            // Set districts
            const cityDistricts = selectedCity.locationData.districts.map(d => d.nom);
            setDistricts(cityDistricts);
            
            // Set communes if district exists
            if (listingData.district) {
              const districtData = selectedCity.locationData.districts.find(
                d => d.nom === listingData.district
              );
              
              if (districtData?.communes) {
                const districtCommunes = districtData.communes.map(c => c.nom);
                setCommunes(districtCommunes);
                
                // Set quartiers if commune exists
                if (listingData.commune) {
                  const communeData = districtData.communes.find(
                    c => c.nom === listingData.commune
                  );
                  
                  if (communeData?.quartiers) {
                    setQuartiers(communeData.quartiers);
                  }
                }
              }
            }
          }
        }
        
        setLoading(false);
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
            
            <select
              name="ville"
              value={formData.ville}
              onChange={handleChange}
              required
            >
              <option value="">Select City</option>
              {villes.map((ville) => (
                <option key={ville} value={ville}>
                  {ville}
                </option>
              ))}
              {formData.ville && !villes.includes(formData.ville) && (
                <option value={formData.ville}>
                  {formData.ville} (Current)
                </option>
              )}
            </select>
            
            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
              required
              disabled={!formData.ville}
            >
              <option value="">Select District</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
              {formData.district && !districts.includes(formData.district) && (
                <option value={formData.district}>
                  {formData.district} (Current)
                </option>
              )}
            </select>
            
            <select
              name="commune"
              value={formData.commune}
              onChange={handleChange}
              required
              disabled={!formData.district}
            >
              <option value="">Select Commune</option>
              {communes.map((commune) => (
                <option key={commune} value={commune}>
                  {commune}
                </option>
              ))}
              {formData.commune && !communes.includes(formData.commune) && (
                <option value={formData.commune}>
                  {formData.commune} (Current)
                </option>
              )}
            </select>
            
            <select
              name="quartier"
              value={formData.quartier}
              onChange={handleChange}
              required
              disabled={!formData.commune}
            >
              <option value="">Select Quartier</option>
              {quartiers.map((quartier) => (
                <option key={quartier} value={quartier}>
                  {quartier}
                </option>
              ))}
              {formData.quartier && !quartiers.includes(formData.quartier) && (
                <option value={formData.quartier}>
                  {formData.quartier} (Current)
                </option>
              )}
            </select>
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

