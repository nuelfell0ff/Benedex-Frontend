import { useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import { motion } from "framer-motion";

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
} from "react-icons/fi";

import API from "../../services/api";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboard = async () => {
      try {
        const res = await API.get("/dashboard/student");

        if (isMounted) {
          setDashboard(res.data);
        }

        await API.put("/student/dashboard/activities/viewed");
        window.dispatchEvent(new Event("student-activities-updated"));
      } catch (error) {
        console.log(error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

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
      <div className="student-loading-shell">
        <div className="student-loading-card">
          <span className="student-spinner" />
          <strong>Loading activity log...</strong>
          <span>Fetching your latest actions.</span>
        </div>
      </div>
    );
  }

  return (
    <motion.main
      className="student-dashboard student-notifications-page"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <section className="student-hero student-notifications-hero">
        <div>
          <p className="student-hero-kicker">Activity Feed</p>
          <h1>Your recent actions, in one place.</h1>
        </div>

        <Link className="student-notifications-back" to="/student">
          <FiArrowLeft /> Back to dashboard
        </Link>
      </section>

      <section className="student-section student-notifications-panel">
        <div className="student-section-head">
          <h3>Latest Activity</h3>
          <span className="student-notification-count">
            {recentActivities.length} item{recentActivities.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="student-activity-list student-notifications-list">
          {recentActivities.length > 0 ? (
            recentActivities.map((item, index) => (
              <motion.article
                key={item._id || `${item.type}-${item.createdAt}-${index}`}
                className="student-activity-item student-notification-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: index * 0.03 }}
              >
                <span className="student-activity-icon" aria-hidden="true">
                  {activityIconMap[item.type] || <FiClock />}
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.type.replaceAll("_", " ")}</p>
                  <span>{formatTimeAgo(item.createdAt)}</span>
                </div>
              </motion.article>
            ))
          ) : (
            <div className="student-empty-activity student-notification-empty">
              <strong>New actions will show here</strong>
              <p>Registering, enrolling, submitting, and joining live classes will appear here.</p>
            </div>
          )}
        </div>
      </section>
    </motion.main>
  );
}

export default Notifications;
