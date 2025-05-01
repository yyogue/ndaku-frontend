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
          <h2>Create an Account</h2>
          <form className="signup-form" onSubmit={handleSubmit}>
            <input
              name="firstName"
              placeholder="First Name"
              onChange={handleChange}
              required
            />
            <input
              name="lastName"
              placeholder="Last Name"
              onChange={handleChange}
              required
            />
            <input
              name="phoneNumber"
              placeholder="Phone Number"
              onChange={handleChange}
              required
            />
            <input
              name="email"
              placeholder="Email"
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />
            <button type="submit">Create Account</button>
          </form>

          <div className="terms">
            By signing up, you agree to our{" "}
            <a href="/terms">Terms of Use</a> and{" "}
            <a href="/privacy">Privacy Policy</a>.
          </div>

          <div className="existing-account">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
