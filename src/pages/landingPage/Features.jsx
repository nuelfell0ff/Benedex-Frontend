import { motion } from "framer-motion";
import { FiCpu, FiTrendingUp, FiTerminal, FiArrowRight } from "react-icons/fi";
import "./Features.css";

function Features() {
  const featureItems = [
    {
      id: 1,
      icon: <FiCpu size={20} />,
      iconClass: "icon-blue",
      title: "Smarter Academic Assistant",
      description: "An AI companion that understands context across all courses, helping students synthesize complex topics effortlessly.",
      linkText: "Learn more",
      linkUrl: "/assistant"
    },
    {
      id: 2,
      icon: <FiTrendingUp size={20} />,
      iconClass: "icon-green",
      title: "Predictive Analytics Engine",
      description: "Identify performance gaps before they happen. Our engine provides real-time insights into student progression and engagement.",
      linkText: "Explore analytics",
      linkUrl: "/analytics"
    },
    {
      id: 3,
      icon: <FiTerminal size={20} />,
      iconClass: "icon-dark",
      title: "Universal AI Subsystems",
      description: "Connect your existing tools to our neural layer. Seamless integration with over 40+ educational platforms and APIs.",
      linkText: "View subsystems",
      linkUrl: "/ai-subsystems"
    }
  ];

  // Animation variants for structural staggered entry
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section className="bx-features-section">
      <div className="bx-features-container">
        
        {/* UPPER BADGE LABEL */}
        <motion.div 
          className="bx-features-badge"
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          AI Features
        </motion.div>

        {/* SECTION HEADER */}
        <motion.h2 
          className="bx-features-main-heading"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Three tools that change how students learn
        </motion.h2>

        {/* RESPONSIVE 3-COLUMN FEATURE MATRIX GRID */}
        <motion.div 
          className="bx-features-grid-shell"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {featureItems.map((item) => (
            <motion.div 
              key={item.id}
              className="bx-feature-card"
              variants={cardVariants}
              whileHover={{ y: -6, boxShadow: "0 16px 32px rgba(25, 64, 102, 0.05)" }}
            >
              <div className="bx-feature-card-inner">
                {/* ICON EMBED MATRIX CONTAINER */}
                <div className={`bx-feature-icon-box ${item.iconClass}`}>
                  {item.icon}
                </div>

                {/* TEXT LAYOUT TELEMETRY */}
                <h3 className="bx-feature-card-title">{item.title}</h3>
                <p className="bx-feature-card-desc">{item.description}</p>
                
                {/* INTERACTIVE LINK ELEMENT */}
                <a href={item.linkUrl} className="bx-feature-card-link">
                  <span>{item.linkText}</span>
                  <FiArrowRight className="bx-link-arrow-icon" />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}

export default Features;