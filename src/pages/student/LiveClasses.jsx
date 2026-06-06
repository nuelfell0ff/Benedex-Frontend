import "./LiveClasses.css";
import { useEffect, useState } from "react";
import API from "../../services/api";

import {
  FiVideo,
  FiCalendar,
  FiUsers,
  FiPlayCircle,
  FiClock,
  FiActivity,
  FiAlertCircle
} from "react-icons/fi";

import { BsBroadcast } from "react-icons/bs";

function LiveClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await API.get("/live-classes/student");
        setClasses(res.data || []);
      } catch (error) {
        console.error("Error fetching live classes structural matrix:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const handleJoinClass = async (liveClass) => {
    try {
      const res = await API.post(`/live-classes/join/${liveClass._id}`);
      const meetingLink = res.data?.meetingLink || liveClass.meetingLink;

      if (meetingLink) {
        window.open(meetingLink, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error("Live streaming room connection engine failure:", error);
    }
  };

  const upcomingClasses = classes.filter(
    (item) => new Date(item.startTime) > new Date()
  );

  if (loading) {
    return (
      <div className="scd-loader-container">
        <div className="scd-spinner" />
        <p>Initializing Live Streaming Modules...</p>
      </div>
    );
  }

  return (
    <div className="benedex-lms-theme live-page-layout-root">
      <div className="benedex-container">
        
        {/* HERO BRAND HEADER */}
        <div className="live-hero-banner">
          <div className="hero-content-block">
            <span className="hero-badge">
              <BsBroadcast /> Live Learning Network
            </span>
            <h1>Live Interactive Classes</h1>
            <p>
              Join real-time streaming rooms, active workshops, and peer technical mentorship pipelines orchestrated directly by academic leads.
            </p>
          </div>
          <div className="hero-floating-analytics-box">
            <strong>{classes.length}</strong>
            <span>Active Streams Allocated</span>
          </div>
        </div>

        {/* METRICS ROW SYSTEM */}
        <div className="metrics-summary-grid">
          <div className="metric-panel-card">
            <div className="metric-icon-box primary-variant">
              <FiVideo />
            </div>
            <div className="metric-info-data">
              <h3>{classes.length}</h3>
              <span>Total Classes Available</span>
            </div>
          </div>

          <div className="metric-panel-card">
            <div className="metric-icon-box success-variant">
              <FiCalendar />
            </div>
            <div className="metric-info-data">
              <h3>{upcomingClasses.length}</h3>
              <span>Scheduled Live Sessions</span>
            </div>
          </div>

          <div className="metric-panel-card">
            <div className="metric-icon-box warning-variant">
              <FiActivity />
            </div>
            <div className="metric-info-data">
              <h3>Active</h3>
              <span>Learning Tracking Node</span>
            </div>
          </div>
        </div>

        {/* CLASSES DYNAMIC SECTIONS GRID */}
        <h2 className="workspace-section-heading">Available Broadcasters</h2>
        
        {classes.length > 0 ? (
          <div className="live-classes-responsive-grid">
            {classes.map((liveClass) => (
              <div className="workspace-class-card" key={liveClass._id}>
                
                <div className="class-card-header-row">
                  <div className="stream-status-indicator pulse-active">
                    <BsBroadcast />
                    <span>Live Transmission</span>
                  </div>
                </div>

                <h3 className="class-card-title">{liveClass.title}</h3>

                <div className="class-metadata-sheet">
                  <div className="metadata-item-row">
                    <FiUsers />
                    <span>{liveClass.instructor?.fullName || "Unassigned Faculty"}</span>
                  </div>

                  <div className="metadata-item-row">
                    <FiCalendar />
                    <span>{new Date(liveClass.startTime).toLocaleDateString()}</span>
                  </div>

                  <div className="metadata-item-row">
                    <FiClock />
                    <span>{new Date(liveClass.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <button
                  className="btn-primary-action-buy width-full-override"
                  onClick={() => handleJoinClass(liveClass)}
                >
                  <FiPlayCircle /> Initialize Live Stream Bridge
                </button>

              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state-workspace-card">
            <FiAlertCircle size={44} />
            <h4>No Stream Feeds Broadcasting</h4>
            <p>Your current active track schedules do not have pending streaming links active inside the coordinator frame.</p>
          </div>
        )}
      </div>

      {/* FOOTER CANVAS */}
      <footer className="benedex-footer-wrapper" style={{ marginTop: "6rem" }}>
        <div className="footer-top-row">
          <div className="footer-brand-column">
            <h3>Benedex Digital</h3>
            <p>© 2026 Benedex Digital Hub. Built for African Excellence.</p>
          </div>
          <div className="footer-links-column">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span className="badge bg-secondary-subtle text-dark">Currency: NGN</span>
            <span>Contact Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LiveClasses;