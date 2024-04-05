import Image from "react-bootstrap/Image";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";

import "./BackGround.scss";

function BackGround() {
  return (
    <div className="mainDiv">
      <Col xxl="12">
        <Form.Control type="text" placeholder="Search" className="mr-sm-2" />
      </Col>
    </div>
  );
}

export default BackGround;
