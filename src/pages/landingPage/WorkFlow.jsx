import { motion } from "framer-motion";
import "./WorkFlow.css";

function Workflow() {
  const steps = [
    {
      num: "1",
      title: "Sign In",
      description: "Connect your institutional email and domain for verification."
    },
    {
      num: "2",
      title: "Verify",
      description: "Our systems automatically map your current LMS and data structure."
    },
    {
      num: "3",
      title: "Initialize",
      description: "The AI neural layer begins processing and indexing your materials."
    },
    {
      num: "4",
      title: "Go Live",
      description: "Deploy the portal to students and staff with pre-set permissions."
    }
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.15 }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section className="bx-workflow-section">
      <div className="bx-workflow-container">
        
        {/* UPPER SMALL CHIP HEADING */}
        <motion.span 
          className="bx-workflow-sub-label"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          Up and running in minutes
        </motion.span>

        {/* PRIMARY SUB-HEADLINE DESCRIPTION */}
        <motion.p 
          className="bx-workflow-main-desc"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Deploying AI intelligence across your entire institution shouldn't be a multi-month project. We've simplified it into four steps.
        </motion.p>

        {/* STEPPER GRID FLOW HOUSING */}
        <motion.div 
          className="bx-workflow-timeline-track"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* THE PROGRESSION GUIDELINE RUNNING BEHIND TIMELINE NODES (DESKTOP ONLY) */}
          <div className="bx-workflow-horizontal-bar" />

          {steps.map((step, idx) => (
            <motion.div 
              key={idx} 
              className="bx-workflow-step-node"
              variants={stepVariants}
            >
              {/* THE NUMBER INDICATOR SPHERE BLOCK */}
              <div className="bx-workflow-circle-badge">
                <span>{step.num}</span>
              </div>

              {/* STEP METADATA CONTENT DESCRIPTIONS */}
              <h3 className="bx-workflow-step-title">{step.title}</h3>
              <p className="bx-workflow-step-desc">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}

export default Workflow;
