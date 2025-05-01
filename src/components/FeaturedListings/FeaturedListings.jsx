import React from "react";
import { Link } from "react-router-dom";
import "./FeaturedListings.scss";

const featured = [
  {
    id: 1,
    title: "Spacious 2BR in Gombe",
    location: "Gombe, Kinshasa",
    price: "$400/month",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqsJ4LhakfmO587QbnkKWVvmhFPz6-8zDBnQ&s",
  },
  {
    id: 2,
    title: "Modern Studio in Ngaliema",
    location: "Ngaliema, Kinshasa",
    price: "$250/month",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTzsMZP68dJlj9vkOlmG0I58PBnRPiNE7Zhg&s",
  },
  {
    id: 3,
    title: "3BR Family Home in Limete",
    location: "Limete, Kinshasa",
    price: "$600/month",
    image: "https://i0.wp.com/integrum.co.ke/wp-content/uploads/2024/07/types-of-house-designs-in-kenya.webp?fit=1280%2C853&ssl=1",
  },
  {
    id: 4,
    title: "Chic 1BR in Bandalungwa",
    location: "Bandalungwa, Kinshasa",
    price: "$300/month",
    image: "https://webberstudio.com/wp-content/uploads/2023/02/Stunning-House-Design.jpg",
  },
];

const FeaturedListings = () => {
  return (
    <div className="featuredContainer">
      {featured.map((home) => (
        <div className="card" key={home.id}>
          <img src={home.image} alt={home.title} />
          <div className="cardInfo">
            <h3>{home.title}</h3>
            <p>{home.location}</p>
            <span>{home.price}</span>
            <button className="voirPlusBtn">
              <Link to="/voirPlus">Voir plus</Link>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeaturedListings;
