import Carousel from 'react-bootstrap/Carousel';
const image = "https://cf.bstatic.com/xdata/images/hotel/max1024x768/494295430.jpg?k=1ce9f721c022d882690f6e9743173b28f3a441b9a55ff64c9dbbaf4be8f9761e&o=&hp=1"


function CardImage() {
  return (
    <Carousel data-bs-theme="dark">
      <Carousel.Item>
        <img
          className="d-block w-100"
          src={image}
          alt="First slide"
        />
      </Carousel.Item>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src={image}
          alt="Second slide"
        />
      </Carousel.Item>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src={image}
          alt="Third slide"
        />
      </Carousel.Item>
    </Carousel>
  );
}

export default CardImage;