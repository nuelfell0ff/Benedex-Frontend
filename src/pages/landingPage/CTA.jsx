import { motion } from "framer-motion";
import  { Link } from "react-router-dom";
import "./CTA.css";

function CTA() {
  return (
    <section className="bx-cta-outer-wrapper">
      {/* TRICKY GRID SYSTEM COMPONENT (Faint grid overlay matching the hero) */}
      <div className="bx-cta-grid-bg">
        <div className="bx-cta-grid-lines" />
      </div>

      <div className="bx-cta-content-container">
        {/* DEAD-CENTERED FLOATING DEEP BLUE BLOCK CARD */}
        <motion.div 
          className="bx-cta-card-shell"
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* CARD BACKGROUND GLOW SHADOW */}
          <div className="bx-cta-radial-glow" />

          <div className="bx-cta-card-inner">
            {/* SUBTITLE */}
            <motion.span 
              className="bx-cta-subtitle"
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: -0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              Ready to bring AI to your study?
            </motion.span>

            {/* MAIN PARAGRAPH DESCRIPTIVE CODES */}
            <motion.h2 
              className="bx-cta-main-text"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Join 400+ institutions currently leveraging Benedex Portal to optimize learning outcomes and streamline administration.
            </motion.h2>

            {/* CALL TO ACTION ACCENT INTERACTION BUTTONS */}
            <motion.div 
              className="bx-cta-button-cluster"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {/* BRAND SOLID GREEN CTA BUTTON */}
              <Link 
                to="/login"
                className="bx-btn-primary-green"
                whileHover={{ scale: 1.03, backgroundColor: "#176c40" }}
                whileTap={{ scale: 0.98 }}
              >
                Start Your Free Trial
              </Link >

              {/* GHOST OUTLINE CO-BUTTON */}
              <motion.button 
                className="bx-btn-secondary-outline"
                whileHover={{ scale: 1.03, backgroundColor: "rgba(255, 255, 255, 0.06)" }}
                whileTap={{ scale: 0.98 }}
              >
                Schedule a Consultation
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default CTA;