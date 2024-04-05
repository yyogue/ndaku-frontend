import React from "react";
import Card from "react-bootstrap/Card";
import "./Cards.scss";
import CardImage from "../CardImage/CardImage";

const image =
  "https://cf.bstatic.com/xdata/images/hotel/max1024x768/494295430.jpg?k=1ce9f721c022d882690f6e9743173b28f3a441b9a55ff64c9dbbaf4be8f9761e&o=&hp=1";

function Cards() {
  return (
    <>
      <div className="mainCards">
        <Card style={{ width: "18rem" }}>
          <CardImage />
          <Card.Body>
            <Card.Title>Card Title 1</Card.Title>
            <Card.Text>
              Some quick example text to build on the card title and make up the
              bulk of the card's content.
            </Card.Text>
          </Card.Body>
        </Card>
        <Card style={{ width: "18rem" }}>
          <CardImage />
          <Card.Body>
            <Card.Title>Card Title 2</Card.Title>
            <Card.Text>
              Some quick example text to build on the card title and make up the
              bulk of the card's content.
            </Card.Text>
          </Card.Body>
        </Card>
        <Card style={{ width: "18rem" }}>
          <CardImage />
          <Card.Body>
            <Card.Title>Card Title 2</Card.Title>
            <Card.Text>
              Some quick example text to build on the card title and make up the
              bulk of the card's content.
            </Card.Text>
          </Card.Body>
        </Card>
        <Card style={{ width: "18rem" }}>
          <CardImage />
          <Card.Body>
            <Card.Title>Card Title 2</Card.Title>
            <Card.Text>
              Some quick example text to build on the card title and make up the
              bulk of the card's content.
            </Card.Text>
          </Card.Body>
        </Card>
      </div>
      <div className="mainCards">
        <Card style={{ width: "18rem" }}>
          <CardImage />
          <Card.Body>
            <Card.Title>Card Title 1</Card.Title>
            <Card.Text>
              Some quick example text to build on the card title and make up the
              bulk of the card's content.
            </Card.Text>
          </Card.Body>
        </Card>
        <Card style={{ width: "18rem" }}>
          <CardImage />
          <Card.Body>
            <Card.Title>Card Title 2</Card.Title>
            <Card.Text>
              Some quick example text to build on the card title and make up the
              bulk of the card's content.
            </Card.Text>
          </Card.Body>
        </Card>
        <Card style={{ width: "18rem" }}>
          <CardImage />
          <Card.Body>
            <Card.Title>Card Title 2</Card.Title>
            <Card.Text>
              Some quick example text to build on the card title and make up the
              bulk of the card's content.
            </Card.Text>
          </Card.Body>
        </Card>
        <Card style={{ width: "18rem" }}>
          <CardImage />
          <Card.Body>
            <Card.Title>Card Title 2</Card.Title>
            <Card.Text>
              Some quick example text to build on the card title and make up the
              bulk of the card's content.
            </Card.Text>
          </Card.Body>
        </Card>
      </div>
    </>
  );
}

export default Cards;
