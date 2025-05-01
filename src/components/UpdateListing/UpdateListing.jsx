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
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        if (!token) {
          setMessage("Authentication token missing.");
          return;
        }

        const response = await API.get(`/listings/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const listing = response.data.listing || response.data;

        setFormData({
          listerFirstName: listing.listerFirstName || "",
          listerLastName: listing.listerLastName || "",
          listerEmailAddress: listing.listerEmailAddress || "",
          listerPhoneNumber: listing.listerPhoneNumber || "",
          typeOfListing: listing.typeOfListing || "",
          listingType: listing.listingType || "",
          price:
            listing.priceMonthly || listing.priceDaily || listing.priceSale || "",
          details: listing.details || {
            floor: "",
            bedroom: "",
            bathroom: "",
            kitchen: "",
            dinningRoom: "",
          },
          address: listing.address || "",
          quartier: listing.quartier || "",
          commune: listing.commune || "",
          district: listing.district || "",
          ville: listing.ville || "",
        });

        setImages(listing.images || []);
      } catch (err) {
        console.error(err);
        setMessage("Error fetching listing details.");
      }
    };

    fetchListing();
  }, [id, token]);

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
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        Object.entries(value).forEach(([subKey, subVal]) => {
          data.append(`details.${subKey}`, subVal);
        });
      } else if (key !== "price") {
        data.append(key, value);
      }
    });

    if (formData.listingType === "sale") {
      data.append("priceSale", formData.price);
    } else if (formData.listingType === "rent") {
      data.append("priceMonthly", formData.price);
    } else if (formData.listingType === "daily") {
      data.append("priceDaily", formData.price);
    }

    images.forEach((file) => {
      data.append("images", file);
    });

    try {
      await API.put(`/listings/update/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Listing updated successfully!");
      setTimeout(() => {
        navigate("/list-property");
      }, 1500);
    } catch (err) {
      console.error(err);
      setMessage("Error updating listing. Please try again.");
    }
  };

  const getPriceLabel = () => {
    switch (formData.listingType) {
      case "rent":
        return "Monthly Rent";
      case "daily":
        return "Daily Rent";
      case "sale":
        return "Sale Price";
      default:
        return "Price";
    }
  };

  return (
    <div className="update-listing-container">
      <h2>Update Listing</h2>
      <form onSubmit={handleSubmit} className="listing-form">
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
        <div className="form-group">
          <input
            type="file"
            onChange={handleImageChange}
            multiple
            accept="image/*"
          />
        </div>
        <button type="submit">Update Listing</button>
        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
};

export default UpdateListing;
