import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import {
  FiFileText,
  FiUpload,
  FiCheckCircle,
  FiClock,
  FiAward,
  FiMessageSquare,
  FiAlertCircle,
  FiPaperclip
} from "react-icons/fi";
import "./Assignments.css";

function Assignments() {
  const { user } = useAuth();
  const location = useLocation();

  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assignmentsRes, submissionsRes] = await Promise.all([
          API.get("/assignments"),
          API.get("/assignments/my-submissions")
        ]);

        setAssignments(assignmentsRes.data || []);
        setSubmissions(submissionsRes.data || []);
      } catch (error) {
        console.error("Error loading baseline structural coursework info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.pathname]);

  const handleFileChange = (assignmentId, file) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [assignmentId]: file,
    }));
  };

  const handleSubmit = async (assignmentId) => {
    try {
      const file = selectedFiles[assignmentId];
      if (!file) {
        alert("Please select a valid academic asset document file.");
        return;
      }

      const formData = new FormData();
      formData.append("assignment", assignmentId);
      formData.append("file", file);

      await API.post("/assignments/submit", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Pull optimized fresh records after data modification
      const submissionsRes = await API.get("/assignments/my-submissions");
      setSubmissions(submissionsRes.data || []);
      
      // Notify layout metrics listeners
      window.dispatchEvent(new Event("student-activities-updated"));
    } catch (error) {
      console.error("Submission pipeline error tracking configuration:", error);
      alert(error?.response?.data?.message || "Gateway error uploading project files.");
    }
  };

  const getSubmission = (assignmentId) => {
    return submissions.find(
      (submission) => submission.assignment?._id === assignmentId
    );
  };

  if (loading) {
    return (
      <div className="scd-loader-container">
        <div className="scd-spinner" />
        <p>Loading Assignment Matrices...</p>
      </div>
    );
  }

  const submittedCount = submissions.length;
  const pendingCount = Math.max(0, assignments.length - submittedCount);

  return (
    <div className="benedex-lms-theme assignment-layout-root">
      {/* THEMED COMPONENT BODY FRAMEWORK */}
      <div className="benedex-container">
        {/* HERO BRAND HEADER */}
        <div className="assignment-hero-banner">
          <div className="hero-badge">ACADEMIC WORKSPACE</div>
          <h1>Coursework Assignments</h1>
          <p>
            Submit evaluation benchmarks, track real-time grading matrices, and inspect custom review engineering parameters assigned by academic leads.
          </p>
        </div>

        {/* METRICS ROW DASHBOARD SYSTEM */}
        <div className="metrics-summary-grid">
          <div className="metric-panel-card">
            <div className="metric-icon-box primary-variant">
              <FiFileText />
            </div>
            <div className="metric-info-data">
              <h3>{assignments.length}</h3>
              <span>Total Assignments</span>
            </div>
          </div>

          <div className="metric-panel-card">
            <div className="metric-icon-box success-variant">
              <FiCheckCircle />
            </div>
            <div className="metric-info-data">
              <h3>{submittedCount}</h3>
              <span>Evaluated & Submitted</span>
            </div>
          </div>

          <div className="metric-panel-card">
            <div className="metric-icon-box warning-variant">
              <FiClock />
            </div>
            <div className="metric-info-data">
              <h3>{pendingCount}</h3>
              <span>Pending Task Nodes</span>
            </div>
          </div>
        </div>

        {/* GRID LAYOUT SECTION */}
        <h2 className="workspace-section-heading">Assigned Milestones</h2>
        
        {assignments.length === 0 ? (
          <div className="empty-state-workspace-card">
            <FiAlertCircle size={44} />
            <h4>No Coursework Records Found</h4>
            <p>Your current active track modules do not have pending engineering files configured for submission.</p>
          </div>
        ) : (
          <div className="assignments-masonry-grid">
            {assignments.map((assignment) => {
              const submission = getSubmission(assignment._id);
              const fileSelected = selectedFiles[assignment._id];

              return (
                <div key={assignment._id} className={`workspace-assignment-card ${submission ? "is-submitted" : "is-active"}`}>
                  <div className="assignment-card-header">
                    <h3>{assignment.title}</h3>
                    {submission ? (
                      <span className="status-badge variant-completed">Submitted</span>
                    ) : (
                      <span className="status-badge variant-pending">Pending Entry</span>
                    )}
                  </div>

                  <p className="assignment-card-description">
                    {assignment.description || "No project configuration schematic breakdown provided by the supervisor framework."}
                  </p>

                  <div className="assignment-card-meta-row">
                    <div className="meta-timestamp-tag">
                      <FiClock />
                      <span>Due Date: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* CONDITIONAL INTERFACE: ALREADY SUBMITTED STATE */}
                  {submission && (
                    <div className="submission-receipt-workspace">
                      <div className="receipt-success-banner">
                        <FiCheckCircle />
                        <span>Academic Record Locked & Uploaded</span>
                      </div>

                      {submission.grade !== null && submission.grade !== undefined && (
                        <div className="receipt-evaluation-score-box">
                          <FiAward />
                          <span>Evaluation Performance Grade: <strong>{submission.grade}%</strong></span>
                        </div>
                      )}

                      {submission.feedback && (
                        <div className="receipt-feedback-workspace-block">
                          <div className="feedback-header-label">
                            <FiMessageSquare /> <span>Instructor Advisory Feedback:</span>
                          </div>
                          <p className="feedback-body-copy">"{submission.feedback}"</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CONDITIONAL INTERFACE: UN-SUBMITTED INTERACTIVE CONTROL */}
                  {!submission && (
                    <div className="assignment-upload-control-zone">
                      <label className="custom-file-upload-canvas" htmlFor={`file-input-${assignment._id}`}>
                        <FiPaperclip className="clip-icon" />
                        <span className="file-truncate-text">
                          {fileSelected ? fileSelected.name : "Select technical source file or project PDF..."}
                        </span>
                        <input
                          id={`file-input-${assignment._id}`}
                          type="file"
                          className="hidden-native-input"
                          onChange={(e) => handleFileChange(assignment._id, e.target.files[0])}
                        />
                      </label>

                      <button
                        className="btn-primary-action-buy width-full-override"
                        onClick={() => handleSubmit(assignment._id)}
                        disabled={!fileSelected}
                      >
                        <FiUpload /> Submit Engineering Assignment
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FOOTER CANVAS MATCHING LMS */}
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

export default Assignments;