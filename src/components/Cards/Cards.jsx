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

  const onClickCard = (listingId) => {
    navigate(`/view/${listingId}`);
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
      const listingId = listing._id; // Corrected to use listing._id
      const image = listing.image;
      if (listing.typeOfListing.apartment) {
        return (
          <div key={listingId} className="cardContainer">
            <Card style={{ width: "18rem" }}>
              <CardImage imageUrl={image} />
              <Card.Body onClick={() => onClickCard(listingId)}>
                <Card.Title className="position">
                  {listing.listerFirstName} {listing.listerLastName}
                </Card.Title>
                <Card.Text>
                  <h2 className="position">Apartment</h2>
                  <div className="position">
                    {listing.address} {listing.quartier} {listing.commune},
                  </div>
                  <div className="position">
                    {listing.district} {listing.ville}
                  </div>
                  <div className="position">
                    {listing.typeOfListing.apartment.bedroom} chambre(s) | {listing.typeOfListing.apartment.bathroom} salle(s) de bain(s)
                  </div>
                  <div className="position">
                    ${listing.priceMonthly} par mois
                  </div>
                </Card.Text>
              </Card.Body>
            </Card>
          </div>
        );
      } else if (listing.typeOfListing.house) {
        return (
          <div key={listingId}>
            <Card
              onClick={() => onClickCard(listingId)}
              style={{ width: "18rem" }}
            >
              <CardImage imageUrl={image} />
              <Card.Body onClick={onClickCard}>
              <Card.Title className="position">
                  {listing.listerFirstName} {listing.listerLastName}
                </Card.Title>
                <Card.Text>
                  <h2 className="position">Maison</h2>
                  <div className="position">
                    {listing.address} {listing.quartier} {listing.commune},
                  </div>
                  <div className="position">
                    {listing.district} {listing.ville}
                  </div>
                  <div className="position">
                    {listing.typeOfListing.house.bedroom} chambre(s) | {listing.typeOfListing.house.bathroom} salle(s) de bain(s)
                  </div>
                  <div className="position">
                    ${listing.priceMonthly} par mois
                  </div>
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
