import Carousel from 'react-bootstrap/Carousel';
const image1 = "https://cf.bstatic.com/xdata/images/hotel/max1024x768/494295430.jpg?k=1ce9f721c022d882690f6e9743173b28f3a441b9a55ff64c9dbbaf4be8f9761e&o=&hp=1"
const image2 = "https://fi-hatchbox-production-uploads.s3.amazonaws.com/posts/nairobi_skyline.jpg"
const image3 = "https://prod.cdn-medias.theafricareport.com/cdn-cgi/image/q=auto,f=auto,metadata=none,width=732,height=419,fit=cover/https://prod.cdn-medias.theafricareport.com/medias/2023/01/Picture4-e1674061748484.jpg"


function CardImage() {
  return (
    <Carousel data-bs-theme="dark">
      <Carousel.Item>
        <img
          className="d-block w-100"
          src={image1}
          alt="First slide"
        />
      </Carousel.Item>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src={image2}
          alt="Second slide"
        />
      </Carousel.Item>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src={image3}
          alt="Third slide"
        />
      </Carousel.Item>
    </Carousel>
  );
}

export default CardImage;