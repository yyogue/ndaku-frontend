import React, { useState } from "react";
import axios from "axios";
import "./AddListing.scss";

const AddListing = () => {
  const [formData, setFormData] = useState({
    listerFirstName: "",
    listerLastName: "",
    listerEmailAddress: "",
    listerPhoneNumber: "",
    typeOfListing: "",
    priceMonthly: "",
    priceDaily: "",
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

  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

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
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        Object.entries(value).forEach(([subKey, subVal]) => {
          data.append(`details.${subKey}`, subVal);
        });
      } else {
        data.append(key, value);
      }
    });

    if (image) data.append("image", image);

    try {
      const res = await axios.post("http://localhost:8080/api/listings", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("Listing added successfully!");
      setFormData({
        listerFirstName: "",
        listerLastName: "",
        listerEmailAddress: "",
        listerPhoneNumber: "",
        typeOfListing: "",
        priceMonthly: "",
        priceDaily: "",
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
      setImage(null);
    } catch (err) {
      setMessage("Error uploading listing. Please try again.");
    }
  };

  return (
    <div className="add-listing-container">
      <h2>Add New Listing</h2>
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
            <option value="">Select Type</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="condo">Condo</option>
          </select>
          <input
            type="number"
            name="priceMonthly"
            placeholder="Monthly Price"
            value={formData.priceMonthly}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="priceDaily"
            placeholder="Daily Price"
            value={formData.priceDaily}
            onChange={handleChange}
            required
          />
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
          <input type="file" onChange={handleImageChange} accept="image/*" />
        </div>

        <button type="submit">Submit</button>
        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
};

export default AddListing;
