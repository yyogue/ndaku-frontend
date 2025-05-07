import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "../../redux/actions/authActions";
import { Link, useNavigate } from "react-router-dom";
import "./Login.scss";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Detect if user is on mobile
  useEffect(() => {
    setIsMobile(/Mobi|Android/i.test(navigator.userAgent));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Call the loginUser action
      const result = await dispatch(loginUser({ email, password }));

      // Only navigate if we get back successful data
      if (result && result.token) {
        navigate("/dashboard");
      }
    } catch (err) {
      console.log("Login error caught:", err);

      // Format user-friendly error messages
      let errorMessage = "Login failed. Please try again.";

      if (err.message && err.message.includes("timeout")) {
        errorMessage =
          "Request timed out. Please check your internet connection.";
      } else if (err.response && err.response.status === 401) {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (
        err.response &&
        err.response.data &&
        err.response.data.message
      ) {
        // Use server error message if available
        errorMessage = err.response.data.message;
      } else if (!err.response && err.request) {
        // The request was made but no response was received
        errorMessage =
          "Unable to connect to the server. Please check your internet connection.";
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-image-side"></div>
      <div className="login-form-side">
        <div className={`login-container ${isMobile ? "mobile" : ""}`}>
          <h2>Connexion</h2>
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                inputMode="email"
                placeholder="Entrez votre e-mail"
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Entrez votre mot de passe"
              />
            </div>

            <div className="forgot-password">
              <Link to="/forgot-password">Mot de passe oublié ?</Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={isSubmitting ? "submitting" : ""}
            >
              {isSubmitting ? "Connexion en cours..." : "Connexion"}
            </button>

            <div className="terms">
              En vous connectant, vous acceptez nos{" "}
              <a href="/terms">Conditions d'utilisation</a> et{" "}
              <a href="/privacy">Politique de confidentialité</a>
            </div>
          </form>
          <div className="new-account">
            <Link to="/signup">Créer un nouveau compte</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
