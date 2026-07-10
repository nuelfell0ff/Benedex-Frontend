import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import {
  FiUser, FiMail, FiShield, FiKey, FiCamera,
  FiCheckCircle, FiAlertCircle, FiLogOut
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import "./Profile.css";

function Profile() {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("general"); // Options: general, security
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((current) => ({ ...current, [name]: value }));
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: "", message: "" });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setFeedback({ type: "error", message: "New passwords do not match." });
      setLoading(false);
      return;
    }

    try {
      // Points directly to your secure profile update routing engine
      await API.put("/auth/update-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setFeedback({ type: "success", message: "Password updated successfully!" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to update password. Verify current credentials."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerResetToken = async () => {
    setLoading(true);
    setFeedback({ type: "", message: "" });
    try {
      await API.post("/auth/forgot-password", { email: user?.email });
      setFeedback({
        type: "success",
        message: "A password verification link has been initialized and dispatched to your email."
      });
    } catch (err) {
      setFeedback({ type: "error", message: "Could not trigger verification vector." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-dashboard-layout">
      {/* Premium Header Banner Node */}
      <header className="profile-hero-card">
        <div className="profile-hero-overlay" />
        <div className="profile-avatar-wrapper">
          {user?.profileImage ? (
            <img src={user.profileImage} alt={user.fullName} className="profile-main-avatar" />
          ) : (
            <div className="profile-avatar-fallback">
              {user?.fullName?.charAt(0).toUpperCase() || "B"}
            </div>
          )}
          <button className="avatar-edit-badge" title="Change Avatar Image">
            <FiCamera />
          </button>
        </div>

        <div className="profile-identity-block">
          <h2>{user?.fullName || "Benedex Member"}</h2>
          <span className="profile-role-badge">{user?.role || "Student"}</span>
        </div>
      </header>

      {/* Main Control Panel Structure */}
      <main className="profile-content-frame">
        <aside className="profile-navigation-sidebar">
          <button
            className={`profile-nav-tab ${activeTab === "general" ? "active" : ""}`}
            onClick={() => setActiveTab("general")}
          >
            <FiUser /> General Info
          </button>
          <button
            className={`profile-nav-tab ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <FiShield /> Security & Password
          </button>
          <hr className="profile-sidebar-divider" />
          <button className="profile-nav-tab logout-vector-btn" onClick={logout}>
            <FiLogOut /> Sign Out Account
          </button>
        </aside>

        <section className="profile-display-card">
          {/* Notification Feedback Loops */}
          <AnimatePresence>
            {feedback.message && (
              <motion.div
                className={`profile-banner-alert ${feedback.type}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {feedback.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
                <span>{feedback.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {activeTab === "general" ? (
            <div className="profile-tab-view">
              <h3>Account Details</h3>
              <p className="tab-subtitle">Manage your general public profile credentials.</p>

              <div className="profile-details-grid">
                <div className="detail-field-box">
                  <label><FiUser /> Full Name</label>
                  <input type="text" value={user?.fullName || ""} readOnly disabled />
                </div>
                <div className="detail-field-box">
                  <label><FiMail /> Email Address</label>
                  <input type="email" value={user?.email || ""} readOnly disabled />
                </div>
              </div>

              {user?.googleId && (
                <div className="social-sync-notice">
                  <span className="sync-icon">⚡</span>
                  <div>
                    <strong>Connected to Google Account Services</strong>
                    <p>Your authentication credentials are secured and managed via Google single sign-on.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="profile-tab-view">
              <h3>Security Gateway</h3>
              <p className="tab-subtitle">Keep your workspace account authentication variables updated.</p>

              {user?.googleId && !user?.password ? (
                <div className="google-user-security-block">
                  <p>You currently log in via Google Auth. If you want to setup a local password profile interface, initialize a recovery sequence below.</p>
                  <button
                    type="button"
                    className="trigger-reset-vector-btn"
                    onClick={handleTriggerResetToken}
                    disabled={loading}
                  >
                    <FiKey /> Set Up Local Account Password
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdatePassword} className="security-credentials-form">
                  <div className="detail-field-box">
                    <label>Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      placeholder="••••••••"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="detail-field-box">
                    <label>New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="Enter new secure password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="detail-field-box">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm new secure password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>

                  <div className="security-actions-row">
                    <button type="submit" className="save-credentials-btn" disabled={loading}>
                      {loading ? "Processing..." : "Update System Password"}
                    </button>
                    <button
                      type="button"
                      className="forgot-trigger-link"
                      onClick={handleTriggerResetToken}
                    >
                      Forgot current password?
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Profile;