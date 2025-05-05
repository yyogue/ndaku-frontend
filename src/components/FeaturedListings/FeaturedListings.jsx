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
  const [activeImages, setActiveImages] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState("");

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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImages((prev) => {
        const updated = { ...prev };
        featured.forEach((home) => {
          const current = prev[home._id] || 0;
          const nextIndex = (current + 1) % (home.images?.length || 1);
          updated[home._id] = nextIndex;
        });
        return updated;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [featured]);

  const handlePrev = (id, imagesLength) => {
    setActiveImages((prev) => ({
      ...prev,
      [id]: (prev[id] - 1 + imagesLength) % imagesLength,
    }));
  };

  const handleNext = (id, imagesLength) => {
    setActiveImages((prev) => ({
      ...prev,
      [id]: (prev[id] + 1) % imagesLength,
    }));
  };

  const handleDotClick = (id, index) => {
    setActiveImages((prev) => ({ ...prev, [id]: index }));
  };

  const handleImageClick = (src) => {
    setModalImage(src);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalImage("");
  };

  return (
    <div className="featuredContainer">
      <h2 className="sectionTitle">Featured Properties</h2>
      <div className="cardsGrid">
        {featured.map((home) => {
          const currentImgIndex = activeImages[home._id] || 0;
          const currentImage = home.images?.[currentImgIndex];

          return (
            <div className="card" key={home._id}>
              {home.images && home.images.length > 0 && (
                <div className="carouselWrapper">
                  <img
                    loading="lazy"
                    src={currentImage}
                    alt={`Slide ${currentImgIndex + 1}`}
                    className="propertyImage"
                    onClick={() => handleImageClick(currentImage)}
                  />
                  {home.images.length > 1 && (
                    <>
                      <button
                        className="carouselBtn prev"
                        onClick={() => handlePrev(home._id, home.images.length)}
                      >
                        ❮
                      </button>
                      <button
                        className="carouselBtn next"
                        onClick={() => handleNext(home._id, home.images.length)}
                      >
                        ❯
                      </button>
                      <div className="dotsContainer">
                        {home.images.map((_, index) => (
                          <span
                            key={index}
                            className={`dot ${index === currentImgIndex ? "active" : ""}`}
                            onClick={() => handleDotClick(home._id, index)}
                          ></span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
              <div className="cardInfo">
                <h3>{home.typeOfListing || "Property"}</h3>
                <p className="location">
                  <i className="fas fa-map-marker-alt"></i> {home.address}, {home.commune}
                </p>
                <div className="features">
                  <span><i className="fas fa-bed"></i> {home.details?.bedroom || 0} Beds</span>
                  <span><i className="fas fa-bath"></i> {home.details?.bathroom || 0} Baths</span>
                </div>
                <div className="price">
                  {home.listingType === 'rent' && `$${home.priceMonthly?.toLocaleString()}/mo`}
                  {home.listingType === 'sale' && `$${home.priceSale?.toLocaleString()}`}
                  {home.listingType === 'daily' && `$${home.priceDaily?.toLocaleString()}/day`}
                </div>
                <button className="voirPlusBtn">
                  <Link to={`/listing/${home._id}`}>View Details</Link>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modalOverlay" onClick={closeModal}>
          <img src={modalImage} alt="Full preview" className="modalImage" />
        </div>
      )}
    </div>
  );
};

export default FeaturedListings;
