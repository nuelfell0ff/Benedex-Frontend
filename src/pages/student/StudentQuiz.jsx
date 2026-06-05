import "./StudentQuiz.css";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../../services/api";
import {
  FiClock,
  FiCheckCircle,
  FiArrowRight,
  FiArrowLeft,
  FiAward,
  FiAlertCircle,
  FiActivity,
  FiChevronDown,
  FiBookOpen,
  FiHelpCircle
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

function StudentQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  /* ---------------- FETCH QUIZ ---------------- */
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);

        // PRIMARY: quizId route
        let res = await API.get(`/quizzes/${quizId}`).catch(() => null);

        // FALLBACK: module-based quiz
        if (!res?.data) {
          res = await API.get(`/quizzes/module/${quizId}`).catch(() => null);
        }

        const data = res?.data;

        if (!data || !data.questions || data.questions.length === 0) {
          setQuiz(null);
          return;
        }

        setQuiz(data);
        setTimeLeft(data.questions.length * 60); // 1 min per question
      } catch (err) {
        console.log(err);
        setQuiz(null);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (!quiz || submitted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [quiz, submitted]);

  const formatTime = (sec = 0) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  /* ---------------- SAFETY ---------------- */
  const questions = quiz?.questions || [];
  const question = questions[current];
  const progressPercentage = questions.length > 0 ? ((current + 1) / questions.length) * 100 : 0;

  /* ---------------- ANSWERS ---------------- */
  const handleSelect = (value) => {
    setAnswers((prev) => ({
      ...prev,
      [current]: value,
    }));
  };

  /* ---------------- NAVIGATION ---------------- */
  const next = () => {
    if (current < questions.length - 1) {
      setCurrent((p) => p + 1);
    }
  };

  const prev = () => {
    if (current > 0) {
      setCurrent((p) => p - 1);
    }
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    if (submitted || !quiz) return;

    let total = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) {
        total += 1;
      }
    });

    setScore(total);
    setSubmitted(true);
    clearInterval(timerRef.current);

    try {
      const res = await API.post(`/quizzes/submit/${quizId}`, { answers });
      setScore(res.data.correct);
    } catch (err) {
      console.log(err);
    }
  };

  /* Avatar initials helper */
  const initials = (user?.fullName || "Student")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  /* ---------------- LOADING STATE ---------------- */
  if (loading) {
    return (
      <div className="scd-loader-container">
        <div className="scd-spinner" />
        <p>Assembling Quiz Environment...</p>
      </div>
    );
  }

  /* ---------------- ERROR FALLBACK ---------------- */
  if (!quiz || questions.length === 0) {
    return (
      <div className="scd-loader-container">
        <FiAlertCircle size={40} style={{ color: "var(--accent-red)", marginBottom: "12px" }} />
        <p>No evaluation criteria mapped to this academic track segment yet.</p>
        <button onClick={() => navigate(-1)} className="nav-control-button" style={{ marginTop: "16px" }}>
          Return to Course Experience
        </button>
      </div>
    );
  }

  return (
    <div className="benedex-lms-theme quiz-workspace-layout">
      
      {/* GLOBAL PLATFORM TOPBAR */}
        {/* <header className="student-topbar">
          <div className="student-topbar-brand-container">
            <div className="student-sidebar-brand">
              <span className="student-sidebar-mark" aria-hidden="true">
                <FiActivity />
              </span>
              <div className="student-sidebar-brand-copy">
                <strong>Benedex Digital</strong>
                <span>Academic Assessment</span>
              </div>
            </div>
          </div>

          <div className="quiz-running-tracker-mid">
            <span className="quiz-badge-indicator">LIVE EVALUATION TRACK</span>
            <h2 className="quiz-topbar-title-truncate">{quiz.title}</h2>
          </div>

          <div className="student-top-actions">
            <div className="student-user-chip">
              <span className="student-user-avatar" aria-hidden="true">
                {initials}
              </span>
              <div className="student-user-copy">
                <strong>{user?.fullName || "Kwame Mensah"}</strong>
                <span>Student Account</span>
              </div>
              <FiChevronDown aria-hidden="true" className="student-user-chevron" />
            </div>
          </div>
        </header> */}

      {/* TWO COLUMN WORKSPACE CONTAINER */}
      <div className="benedex-container">
        
        {/* LINEAR PROGRESSIVE STRIP ACCENT */}
        {!submitted && (
          <div className="quiz-global-progress-wrapper">
            <div className="progress-text-row">
              <span>Milestone Progress</span>
              <strong>{current + 1} of {questions.length} Questions</strong>
            </div>
            <div className="progress-track-bar-bg">
              <div 
                className="progress-fill-bar-active" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        <div className="benedex-grid">
          
          {/* LEFT PRIMARY TESTING CANVAS */}
          <main className="main-content-flow">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key={current}
                  className="media-player-card quiz-testing-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="quiz-card-header-meta">
                    <span className="question-index-tag">QUESTION {String(current + 1).padStart(2, '0')}</span>
                    <div className="live-clock-badge">
                      <FiClock />
                      <span>{formatTime(timeLeft)} remaining</span>
                    </div>
                  </div>

                  <h2 className="quiz-surface-question-text">
                    {question?.question}
                  </h2>

                  <div className="quiz-interactive-options-stack">
                    {(question?.options || []).map((opt, i) => {
                      const isSelected = answers[current] === opt;
                      const alphabetIndex = String.fromCharCode(65 + i); // A, B, C, D

                      return (
                        <button
                          key={i}
                          className={`quiz-premium-option-row ${isSelected ? "is-selected" : ""}`}
                          onClick={() => handleSelect(opt)}
                        >
                          <span className="option-alphabet-key">{alphabetIndex}</span>
                          <span className="option-text-payload">{opt}</span>
                          <div className="option-radio-visual-target">
                            <div className="inner-radio-core" />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* NAV-CONTROLS REBALANCED WITHIN LOWER TRACK CARD CONTAINER */}
                  <div className="workspace-navigation-row-bar quiz-inner-controls">
                    <button 
                      className="nav-control-button" 
                      onClick={prev} 
                      disabled={current === 0}
                    >
                      <FiArrowLeft /> Previous Question
                    </button>

                    {current < questions.length - 1 ? (
                      <button className="nav-control-button next" onClick={next}>
                        Next Question <FiArrowRight />
                      </button>
                    ) : (
                      <button className="nav-control-button center-complete submit-action-trigger" onClick={handleSubmit}>
                        Submit Final Assessment
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                /* GRADUATED / SUBMITTED REPORT INTERFACE */
                <motion.div
                  className="media-player-card quiz-results-score-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="results-celebration-graphic">
                    <div className="award-icon-crown">
                      <FiAward size={44} />
                    </div>
                  </div>
                  
                  <span className="results-sub-heading">EVALUATION METRICS COMPLETED</span>
                  <h2>Performance Scoreboard</h2>
                  
                  <div className="score-numerical-display">
                    <span className="earned-points">{score}</span>
                    <span className="total-possible-points">/ {questions.length}</span>
                  </div>

                  <p className="results-feedback-prose">
                    {score / questions.length >= 0.7 
                      ? "Excellent track execution! You have demonstrated conceptual mastery over this specific course milestone." 
                      : "Good attempt. Review the referenced manual modules inside your learning workspace timeline to fortify core logic errors."}
                  </p>

                  <div className="results-action-row-group">
                    <button onClick={() => navigate("/student/courses")} className="btn-primary-action-buy">
                      Return to Course Dashboard
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* RIGHT SIDEBAR STATS TRACKER */}
          <aside className="sidebar-sticky-flow">
            
            {/* INTERACTIVE PROGRESS ASSESSMENT MAP */}
            <div className="checkout-widget-card quiz-matrix-widget">
              <h4>Assessment Map</h4>
              <p className="matrix-helper-text">Select maps cleanly to skip or jump between criteria blocks directly.</p>
              
              <div className="quiz-question-grid-matrix">
                {questions.map((_, index) => {
                  const isAnswered = answers[index] !== undefined;
                  const isActive = index === current;

                  return (
                    <button
                      key={index}
                      className={`matrix-node ${isActive ? "is-active" : ""} ${isAnswered ? "is-answered" : ""}`}
                      onClick={() => !submitted && setCurrent(index)}
                      disabled={submitted}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <hr className="divider-line" />
              
              <div className="matrix-legend-row">
                <div className="legend-item">
                  <span className="legend-dot active" />
                  <span>Current</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot answered" />
                  <span>Answered</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot default" />
                  <span>Pending</span>
                </div>
              </div>
            </div>

            {/* INTEGRITY / EXAM RULES WIDGET */}
            <div className="requirements-widget-card integrity-card">
              <div className="integrity-title-lockup">
                <FiHelpCircle />
                <h3>Examination Rules</h3>
              </div>
              <ul>
                <li>Do not refresh or exit the browser runtime matrix mid-session.</li>
                <li>When the timer track reaches zero, an auto-submit payload fires.</li>
                <li>Each question is scaled at average benchmarks of 60 seconds.</li>
              </ul>
            </div>

          </aside>
        </div>
      </div>

      {/* MASTER FOOTER ACCENT */}
      <footer className="benedex-footer-wrapper">
        <div className="footer-top-row">
          <div className="footer-brand-column">
            <h3>Benedex Digital</h3>
            <p>© 2026 Benedex Digital Hub. Secure Assessment Engine.</p>
          </div>
          <div className="footer-links-column">
            <span>Identity Enforcement Verified</span>
            <span>•</span>
            <span>Server Clock Synchronized</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default StudentQuiz;