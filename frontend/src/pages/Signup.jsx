import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./Signup.css";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      await signup(form);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="signup-page">
      <div className="signup-card">
        {/* Brand */}
        <Link to="/" className="signup-brand">
          <span>
            Link<span>ly</span>
          </span>
        </Link>

        {/* Heading */}
        <div className="signup-heading">
          <h1>Create Your Account</h1>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="signup-form">
          <label>
            Email Address
            <input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={set("email")}
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <div className="signup-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={set("password")}
                autoComplete="new-password"
                required
                minLength={8}
              />

              <button
                type="button"
                className="signup-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {error && (
            <div className="signup-error">
              <span>⚠</span>
              <p>{error}</p>
            </div>
          )}

          <button type="submit" className="signup-submit-btn" disabled={busy}>
            {busy ? "Creating your account..." : "Create Account"}
            {!busy && <span>→</span>}
          </button>
        </form>

        {/* Login Link */}
        <div className="signup-login">
          <span>Already have an account?</span>
          <Link to="/login" state={{ from: redirectTo }}>
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}
