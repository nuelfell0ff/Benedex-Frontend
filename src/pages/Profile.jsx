import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuUser,
  LuLock,
  LuBriefcase,
  LuMail,
  LuBookOpen,
  LuAward,
  LuUsers,
  LuGraduationCap,
  LuTrendingUp,
  LuDollarSign
} from "react-icons/lu";
import "./Profile.css";

function Profile() {
  const [activeTab, setActiveTab] = useState("account"); // account, security, dashboard
  const [user, setUser] = useState(null);

  // Profile Input fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // Password Reset fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI Status State Handlers
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setFullName(parsed.fullName || "");
      setEmail(parsed.email || "");
    }
  }, []);

  const triggerAlert = (text, errorFlag = false) => {
    setMessage(text);
    setIsError(errorFlag);
    setTimeout(() => setMessage(null), 4000);
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "https://benedex-backend.onrender.com/api/users/profile/update",
        { fullName, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        triggerAlert("Account metadata successfully synchronized.", false);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setUser(response.data.user);
      }
    } catch (err) {
      triggerAlert(err.response?.data?.message || "Failed to save profile structural variables.", true);
    } finally {
      setLoading(false);
    }
  };

  // 🔒 WORKING PASSWORD UPDATE HANDLER CONNECTED TO BACKEND
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return triggerAlert("Structural confirmation mismatch. New passwords do not match.", true);
    }

    if (newPassword.length < 6) {
      return triggerAlert("Security policy: New password must be at least 6 characters long.", true);
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "https://benedex-backend.onrender.com/api/users/profile/password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      triggerAlert(response.data?.message || "Access gateway credentials securely updated!", false);

      // Flush password field vectors completely on success
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      triggerAlert(err.response?.data?.message || "Failed to cycle gateway credentials. Verify old password.", true);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="profile-page-container">
        <div className="profile-content-card" style={{ textAlignment: "center" }}>
          <p>Syncing runtime platform profile nodes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      {/* 1. White Background Identity Hero Header Card */}
      <div className="profile-hero-card">
        <div className="profile-avatar-wrapper">
          {user.profileImage ? (
            <img src={user.profileImage} alt="User Avatar" className="profile-avatar-img" />
          ) : (
            <LuUser className="profile-avatar-fallback" />
          )}
        </div>
        <div className="profile-meta-info">
          <h2>{user.fullName}</h2>
          <span className="profile-role-badge">{user.role}</span>
        </div>
      </div>

      {/* 2. Horizontal Navigation Tabs Line */}
      <div className="profile-tabs-nav">
        <button
          className={`profile-tab-btn ${activeTab === "account" ? "active" : ""}`}
          onClick={() => setActiveTab("account")}
        >
          <LuUser /> Account Detail
          {activeTab === "account" && <motion.div layoutId="activeTabUnderline" className="active-tab-indicator" />}
        </button>
        <button
          className={`profile-tab-btn ${activeTab === "security" ? "active" : ""}`}
          onClick={() => setActiveTab("security")}
        >
          <LuLock /> Reset Password
          {activeTab === "security" && <motion.div layoutId="activeTabUnderline" className="active-tab-indicator" />}
        </button>
        <button
          className={`profile-tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          <LuBriefcase /> Performance Scope
          {activeTab === "dashboard" && <motion.div layoutId="activeTabUnderline" className="active-tab-indicator" />}
        </button>
      </div>

      {/* 3. Global Notification Pop-in Feedback Drawer */}
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`profile-alert-banner ${isError ? "error" : "success"}`}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Main White Operational Dashboard Work Card */}
      <div className="profile-content-card">
        {activeTab === "account" && (
          <form onSubmit={handleUpdateAccount}>
            <h3 className="profile-section-title"><LuUser /> Public Profile Configuration</h3>
            <div className="profile-form-grid">
              <div className="form-field-group">
                <label>Full Account Name</label>
                <div className="input-with-icon-wrapper">
                  <LuUser />
                  <input
                    type="text"
                    className="profile-input-field"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-field-group">
                <label>Ecosystem Verified Email</label>
                <div className="input-with-icon-wrapper">
                  <LuMail />
                  <input
                    type="email"
                    className="profile-input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="profile-submit-btn" disabled={loading}>
                {loading ? "Processing Sync..." : "Commit Profile Changes"}
              </button>
            </div>
          </form>
        )}

        {activeTab === "security" && (
          <form onSubmit={handleChangePassword}>
            <h3 className="profile-section-title"><LuLock /> Access Credential Modification</h3>
            <div className="profile-form-grid">
              <div className="form-field-group">
                <label>Current Security Password</label>
                <div className="input-with-icon-wrapper">
                  <LuLock />
                  <input
                    type="password"
                    className="profile-input-field"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div style={{ gridColumn: "1 / -1", height: "1px", background: "rgba(7, 51, 92, 0.06)", margin: "8px 0" }} />
              <div className="form-field-group">
                <label>Target New Password</label>
                <div className="input-with-icon-wrapper">
                  <LuLock />
                  <input
                    type="password"
                    className="profile-input-field"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-field-group">
                <label>Confirm Target Password</label>
                <div className="input-with-icon-wrapper">
                  <LuLock />
                  <input
                    type="password"
                    className="profile-input-field"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="profile-submit-btn" disabled={loading}>
                {loading ? "Recycling Access Nodes..." : "Confirm Password Update"}
              </button>
            </div>
          </form>
        )}

        {activeTab === "dashboard" && (
          <div>
            <h3 className="profile-section-title"><LuBriefcase /> Role Performance Metrics</h3>

            {user.role === "student" && (
              <div className="role-metrics-dashboard-grid">
                <div className="metric-micro-card">
                  <div className="metric-icon-box"><LuBookOpen /></div>
                  <div className="metric-data-node">
                    <h4>Active</h4>
                    <p>Enrolled Courses</p>
                  </div>
                </div>
                <div className="metric-micro-card">
                  <div className="metric-icon-box"><LuAward /></div>
                  <div className="metric-data-node">
                    <h4>{user.xp || 0} XP</h4>
                    <p>Accumulated Level</p>
                  </div>
                </div>
              </div>
            )}

            {user.role === "instructor" && (
              <div className="role-metrics-dashboard-grid">
                <div className="metric-micro-card">
                  <div className="metric-icon-box"><LuGraduationCap /></div>
                  <div className="metric-data-node">
                    <h4>Curriculum</h4>
                    <p>Published Courses</p>
                  </div>
                </div>
                <div className="metric-micro-card">
                  <div className="metric-icon-box"><LuUsers /></div>
                  <div className="metric-data-node">
                    <h4>Rostered</h4>
                    <p>Total Class Base</p>
                  </div>
                </div>
              </div>
            )}

            {user.role === "admin" && (
              <div className="role-metrics-dashboard-grid">
                <div className="metric-micro-card">
                  <div className="metric-icon-box"><LuTrendingUp /></div>
                  <div className="metric-data-node">
                    <h4>Core Scope</h4>
                    <p>Ecosystem Controls Active</p>
                  </div>
                </div>
                <div className="metric-micro-card">
                  <div className="metric-icon-box"><LuDollarSign /></div>
                  <div className="metric-data-node">
                    <h4>Global Override</h4>
                    <p>System Variables Unlocked</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;