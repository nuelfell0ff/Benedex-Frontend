import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { 
  FiBell, 
  FiSend, 
  FiLayers, 
  FiMessageSquare, 
  FiTv, 
  FiBookOpen, 
  FiCpu, 
  FiClock, 
  FiArchive 
} from "react-icons/fi";
import "./InstructorNotifications.css";

function InstructorNotifications() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "announcement"
  });

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await API.get("/notifications");
        setNotifications(res.data || []);
      } catch (error) {
        console.error("Failed to extract active platform notification maps:", error);
      }
    };
    fetchNotifications();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?._id) {
      alert("Session context missing. Please sign in again.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await API.post("/notifications", {
        user: user._id,
        title: formData.title.trim(),
        message: formData.message.trim(),
        type: formData.type
      });

      setNotifications([res.data, ...notifications]);
      setFormData({ title: "", message: "", type: "announcement" });
    } catch (error) {
      console.error("Failed to transmit notification payload downstream:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper mapping to attach the exact icon based on classification types
  const getTypeMeta = (type) => {
    switch (type) {
      case "live-class":
        return { icon: <FiTv />, label: "Live Class", class: "type-live" };
      case "assignment":
        return { icon: <FiBookOpen />, label: "Assignment", class: "type-task" };
      case "system":
        return { icon: <FiCpu />, label: "System Matrix", class: "type-sys" };
      default:
        return { icon: <FiLayers />, label: "Announcement", class: "type-announcement" };
    }
  };

  if (authLoading) {
    return (
      <div className="bx-notify-loader-frame">
        <div className="bx-notify-spinner" />
        <p>Syncing Security Identity Context...</p>
      </div>
    );
  }

  return (
    <div className="bx-notify-container">
      {/* HEADER SECTION PANEL */}
      <header className="bx-notify-header">
        <div className="bx-notify-title-zone">
          <h1>Instructor Notifications</h1>
          <p>Broadcast alerts, deploy assignments, dispatch system notices, and broadcast live class schedules to the student roster paths.</p>
        </div>
      </header>

      {/* CORE TWO-COLUMN WORKSPACE SPLIT */}
      <div className="bx-notify-layout-split">
        
        {/* LEFT COLUMN: DISPATCH CONTROLLER FORM */}
        <div className="bx-notify-form-panel">
          <h2>Create Broadcast Broadcast</h2>
          <form onSubmit={handleSubmit} className="bx-premium-form">
            <div className="bx-form-cell">
              <label>Notification Headline</label>
              <input
                type="text"
                name="title"
                placeholder="e.g., Emergency Class Postponement"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="bx-form-cell">
              <label>Classification Category</label>
              <div className="bx-select-dropdown-wrapper">
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="announcement">Announcement</option>
                  <option value="system">System</option>
                  <option value="live-class">Live Class</option>
                  <option value="assignment">Assignment</option>
                </select>
              </div>
            </div>

            <div className="bx-form-cell">
              <label>Broadcast Message Body</label>
              <textarea
                name="message"
                placeholder="Construct the comprehensive notification briefing parameters here..."
                rows={5}
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>

            <motion.button 
              type="submit" 
              className="bx-notify-submit-btn"
              disabled={isSubmitting}
              whileHover={{ y: -1 }}
              whileTap={{ y: 1 }}
            >
              {isSubmitting ? (
                <span className="bx-notify-inline-loader" />
              ) : (
                <>Transmit Broadcast <FiSend /></>
              )}
            </motion.button>
          </form>
        </div>

        {/* RIGHT COLUMN: ACTIVE HISTORY BACKLOG FEED */}
        <div className="bx-notify-feed-panel">
          <div className="bx-feed-header-row">
            <h2>Transmission Log Balance</h2>
            <span className="bx-feed-counter-pill">{notifications.length} Despatched</span>
          </div>

          <div className="bx-feed-scroll-container">
            {notifications.length > 0 ? (
              <div className="bx-feed-list">
                <AnimatePresence>
                  {notifications.map((notification, index) => {
                    const meta = getTypeMeta(notification.type);
                    return (
                      <motion.article
                        key={notification._id || index}
                        className="bx-notify-feed-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35, delay: index * 0.03 }}
                      >
                        <div className="bx-feed-card-header">
                          <span className={`bx-feed-badge ${meta.class}`}>
                            {meta.icon} {meta.label}
                          </span>
                          <span className="bx-feed-timestamp">
                            <FiClock /> Live Transmission
                          </span>
                        </div>
                        <h3>{notification.title}</h3>
                        <p>{notification.message}</p>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              /* EMPTY STREAM SYSTEM FALLBACK */
              <motion.div 
                className="bx-notify-empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="bx-notify-empty-icon">
                  <FiArchive />
                </div>
                <h3>Transmission Log Empty</h3>
                <p>No active broadcast payloads have been pushed down from this instructor account portal layer yet.</p>
              </motion.div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default InstructorNotifications;