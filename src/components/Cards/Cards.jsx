import React, { useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import "./Cards.scss";
import CardImage from "../CardImage/CardImage";
import ExploreMsg from "../ExpoloreMsg/ExploreMsg";
import { useNavigate } from "react-router-dom";

function Cards() {
  const apiUrl = "http://localhost:8080/api/listings";
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const onClickCard = () => {
    navigate("/view");
  };

  useEffect(() => {
    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // Shuffle the data to get random listings
        const shuffledListings = data.listings.sort(() => Math.random() - 0.5);
        // Take only the first 8 listings
        const selectedListings = shuffledListings.slice(0, 8);
        setListings(selectedListings);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  const renderListings = () => {
    return listings.map((listing) => {
      const image = listing.image || "";
      if (listing.typeOfListing.apartment) {
        return (
          <div key={listing._id} className="cardContainer">
            <Card style={{ width: "18rem" }}>
              <CardImage imageUrl={image} />
              <Card.Body onClick={onClickCard}>
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
              </Card.Body>
            </Card>
          </div>
        );
      } else if (listing.typeOfListing.house) {
        return (
          <div key={listing._id} className="cardContainer">
            <Card onClick={onClickCard} style={{ width: "18rem" }}>
              <CardImage imageUrl={image} />
              <Card.Body onClick={onClickCard}>
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
              </Card.Body>
            </Card>
          </div>
        );
      }
      return null;
    });
  };

  return (
    <>
      <ExploreMsg />
      <div className="mainCards">
        {loading ? <div>Loading...</div> : renderListings()}
      </div>
    </>
  );
}

export default Cards;
