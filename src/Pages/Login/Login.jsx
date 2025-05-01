import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../redux/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./Login.scss";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/users/login", { email, password });
      dispatch(loginSuccess({ user: res.data.user, token: res.data.token }));
      navigate("/home");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed.");
    }
  };

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  return (
    <div className="login-wrapper">
      <div className="login-image-side"></div>
      <div className="login-form-side">
        <div className="login-container">
          <h2>Sign into your account</h2>
          <p>
            Or,{" "}
            <span className="new-account">
              <Link to="/signup">create an account</Link>
            </span>
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={handleEmailChange}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              required
            />

            <button type="submit">Sign In</button>

            <p className="forgot-password">Forgot your password?</p>

            <p className="terms">
              By signing in, I accept the{" "}
              <a href="/terms-of-use" target="_blank">
                Terms of Use
              </a>
              .
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
