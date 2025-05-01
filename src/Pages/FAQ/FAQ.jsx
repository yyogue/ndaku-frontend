import React from "react";
import "./FAQ.scss";

const FAQ = () => {
  return (
    <div className="faqContainer">
      <h1>Frequently Asked Questions</h1>
      <div className="faqItem">
        <h3>How do I create an account?</h3>
        <p>
          To create an account, click on the 'Sign Up' button at the top of the
          page, and provide your details.
        </p>
      </div>
      <div className="faqItem">
        <h3>How do I list an apartment for rent?</h3>
        <p>
          To list an apartment, click the 'Post a Listing' button and fill out
          the form with your property details.
        </p>
      </div>
      {/* Add more FAQs here */}
    </div>
  );
};

export default FAQ;
