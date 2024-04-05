import Image from "react-bootstrap/Image";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import "./BackGround.scss";

function BackGround() {
  return (
    <div className="mainDiv">
      <Image className="image" src="kin.jpg" fluid />
      <div className="centered">
        <div className="searchNbutton">
          <Col xxl="12">
            <Form.Control
              type="text"
              placeholder="Search"
              className="mr-sm-2"
            />
          </Col>
          <Col>
            <Button type="submit">Submit</Button>
          </Col>
        </div>
      </div>
    </div>
  );
}

export default BackGround;
