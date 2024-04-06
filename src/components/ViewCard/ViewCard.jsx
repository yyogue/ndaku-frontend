import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

const ViewCard = () => {
  return (
    <Container>
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Sample Card Title</Card.Title>
              <Card.Text>
                This is a sample card text. You can add any content here.
              </Card.Text>
              <Button variant="primary">Learn More</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Another Card</Card.Title>
              <Card.Text>
                This is another sample card. You can add more cards like this.
              </Card.Text>
              <Button variant="primary">Explore</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ViewCard;
