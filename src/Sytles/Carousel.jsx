// Carousel.jsx
import React, { useState } from 'react';
import './Carousel.scss';

const Carousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  return (
    <div className="carousel">
      <div className="carousel__container">
        <img
          src={images[currentIndex]}
          alt="carousel slide"
          className="carousel__image"
        />
      </div>
      <button className="carousel__prev" onClick={prevSlide}>
        &#10094;
      </button>
      <button className="carousel__next" onClick={nextSlide}>
        &#10095;
      </button>
    </div>
  );
};

export default Carousel;
