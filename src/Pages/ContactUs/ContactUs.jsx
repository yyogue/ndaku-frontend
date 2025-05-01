import React from "react";
import "./ContactUs.scss";

const ContactUs = () => {
  return (
    <div className="contactContainer">
      <h2>Contactez-nous</h2>
      <p>Si vous avez des questions, n'hésitez pas à nous contacter !</p>
      <form className="contactForm">
        <input type="text" placeholder="Votre nom" required />
        <input type="email" placeholder="Votre adresse e-mail" required />
        <textarea placeholder="Votre message" rows="5" required></textarea>
        <button type="submit">Envoyer le message</button>
      </form>
    </div>
  );
};

export default ContactUs;
