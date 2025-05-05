import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import "./FeaturedListings.scss";

const shuffleArray = (arr) => {
  return arr
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
};

const FeaturedListings = () => {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await API.get("/listings");
        const allListings = Array.isArray(res.data)
          ? res.data
          : res.data?.data || res.data?.listings || [];
        const shuffled = shuffleArray(allListings);
        setFeatured(shuffled.slice(0, 4));
      } catch (err) {
        console.error("Error fetching listings:", err);
      }
    };
    fetchListings();
  }, []);

  return (
    <div className="featuredContainer">
      <h2 className="sectionTitle">Featured Properties</h2>
      <div className="cardsGrid">
        {featured.map((home) => (
          <div className="card" key={home._id}>
            {home.images && home.images.length > 0 && (
              <div className="imageCarousel">
                <img
                  src={home.images[home.currentImageIndex || 0]}
                  alt={`${home.typeOfListing || "Property"} in ${home.commune}`}
                  className="propertyImage"
                />
                {home.images.length > 1 && (
                  <>
                    <button
                      className="arrow left"
                      onClick={() => {
                        setFeatured((prev) =>
                          prev.map((item) =>
                            item._id === home._id
                              ? {
                                  ...item,
                                  currentImageIndex:
                                    (item.currentImageIndex || 0) === 0
                                      ? home.images.length - 1
                                      : (item.currentImageIndex || 0) - 1,
                                }
                              : item
                          )
                        );
                      }}
                    >
                      &#10094;
                    </button>
                    <button
                      className="arrow right"
                      onClick={() => {
                        setFeatured((prev) =>
                          prev.map((item) =>
                            item._id === home._id
                              ? {
                                  ...item,
                                  currentImageIndex:
                                    (item.currentImageIndex || 0) ===
                                    home.images.length - 1
                                      ? 0
                                      : (item.currentImageIndex || 0) + 1,
                                }
                              : item
                          )
                        );
                      }}
                    >
                      &#10095;
                    </button>
                  </>
                )}
              </div>
            )}

            <div className="cardInfo">
              <h3>{home.typeOfListing || "Property"}</h3>
              <p className="location">
                <i className="fas fa-map-marker-alt"></i> {home.address},{" "}
                {home.commune}
              </p>

              <div className="features">
                <span>
                  <i className="fas fa-bed"></i> {home.details?.bedroom || 0}{" "}
                  Beds
                </span>
                <span>
                  <i className="fas fa-bath"></i> {home.details?.bathroom || 0}{" "}
                  Baths
                </span>
              </div>

              <div className="price">
                {home.listingType === "rent" &&
                  `$${home.priceMonthly?.toLocaleString()}/mo`}
                {home.listingType === "sale" &&
                  `$${home.priceSale?.toLocaleString()}`}
                {home.listingType === "daily" &&
                  `$${home.priceDaily?.toLocaleString()}/day`}
              </div>

              <button className="voirPlusBtn">
                <Link to={`/listing/${home._id}`}>View Details</Link>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedListings;
