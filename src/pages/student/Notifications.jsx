import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiLayers,
  FiLogIn,
  FiPlayCircle,
  FiRadio,
  FiStar,
  FiUsers,
  FiBell,
  FiTv,
  FiCpu,
  FiArchive
} from "react-icons/fi";
import API from "../../services/api";
import "./Notifications.css";

// Maps student personal activities (from dashboard log)
const activityIconMap = {
  account_registered: <FiUsers />,
  user_logged_in: <FiLogIn />,
  course_enrolled: <FiBookOpen />,
  assignment_submitted: <FiCheckCircle />,
  module_completed: <FiLayers />,
  lesson_started: <FiPlayCircle />,
  live_class_joined: <FiRadio />,
  xp_awarded: <FiStar />,
};

// Maps instructor global broadcast notifications (from backend Notification schema)
const instructorIconMap = {
  "live-class": <FiTv />,
  assignment: <FiBookOpen />,
  system: <FiCpu />,
  announcement: <FiBell />
};

const formatTimeAgo = (value) => {
  if (!value) return "Just now";
  const date = new Date(value);
  const diffSeconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));

  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

function Notifications() {
  const [dashboard, setDashboard] = useState(null);
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("broadcasts");

  useEffect(() => {
    let isMounted = true;

    const fetchNotificationData = async () => {
      try {
        // Fetch student dashboard log updates and instructor broadcast collections concurrently
        const [dashboardRes, broadcastsRes] = await Promise.all([
          API.get("/dashboard/student"),
          API.get("/notifications")
        ]);

        if (isMounted) {
          setDashboard(dashboardRes.data);
          
          // Fallback array check to handle instances where notifications are empty or filtered
          setBroadcasts(broadcastsRes.data || []);
        }

        // Keep indicators clear when checking page stream
        await API.put("/student/dashboard/activities/viewed");
        window.dispatchEvent(new Event("student-activities-updated"));
      } catch (error) {
        console.error("Error aggregating notification parameters:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchNotificationData();

    return () => {
      isMounted = false;
    };
  }, []);

  const recentActivities = useMemo(
    () => dashboard?.recentActivities || [],
    [dashboard]
  );

  if (loading) {
    return (
      <div className="st-maint-loader-frame">
        <div className="st-maint-spinner" />
        <p>Loading your communication feed...</p>
      </div>
    );
  }

  return (
    <motion.main
      className="st-notify-page"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* HEADER SECTION */}
      <header className="st-notify-header">
        <div className="st-notify-header-left">
          <h1>Communication Center</h1>
          <p className="st-notify-subtitle">Stay updated with your campus bulletins and tracking logs.</p>
        </div>
        <Link className="st-notify-back-btn" to="/student">
          <FiArrowLeft /> Back to Dashboard
        </Link>
      </header>

      {/* FILTER TABS */}
      <div className="st-notify-actions">
        <div className="st-notify-tabs">
          <button
            className={`st-notify-tab ${activeTab === "broadcasts" ? "is-active" : ""}`}
            onClick={() => setActiveTab("broadcasts")}
          >
            Instructor Bulletins
            <span className="st-notify-count-badge">{broadcasts.length}</span>
          </button>
          <button
            className={`st-notify-tab ${activeTab === "activities" ? "is-active" : ""}`}
            onClick={() => setActiveTab("activities")}
          >
            Your Activity Log
            <span className="st-notify-count-badge">{recentActivities.length}</span>
          </button>
        </div>
      </div>

      {/* RENDER FEED STREAM PANEL */}
      <section className="st-notify-feed">
        <AnimatePresence mode="wait">
          
          {/* VIEW ONE: INSTRUCTOR BROADCAST ALERTS FROM ADMIN PANEL */}
          {activeTab === "broadcasts" && (
            <motion.div
              key="broadcasts-feed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="st-notify-feed"
            >
              {broadcasts.length > 0 ? (
                broadcasts.map((item, index) => (
                  <motion.article
                    key={item._id || index}
                    className={`st-notify-card ${!item.isRead ? "is-unread" : ""}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                  >
                    <span className="st-notify-avatar" aria-hidden="true">
                      {instructorIconMap[item.type] || <FiBell />}
                    </span>
                    <div className="st-notify-details">
                      <p className="st-notify-message">
                        <strong>{item.title || "Untitled Bulletin"}</strong>
                      </p>
                      <p className="st-notify-body-text">
                        {item.message || "No contextual message detailed."}
                      </p>
                      <span className="st-notify-timestamp">
                        <FiClock /> {formatTimeAgo(item.createdAt)} • <span className="st-notify-tag-label">{item.type || "announcement"}</span>
                      </span>
                    </div>
                    <div className="st-notify-meta">
                      {!item.isRead && <span className="st-notify-status-dot" />}
                    </div>
                  </motion.article>
                ))
              ) : (
                <div className="st-notify-empty">
                  <div className="st-notify-empty-icon">
                    <FiArchive />
                  </div>
                  <h3>No bulletins found</h3>
                  <p>Instructors haven't deployed any announcement payloads out to the stream yet.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* VIEW TWO: PERSONAL STUDENT SYSTEM LOGS */}
          {activeTab === "activities" && (
            <motion.div
              key="activities-feed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="st-notify-feed"
            >
              {recentActivities.length > 0 ? (
                recentActivities.map((item, index) => (
                  <motion.article
                    key={item._id || `${item.type}-${item.createdAt}-${index}`}
                    className="st-notify-card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                  >
                    <span className="st-notify-avatar" aria-hidden="true">
                      {activityIconMap[item.type] || <FiClock />}
                    </span>
                    <div className="st-notify-details">
                      <p className="st-notify-message">
                        <strong>{item.title || "System Log Notification"}</strong>
                      </p>
                      <span className="st-notify-timestamp">
                        <FiClock /> {formatTimeAgo(item.createdAt)} • <span style={{ textTransform: "capitalize" }}>{item.type ? item.type.replaceAll("_", " ") : "Log Item"}</span>
                      </span>
                    </div>
                  </motion.article>
                ))
              ) : (
                <div className="st-notify-empty">
                  <div className="st-notify-empty-icon">
                    <FiClock />
                  </div>
                  <h3>Activity log empty</h3>
                  <p>Actions like registering, enrolling, and submitting assignments will compile updates here.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </motion.main>
  );
}

export default Notifications;