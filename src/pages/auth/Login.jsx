import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";
import Logo from "../../assets/20260623_190807.png";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = useMemo(
    () => [
      {
        tag: "Student Success",
        title: "Track courses, assignments, and live classes in one calm dashboard.",
      },
      {
        tag: "Instructor Growth",
        title: "Manage modules, grade submissions, and keep every cohort moving.",
      },
      {
        tag: "Admin Control",
        title: "Monitor users, payments, and analytics without switching tools.",
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
      // 1. Authenticate with backend and wait for profile payload data
      const loggedInUser = await login(formData);

      // 2. Safely extract role parsing fallback branches
      const targetRole = loggedInUser?.role || loggedInUser?.user?.role;

      // 3. Absolute Routing Matrix Execution
      if (targetRole === "student") {
        navigate("/student");
      } else if (targetRole === "instructor") {
        navigate("/instructor");
      } else if (targetRole === "admin") {
        navigate("/admin");
      } else {
        // Safe generic recovery path to root dashboard routing evaluation if parsing drops through
        console.warn("Authentication passed, but role property path could not be resolved:", loggedInUser);
        navigate("/");
      }

    } catch (loginError) {
      setError("We could not sign you in right now. Check your details and try again.");
      console.error("Login submission failure pipeline summary:", loginError);
    } finally {
      setLoading(false);
    }
  };

  const activeMessage = messages[messageIndex];

  return (
    <main className="login-shell">
      <section className="login-visual-panel">
        <Link to="/" className="bx-nav-brand-group">
          <img src={Logo} alt="" className="bx-nav-logo2 d-flex" />
          {/* <span className="bx-nav-brand-text student-sidebar-brand-copy">Benedex</span> */}
        </Link>

        <div className="login-visual-content">
          <span className="login-kicker">Digital Excellence</span>

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
              <strong>10k+</strong>
              <span>Graduates</span>
            </div>
            <div>
              <strong>250+</strong>
              <span>Hiring Partners</span>
            </div>
          </div>

          <div className="login-testimonial">
            <div className="login-avatar">
              <span>CO</span>
            </div>
            <div>
              <p>
                “Benedex changed my career path. I&apos;m now earning in USD from Lagos.”
              </p>
              <strong>Chinyere Okafor</strong>
              <span>Frontend Engineer @ GlobalTech</span>
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
            <span className="login-form-eyebrow">Welcome Back</span>
            <h1>Continue your journey to digital excellence.</h1>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
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
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
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
              <label className="login-remember">
                <input type="checkbox" />
                <span>Remember me for 30 days</span>
              </label>
              <button type="button" className="login-link-button">
                Forgot password?
              </button>
            </div>

            {error ? <p className="login-error">{error}</p> : null}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? (
                <span className="login-spinner-row">
                  <span className="login-spinner" />
                  Signing in...
                </span>
              ) : (
                <>
                  Sign In <FiArrowRight />
                </>
              )}
            </button>
          </form>

          <div className="login-divider" />

          <p className="login-switch">
            Don&apos;t have an account? <Link to="/register">Get Started</Link>
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

export default Login;