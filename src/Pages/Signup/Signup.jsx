import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../redux/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./Signup.scss";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/users/register", formData);

      const res = await API.post("/users/login", {
        email: formData.email,
        password: formData.password,
      });

      dispatch(loginSuccess({ user: res.data.user, token: res.data.token }));

      navigate("/home");
    } catch (err) {
      alert(err.response?.data?.message || "Signup/Login failed.");
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-image-side" />
      <div className="signup-form-side">
        <div className="signup-container">
          <h2>Créer un compte</h2>
          <form className="signup-form" onSubmit={handleSubmit}>
            <input
              name="firstName"
              placeholder="Prénom"
              onChange={handleChange}
              required
            />
            <input
              name="lastName"
              placeholder="Nom"
              onChange={handleChange}
              required
            />
            <input
              name="phoneNumber"
              placeholder="Numéro de téléphone"
              onChange={handleChange}
              required
            />
            <input
              name="email"
              placeholder="E-mail"
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Mot de passe"
              onChange={handleChange}
              required
            />

            <button type="submit">Créer un compte</button>
          </form>

          <div className="terms">
            En vous inscrivant, vous acceptez nos{" "}
            <a href="/terms">Conditions d'utilisation</a> et{" "}
            <a href="/privacy">Politique de confidentialité</a>.
          </div>

          <div className="existing-account">
            Vous avez déjà un compte ? <Link to="/login">Se connecter</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
