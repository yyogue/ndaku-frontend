import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
import Carousel from "react-bootstrap/Carousel";
import axios from "axios";
import "./ViewCard.scss";

const ViewCard = () => {
  const { listingId } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = `http://localhost:8080/api/listings/${listingId}`;

    axios
      .get(apiUrl)
      .then((response) => {
        setListing(response.data.listing);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, [listingId]);

  const renderListingDetails = () => {
    if (!listing) return null; // Add this null check

    if (listing.typeOfListing.apartment) {
      return (
        <>
          <Card.Title>
            {listing.listerFirstName} {listing.listerLastName}
          </Card.Title>
          <Card.Text>
            Type: Apartment
            <br />
            Floor: {listing.typeOfListing.apartment.floor}
            <br />
            Bedrooms: {listing.typeOfListing.apartment.bedroom}
            <br />
            Bathrooms: {listing.typeOfListing.apartment.bathroom}
            <br />
            Kitchen: {listing.typeOfListing.apartment.kitchen}
            <br />
            Dining Room: {listing.typeOfListing.apartment.dinningRoom}
          </Card.Text>
        </>
      );
    } else if (listing.typeOfListing.house) {
      return (
        <>
          <Card.Title>
            {listing.listerFirstName} {listing.listerLastName}
          </Card.Title>
          <Card.Text>
            Type: House
            <br />
            Bedrooms: {listing.typeOfListing.house.bedroom}
            <br />
            Bathrooms: {listing.typeOfListing.house.bathroom}
            <br />
            Kitchen: {listing.typeOfListing.house.kitchen}
            <br />
            Dining Room: {listing.typeOfListing.house.dinningRoom}
          </Card.Text>
        </>
      );
    }
  };

  return (
    <div className="mainView">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <Carousel data-bs-theme="dark" interval={null}>
            <Carousel.Item>
              <img
                className="d-block w-100"
                src={listing.image}
              />
            </Carousel.Item>
            <Carousel.Item>
              <img
                className="d-block w-100"
                src={listing.image}
              />
            </Carousel.Item>
          </Carousel>
          {renderListingDetails()}
        </>
      )}
    </div>
  );
};

export default ViewCard;
