// AddListing.js
import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import citiesData from "../../data/citiesData";
import "./AddListing.scss";

const AddListing = () => {
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
        diningRoom: "", // Fixed spelling from "dinningRoom" to "diningRoom"
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
    if (formData.location.ville) {
      const selectedCity = citiesData.find(city => city.nom === formData.location.ville);
      
      if (selectedCity && selectedCity.locationData) {
        setDistricts(selectedCity.locationData.districts.map(d => d.nom));
      } else {
        setDistricts([]);
      }
      
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

  // Update quartiers when commune changes
  useEffect(() => {
    if (formData.location.ville && formData.location.district && formData.location.commune) {
      const selectedCity = citiesData.find(city => city.nom === formData.location.ville);
      
      if (selectedCity && selectedCity.locationData) {
        const districtData = selectedCity.locationData.districts.find(
          d => d.nom === formData.location.district
        );
        
        if (districtData && districtData.communes) {
          const communeData = districtData.communes.find(
            c => c.nom === formData.location.commune
          );
          
          if (communeData && communeData.quartiers) {
            setQuartiers(communeData.quartiers);
          } else {
            setQuartiers([]);
          }
        }
      }
      
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          quartier: ""
        }
      }));
    }
  }, [formData.location.commune, formData.location.district, formData.location.ville]);

  const resetForm = () => {
    setFormData(initialFormState);
    setImages([]);
    setImagePreviews([]);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
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
      setError("Échec de l'authentification. Veuillez vous reconnecter.");
      setIsSubmitting(false);
      return;
    }

    try {
      const data = new FormData();
      const startTime = Date.now();

      // Append form data
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

      const detailsObj = {
        floor: parseInt(formData.property.details.floor) || 0,
        bedroom: parseInt(formData.property.details.bedroom) || 0,
        bathroom: parseInt(formData.property.details.bathroom) || 0,
        kitchen: parseInt(formData.property.details.kitchen) || 0,
        diningRoom: parseInt(formData.property.details.diningRoom) || 0, // Fixed spelling
      };
      data.append("details", JSON.stringify(detailsObj));

      const priceValue = parseFloat(formData.property.price);
      if (isNaN(priceValue) || priceValue <= 0) {
        setError("Veuillez entrer un prix valide supérieur à 0.");
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.property.listingType) {
        setError("Veuillez sélectionner un type d'annonce (location, vente ou journalier).");
        setIsSubmitting(false);
        return;
      }
      
      if (formData.property.listingType === "sale") {
        data.append("priceSale", priceValue);
      } else if (formData.property.listingType === "rent") {
        data.append("priceMonthly", priceValue);
      } else if (formData.property.listingType === "daily") {
        data.append("priceDaily", priceValue);
      }      

      if (images.length === 0) {
        setError("Au moins une image est requise");
        setIsSubmitting(false);
        return;
      }
      
      images.forEach((file) => data.append("images", file));

      const response = await API.post("/listings/add", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const submissionTime = Date.now() - startTime;
      const minDisplayTime = 1000;
      const remainingTime = Math.max(minDisplayTime - submissionTime, 0);

      setShowSuccess(true);
      setMessage("Annonce ajoutée avec succès !");
      resetForm(); 

      timeoutRef.current = setTimeout(() => {
        window.location.reload();
      }, remainingTime);

    } catch (err) {
      console.error("Erreur de soumission:", err);
      setError(
        err.response?.data?.message ||
        "Échec de la soumission de l'annonce. Veuillez réessayer."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriceLabel = () => {
    switch (formData.property.listingType) {
      case "rent": return "Loyer Mensuel";
      case "daily": return "Loyer Journalier";
      case "sale": return "Prix de Vente";
      default: return "Prix";
    }
  };

  return (
    <div className="add-listing-container">
      <h2>Ajouter une Nouvelle Annonce</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {message && showSuccess && (
        <div className="success-message">{message}</div>
      )}
  
      <form onSubmit={handleSubmit} className="listing-form">
        <section className="form-section">
          <h3>Informations de Contact</h3>
          <div className="form-group">
            <input
              type="text"
              name="lister.firstName"
              placeholder="Prénom"
              value={formData.lister.firstName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="lister.lastName"
              placeholder="Nom"
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
              placeholder="Téléphone"
              value={formData.lister.phone}
              onChange={handleChange}
              required
            />
          </div>
        </section>
  
        <section className="form-section">
          <h3>Détails du Bien</h3>
          <div className="form-group">
            <select
              name="property.type"
              value={formData.property.type}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionnez le Type de Bien</option>
              <option value="apartment">Appartement</option>
              <option value="house">Maison</option>
              <option value="condo">Condominium</option>
            </select>
          </div>
      
          <div className="form-group listing-price">
            <select
              name="property.listingType"
              value={formData.property.listingType}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionnez le Type d'Annonce</option>
              <option value="rent">Location</option>
              <option value="daily">Journalier</option>
              <option value="sale">Vente</option>
            </select>
            <div className="price-input">
              <span>$</span>
              <input
                type="text" // Changed from "number" to "text" to remove spinners
                name="property.price"
                value={formData.property.price}
                onChange={handleChange}
                placeholder={getPriceLabel()}
                required
                pattern="[0-9]*\.?[0-9]+" // Added pattern for validation
              />
            </div>
          </div>
      
          <div className="form-group details-group">
            <input
              type="text" // Changed from "number" to "text" to remove spinners
              name="property.details.floor"
              placeholder="Étage"
              value={formData.property.details.floor}
              onChange={handleChange}
              pattern="[0-9]*" // Added pattern for validation
            />
            <input
              type="text" // Changed from "number" to "text"
              name="property.details.bedroom"
              placeholder="Chambres"
              value={formData.property.details.bedroom}
              onChange={handleChange}
              pattern="[0-9]*" // Added pattern for validation
            />
            <input
              type="text" // Changed from "number" to "text"
              name="property.details.bathroom"
              placeholder="Salles de Bain"
              value={formData.property.details.bathroom}
              onChange={handleChange}
              pattern="[0-9]*" // Added pattern for validation
            />
            <input
              type="text" // Changed from "number" to "text"
              name="property.details.kitchen"
              placeholder="Cuisines"
              value={formData.property.details.kitchen}
              onChange={handleChange}
              pattern="[0-9]*" // Added pattern for validation
            />
            <input
              type="text" // Changed from "number" to "text"
              name="property.details.diningRoom"
              placeholder="Salles à Manger"
              value={formData.property.details.diningRoom}
              onChange={handleChange}
              pattern="[0-9]*" // Added pattern for validation
            />
          </div>
        </section>
  
        <section className="form-section">
          <h3>Localisation</h3>
          <div className="form-group">
            <input
              type="text"
              name="location.address"
              placeholder="Adresse"
              value={formData.location.address}
              onChange={handleChange}
              required
            />
            
            <select
              name="location.ville"
              value={formData.location.ville}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Sélectionnez la Ville</option>
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
              <option value="">Sélectionnez le District</option>
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
              <option value="">Sélectionnez la Commune</option>
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
              <option value="">Sélectionnez le Quartier</option>
              {quartiers.map((quartier) => (
                <option key={quartier} value={quartier}>
                  {quartier}
                </option>
              ))}
            </select>
          </div>
        </section>
  
        <section className="form-section">
          <h3>Images du Bien</h3>
          <div className="form-group">
            <label className="file-upload-label">
              <span>Sélectionnez des Images</span>
              <input
                type="file"
                name="images"
                onChange={handleImageChange}
                multiple
                accept="image/*"
                required
              />
            </label>
            <small>Vous pouvez sélectionner plusieurs images (max 10)</small>
          </div>
      
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
  
        {isSubmitting && (
          <div className="submission-overlay">
            <div className="spinner"></div>
            <p>Soumission de votre annonce...</p>
          </div>
        )}
  
        <button 
          type="submit" 
          className="submit-button"
          disabled={isSubmitting || loading}
        >
          {isSubmitting ? (
            <span className="button-spinner"></span>
          ) : (
            "Soumettre l'Annonce"
          )}
        </button>
      </form>
    </div>
  );
};

export default AddListing;
