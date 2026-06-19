import { motion } from "framer-motion";
import { FiSliders, FiClock, FiCheckCircle } from "react-icons/fi";
import "./Maintenance.css";

function Maintenance() {
  return (
    <div className="bx-maint-viewport">
      {/* FORCE GOOGLE FONTS LINK DIRECTLY INTO THE DOM HEAD LAYER */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" 
        rel="stylesheet" 
      />
      
      <div className="bx-maint-container">
        
        {/* Animated Illustration Gear Pack */}
        <div className="bx-maint-illustration">
          <motion.div 
            className="bx-maint-gear-primary"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          >
            <FiSliders size={80} />
          </motion.div>
          <motion.div 
            className="bx-maint-gear-secondary"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          >
            <FiClock size={32} />
          </motion.div>
        </div>

        {/* Content Section Layout */}
        <motion.div
          className="bx-maint-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="bx-maint-badge">
            System Calibration Active
          </span>
          <h1 className="bx-maint-title">Upgrading Your Experience</h1>
          <p className="bx-maint-description">
            We are currently running scheduled core modifications on the platform engine to bring you faster speeds and upgraded user experience configurations. The hub will stabilize shortly.
          </p>
        </motion.div>

        {/* Status Metrics Cards Grid */}
        <div className="bx-maint-metrics-grid">
          <div className="bx-maint-status-card">
            <span className="bx-maint-card-label">Engine Status</span>
            <span className="bx-maint-card-value text-success">
              <FiCheckCircle size={14} /> Core Secure
            </span>
          </div>
          
          <div className="bx-maint-status-card">
            <span className="bx-maint-card-label">Estimated Window</span>
            <span className="bx-maint-card-value text-muted">
              &lt; 45 Minutes
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Maintenance;