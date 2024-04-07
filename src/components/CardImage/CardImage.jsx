import Carousel from 'react-bootstrap/Carousel';

function CardImage({ imageUrl }) {
  return (
    <Carousel data-bs-theme="dark" interval={null}>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src={imageUrl}
          alt="First slide"
        />
      </Carousel.Item>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src={imageUrl}
          alt="Second slide"
        />
      </Carousel.Item>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src={imageUrl}
          alt="Third slide"
        />
      </Carousel.Item>
    </Carousel>
  );
}

export default CardImage;
