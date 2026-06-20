import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail, FiUser } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "student",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = useMemo(
    () => [
      {
        tag: "Start Learning",
        title: "Create your account and begin with guided courses, projects, and feedback.",
      },
      {
        tag: "Choose Your Path",
        title: "Register as a student and step into the right workspace.",
      },
      {
        tag: "Launch Faster",
        title: "Join the platform built to help teams move from signup to progress quickly.",
      },
    ],
    []
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % messages.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [messages.length]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Submit registration data through AuthContext
      await register(formData);
      
      // Strictly navigate to the login screen upon successful registration
      navigate("/login");
    } catch (registerError) {
      setError("We could not create your account right now. Please check your details and try again.");
      console.error("Registration pipeline submission failure info:", registerError);
    } finally {
      setLoading(false);
    }
  };

  const activeMessage = messages[messageIndex];

  return (
    <main className="login-shell">
      <section className="login-visual-panel">
        <Link to="/" className="bx-nav-brand-group">
          <div className="bx-nav-logo-box bg-white">
          </div>
          <span className="bx-nav-brand-text student-sidebar-brand-copy text-white">Benedex</span>
        </Link>

        <div className="login-visual-content">
          <span className="login-kicker">Join the Hub</span>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeMessage.tag}
              className="login-message-card"
              initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            >
              <span className="login-message-tag">{activeMessage.tag}</span>
              <p className="login-message-title">{activeMessage.title}</p>

              <div className="login-signal-row">
                <span className="login-signal-ring" />
                <span>
                  {messageIndex + 1} of {messages.length}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="login-stats">
            <div>
              <strong>1 path</strong>
              <span className="mt-1">Student onboarding</span>
            </div>
            <div>
              <strong>Fast</strong>
              <span>Onboarding</span>
            </div>
          </div>

          <div className="login-testimonial">
            <div className="login-avatar">
              <span>BH</span>
            </div>
            <div>
              <p>“Signup was simple, and I was inside the platform in minutes.”</p>
              <strong>Benedict A.</strong>
              <span>Digital Learning Cohort</span>
            </div>
          </div>
        </div>

        <p className="login-footnote">© 2026 Benedex Digital Hub. Built for African excellence.</p>
      </section>

      <section className="login-form-panel">
        <motion.div
          className="login-form-card"
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="login-form-header">
            <span className="login-form-eyebrow">Create Account</span>
            <h1>Set up your Benedex workspace.</h1>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <label className="login-field">
              <span>Full Name</span>
              <div className="login-input-shell">
                <FiUser />
                <input
                  type="text"
                  name="fullName"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>
            </label>

            <label className="login-field">
              <span>Email Address</span>
              <div className="login-input-shell">
                <FiMail />
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label className="login-field">
              <div className="login-field-heading">
                <span>Password</span>
                <button
                  type="button"
                  className="login-link-button"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="login-input-shell">
                <FiLock />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="login-icon-button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </label>

            <div className="login-meta-row">
              <span className="login-remember">
                <span>Student account</span>
              </span>
            </div>

            {error ? <p className="login-error">{error}</p> : null}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? (
                <span className="login-spinner-row">
                  <span className="login-spinner" />
                  Creating account...
                </span>
              ) : (
                <>
                  Create Account <FiArrowRight />
                </>
              )}
            </button>
          </form>

          <div className="login-divider" />

          <p className="login-switch">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>

          <div className="login-trust">
            <span>Trusted by teams at</span>
            <div>
              <strong>PayStack</strong>
              <strong>Flutterwave</strong>
              <strong>Andela</strong>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

export default Register;