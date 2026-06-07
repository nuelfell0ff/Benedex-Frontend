import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import {
  FiFileText,
  FiUser,
  FiCheckCircle,
  FiAlertCircle,
  FiExternalLink,
  FiAward,
  FiMessageSquare,
  FiCornerDownRight,
  FiInbox
} from "react-icons/fi";
import "./GradeSubmissions.css";

function GradeSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await API.get("/assignments/submissions");
        setSubmissions(res.data || []);

        // Pre-populate state matrices if backend already contains evaluations
        const initialGrades = {};
        const initialFeedbacks = {};
        res.data.forEach((sub) => {
          if (sub.grade !== undefined) initialGrades[sub._id] = sub.grade;
          if (sub.feedback) initialFeedbacks[sub._id] = sub.feedback;
        });
        setGrades(initialGrades);
        setFeedbacks(initialFeedbacks);
      } catch (error) {
        console.error("Failed to extract active student submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const handleGradeChange = (submissionId, value) => {
    setGrades({
      ...grades,
      [submissionId]: value
    });
  };

  const handleFeedbackChange = (submissionId, value) => {
    setFeedbacks({
      ...feedbacks,
      [submissionId]: value
    });
  };

  const handleGradeSubmission = async (submissionId) => {
    try {
      setSubmittingId(submissionId);
      await API.put(`/assignments/grade/${submissionId}`, {
        grade: grades[submissionId],
        feedback: feedbacks[submissionId]
      });

      // Update local submission status dynamically to prevent rigid visual lag
      setSubmissions(prev =>
        prev.map(sub =>
          sub._id === submissionId ? { ...sub, status: "Graded" } : sub
        )
      );
    } catch (error) {
      console.error("Failed to post evaluation payload parameters downstream:", error);
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bx-instructor-loader-frame">
        <div className="bx-instructor-spinner" />
        <p>Syncing Academic Grading Backlog...</p>
      </div>
    );
  }

  return (
    <div className="bx-grading-container">
      {/* HEADER SECTION PANEL */}
      <header className="bx-grading-header">
        <div className="bx-header-text-block">
          <h1>Grade Submissions</h1>
          <p>Review incoming assignment documents, calculate evaluation scores, and transmit real-time performance feedback to students.</p>
        </div>
        <div className="bx-header-badge-metrics">
          <span className="bx-metric-pill">
            <FiFileText /> Total Submissions: {submissions.length}
          </span>
          <span className="bx-metric-pill pending">
            <FiAlertCircle /> Pending: {submissions.filter(s => s.status !== "Graded").length}
          </span>
        </div>
      </header>

      {/* CORE EVALUATION CONTAINER PLATFORM */}
      <div className="bx-grading-workspace">
        {submissions.length > 0 ? (
          <div className="bx-grading-grid">
            <AnimatePresence>
              {submissions.map((submission, index) => {
                const isGraded = submission.status === "Graded";
                const isProcessing = submittingId === submission._id;

                return (
                  <motion.article
                    key={submission._id}
                    className={`bx-submission-card ${isGraded ? "state-graded" : ""}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4, delay: index * 0.04 }}
                  >
                    {/* TOP IDENTITY ROW */}
                    <div className="bx-card-top-identity">
                      <div className="bx-assignment-info">
                        <div className="bx-doc-icon-wrapper">
                          <FiFileText />
                        </div>
                        <div>
                          <h3>{submission.assignment?.title || "Untitled Assignment"}</h3>
                          <span className="bx-student-tag">
                            <FiUser /> {
                              submission.student?.fullName ||
                              submission.student?.name ||
                              submission.student?.username ||
                              submission.student?.email ||
                              (typeof submission.student === 'string' ? `ID: ${submission.student.substring(0, 8)}...` : "Unknown Student")
                            }
                          </span>
                        </div>
                      </div>

                      <div className="bx-status-indicator-zone">
                        <span className={`bx-status-pill ${isGraded ? "graded" : "pending"}`}>
                          {isGraded ? (
                            <><FiCheckCircle /> Evaluated</>
                          ) : (
                            <><FiAlertCircle /> Needs Review</>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* ATTACHMENT ACTION BAR */}
                    <div className="bx-attachment-row">
                      <div className="bx-attachment-meta">
                        <FiCornerDownRight className="bx-sub-arrow" />
                        <span>Submitted Document Payload</span>
                      </div>
                      <a
                        href={submission.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bx-view-submission-btn"
                      >
                        Review Document <FiExternalLink />
                      </a>
                    </div>

                    {/* INPUT CONTROL MANAGEMENT BOARD */}
                    <div className="bx-grading-control-board">
                      <div className="bx-input-group-cell">
                        <label>
                          <FiAward /> Evaluation Score
                        </label>
                        <div className="bx-input-wrapper-inner">
                          <input
                            type="number"
                            placeholder="e.g. 85"
                            min="0"
                            max="100"
                            value={grades[submission._id] || ""}
                            onChange={(e) => handleGradeChange(submission._id, e.target.value)}
                          />
                          <span className="bx-input-unit-tag">/100</span>
                        </div>
                      </div>

                      <div className="bx-input-group-cell span-full-width">
                        <label>
                          <FiMessageSquare /> Academic Feedback Notes
                        </label>
                        <textarea
                          placeholder="Provide performance feedback observations or critique points regarding this submission..."
                          rows={3}
                          value={feedbacks[submission._id] || ""}
                          onChange={(e) => handleFeedbackChange(submission._id, e.target.value)}
                        />
                      </div>
                    </div>

                    {/* BOTTOM ACTION TIER */}
                    <div className="bx-card-action-footer">
                      <motion.button
                        type="button"
                        className={`bx-commit-grade-btn ${isGraded ? "btn-regrade" : ""}`}
                        disabled={isProcessing || !grades[submission._id]}
                        whileHover={{ y: -1 }}
                        whileTap={{ y: 1 }}
                        onClick={() => handleGradeSubmission(submission._id)}
                      >
                        {isProcessing ? (
                          <span className="bx-inline-spinner" />
                        ) : isGraded ? (
                          "Update Evaluation & Log"
                        ) : (
                          "Commit Evaluation Grade"
                        )}
                      </motion.button>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          /* EMPTY GRID FALLBACK BANNER */
          <motion.div
            className="bx-grading-empty-state"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bx-empty-icon-frame">
              <FiInbox />
            </div>
            <h3>Grading Backlog Clear</h3>
            <p>No new student assignment submissions have been logged to your course portal directories at this time.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default GradeSubmissions;