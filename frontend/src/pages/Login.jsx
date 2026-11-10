import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // ProtectedRoute stores the requested page as `from`; preserve it after login.
  const redirectTo = location.state?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    // Disable the submit button while the login request is in flight.
    setBusy(true);

    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="login-page">
      <div className="login-card">
        <Link to="/" className="login-brand">
          <span>
            Link <span>ly</span>
          </span>
        </Link>

        {/* Heading */}
        <div className="login-heading">
          <span className="login-eyebrow">WELCOME BACK</span>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Email Address
            <input
              type="email"
              placeholder="Enter you email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <div className="login-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "show"}
              </button>
            </div>
          </label>

          {error && (
            <div className="login-error">
              <span>⚠</span>
              <p>{error}</p>
            </div>
          )}

          <button type="submit" className="login-submit-btn" disabled={busy}>
            {busy ? "Signing you in ..." : "Sign In"}
            {!busy && <span>→</span>}
          </button>
        </form>

        {/* Signup Link */}
        <div className="login-signup">
          <span>Don't have an account?</span>
          <Link to="/signup" state={{ from: redirectTo }}>
            Create Account
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Login;
