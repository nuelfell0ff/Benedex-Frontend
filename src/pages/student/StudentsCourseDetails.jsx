import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCheckCircle,
  FiPlayCircle,
  FiLock,
  FiSearch,
  FiBell,
  FiVideo,
  FiFileText,
  FiAward,
  FiChevronUp,
  FiChevronDown,
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiActivity,
  FiBookOpen
} from "react-icons/fi";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./StudentsCourseDetails.css";

const StudentsCourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  /* Topbar states */
  const [notificationCount, setNotificationCount] = useState(0);

  /* Course data states */
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [totalLessons, setTotalLessons] = useState(0);

  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);

  const [progress, setProgress] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  /* Dynamic Enrollment state fetched from your dashboard */
  const [isEnrolled, setIsEnrolled] = useState(false);

  /* ---------------- DYNAMIC DATA INITIALIZATION ---------------- */
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [courseRes, modulesRes, dashboardRes] = await Promise.all([
          API.get(`/courses/${courseId}`),
          API.get(`/modules/${courseId}`),
          API.get("/dashboard/student"),
        ]);

        setCourse(courseRes.data);
        setModules(modulesRes.data || []);

        /* Check dynamic enrollment status matches your StudentCourses catalog structure */
        const enrolledIds = new Set(
          (dashboardRes.data?.enrolledCourses || []).map((c) => c._id)
        );
        setIsEnrolled(enrolledIds.has(courseId));

      } catch (err) {
        console.log("Error loading baseline structural database info:", err);
      }
    };
    fetchInitialData();
  }, [courseId]);

  /* ---------------- TOPBAR NOTIFICATIONS LOGIC ---------------- */
  useEffect(() => {
    let isMounted = true;

    const fetchNotifications = async () => {
      try {
        const res = await API.get("/dashboard/student");
        const count = res.data?.unreadActivityCount || 0;
        if (isMounted) {
          setNotificationCount(count);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchNotifications();

    const handleActivitiesUpdated = () => {
      fetchNotifications();
    };

    window.addEventListener("student-activities-updated", handleActivitiesUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener("student-activities-updated", handleActivitiesUpdated);
    };
  }, [location.pathname]);

  /* Avatar initials helper */
  const initials = (user?.fullName || "Student")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  /* ---------------- LESSONS + QUIZ FETCHING ---------------- */
  useEffect(() => {
    const fetchModuleData = async () => {
      if (!modules.length) return;
      setLoading(true);

      try {
        const moduleId = modules[selectedModuleIndex]?._id;
        if (!moduleId) return;

        const [lessonRes, quizRes] = await Promise.all([
          API.get(`/lessons/module/${moduleId}`),
          API.get(`/quizzes/module/${moduleId}`).catch(() => null),
        ]);

        setLessons(lessonRes.data || []);
        setQuiz(quizRes?.data || null);
        setSelectedLessonIndex(0);

        const lessonRequests = modules.map((module) =>
          API.get(`/lessons/module/${module._id}`)
        );
        const lessonResponses = await Promise.all(lessonRequests);
        const total = lessonResponses.reduce(
          (sum, response) => sum + (response.data?.length || 0),
          0
        );
        setTotalLessons(total);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchModuleData();
  }, [selectedModuleIndex, modules]);

  /* ---------------- PROGRESS HOOKS ---------------- */
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await API.get(`/lessons/progress`);
        setProgress(res.data || []);
      } catch (err) {
        console.log(err);
      }
    };
    fetchProgress();
  }, []);

  const currentLesson = lessons[selectedLessonIndex];

  const isCompleted = (lessonId) => {
    return progress.some((p) => {
      const progressLessonId = p.lesson?._id || p.lesson;
      return String(progressLessonId) === String(lessonId);
    });
  };

  const isLessonLocked = (lessonIndex) => {
    if (lessonIndex === 0) return false;
    const previousLesson = lessons[lessonIndex - 1];
    return !isCompleted(previousLesson?._id);
  };

  const markComplete = async () => {
    if (!currentLesson) return;
    try {
      await API.post(`/lessons/complete/${currentLesson._id}`);
      const progressRes = await API.get("/lessons/progress");
      setProgress(progressRes.data || []);
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message === "Lesson already completed") {
        const progressRes = await API.get("/lessons/progress");
        setProgress(progressRes.data || []);
      }
    }
  };

  /* Navigation controllers */
  const handlePrevLesson = () => {
    if (selectedLessonIndex > 0) {
      setSelectedLessonIndex((prev) => prev - 1);
    } else if (selectedModuleIndex > 0) {
      setSelectedModuleIndex((prev) => prev - 1);
    }
  };

  const handleNextLesson = () => {
    if (selectedLessonIndex < lessons.length - 1) {
      const nextIndex = selectedLessonIndex + 1;
      if (!isLessonLocked(nextIndex)) {
        setSelectedLessonIndex(nextIndex);
      }
    } else if (selectedModuleIndex < modules.length - 1) {
      setSelectedModuleIndex((prev) => prev + 1);
    }
  };

  const getYoutubeEmbed = (url) => {
    if (!url) return "";
    const match = url.match(/watch\?v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/) || url.match(/embed\/([^?]+)/);
    return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const formatPrice = (value) => `₦${Number(value || 0).toLocaleString()}`;

  const instructorName = course?.instructor?.fullName || "Adeola Johnson";
  const instructorTitle = course?.instructor?.bio || "Senior Design Lead at FinStream";

  const instructorInitials = instructorName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (!course) {
    return (
      <div className="scd-loader-container">
        <div className="scd-spinner" />
        <p>Loading Course Experience...</p>
      </div>
    );
  }

  return (
    <div className="benedex-lms-theme">

      {/* 1. TOPBAR WITH BRANDING */}
      <header className="student-topbar">
        <div className="student-topbar-brand-container">
          <div className="student-sidebar-brand">
            <span className="student-sidebar-mark" aria-hidden="true">
              <FiActivity />
            </span>
            <div className="student-sidebar-brand-copy">
              <strong>Benedex Digital</strong>
              <span>Premium Learning</span>
            </div>
          </div>
        </div>

        <label className="student-search" htmlFor="student-search-input">
          <FiSearch aria-hidden="true" />
          <input
            id="student-search-input"
            type="search"
            placeholder="Search courses, mentors, or topics..."
            aria-label="Search courses, mentors, or topics"
          />
        </label>

        <div className="student-top-actions">
          <Link className="student-icon-button student-notification-button" to="/student/notifications" aria-label="Notifications">
            <FiBell />
            {notificationCount > 0 ? (
              <span className="student-notification-badge" aria-label={`${notificationCount} new notifications`}>
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            ) : null}
          </Link>

          <div className="student-user-chip">
            <span className="student-user-avatar" aria-hidden="true">
              {initials}
            </span>
            <div className="student-user-copy">
              <strong>{user?.fullName || "Kwame Mensah"}</strong>
              <span>Level 12 Warrior</span>
            </div>
            <FiChevronDown aria-hidden="true" className="student-user-chevron" />
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="benedex-container">
        <div className="benedex-grid">

          {/* LEFT CONTENT COLUMN */}
          <main className="main-content-flow">

            {/* VIEWPORT CONTROLLER CARD */}
            <div className="media-player-card">
              {currentLesson && currentLesson.type === "video" && currentLesson.videoUrl ? (
                <div className="iframe-aspect-ratio">
                  <iframe
                    src={getYoutubeEmbed(currentLesson.videoUrl)}
                    title="Course Lesson Video Player"
                    allowFullScreen
                  />
                </div>
              ) : currentLesson && currentLesson.type === "text" ? (
                /* 3. UPGRADED PREMIUM MODERN TEXT READER UI */
                <div className="modern-text-workspace">
                  <div className="reader-header">
                    <div className="reader-meta">
                      <FiBookOpen />
                      <span>Reading Mode</span>
                    </div>
                  </div>
                  <div className="reader-scroll-canvas">
                    <h2 className="reader-article-title">{currentLesson.title}</h2>
                    <div className="reader-typography-body">
                      {currentLesson.content}
                    </div>
                  </div>
                </div>
              ) : currentLesson && currentLesson.type === "document" ? (
                /* 3. MODERNISED DOCUMENT VIEWPORT INTERFACE */
                <div className="modern-document-workspace">
                  <div className="document-glass-card">
                    <div className="document-icon-wrapper">
                      <FiFileText size={40} />
                    </div>
                    <div className="document-meta-details">
                      <h4>Resource Sheet Asset</h4>
                      <p>Click below to open or download the external handbook file assigned to this milestone.</p>
                    </div>
                    <a href={currentLesson.documentUrl} target="_blank" rel="noreferrer" className="modern-btn-download-link">
                      Open Document Resource
                    </a>
                  </div>
                </div>
              ) : (
                <div className="no-lesson-fallback">
                  <p>Select a lesson from the module overview below to begin streaming content.</p>
                </div>
              )}

              {/* <div className="media-overlay-details">
                <span className="now-playing-badge">
                  NOW PLAYING: MODULE {selectedModuleIndex + 1}
                </span>
                <h3 className="playing-title">
                  {currentLesson ? currentLesson.title : "Foundation Course Workspace"}
                </h3>
              </div> */}
            </div>

            {/* 2. NAVIGATION BAR SYSTEM */}
            <div className="workspace-navigation-row-bar">
              <button
                className="nav-control-button prev"
                onClick={handlePrevLesson}
                disabled={selectedModuleIndex === 0 && selectedLessonIndex === 0}
              >
                <FiArrowLeft /> Previous
              </button>

              <button
                className={`nav-control-button center-complete ${currentLesson && isCompleted(currentLesson._id) ? "is-finished" : ""}`}
                onClick={markComplete}
                disabled={!currentLesson}
              >
                {currentLesson && isCompleted(currentLesson._id) ? (
                  <><FiCheck /> Completed</>
                ) : (
                  "Mark as Complete"
                )}
              </button>

              <button
                className="nav-control-button next"
                onClick={handleNextLesson}
                disabled={
                  (selectedModuleIndex === modules.length - 1 && selectedLessonIndex === lessons.length - 1) ||
                  isLessonLocked(selectedLessonIndex + 1)
                }
              >
                Next <FiArrowRight />
              </button>
            </div>

            {/* TEXT DESCRIPTIONS ROW */}
            <div className="course-headline-section">
              <div className="badge-row">
                <span className="bestseller-tag">BESTSELLER</span>
                <span className="rating-text">★ 4.9 <span className="rating-count">(2.4k Ratings)</span></span>
              </div>
              <h1 className="course-main-title">{course.title || "Advanced Design Systems in EdTech"}</h1>
              <p className="course-main-desc">
                {course.description || "Master the art of building scalable, enterprise-grade educational platforms using token-based design systems."}
              </p>
            </div>

            {/* SYLLABUS GRID INFO */}
            <div className="learning-objectives-card">
              <h2>What Will I Learn</h2>
              <div className="objectives-grid">
                <div className="objective-item">
                  <FiCheckCircle className="check-icon-blue" />
                  <span>Architecting Atomic Design structures cleanly for full structural scalability.</span>
                </div>
                <div className="objective-item">
                  <FiCheckCircle className="check-icon-blue" />
                  <span>Defining global design tokens, cross-platform theme overrides and styles.</span>
                </div>
                <div className="objective-item">
                  <FiCheckCircle className="check-icon-blue" />
                  <span>Accessibility compliance workflow standards tailored directly for global systems.</span>
                </div>
                <div className="objective-item">
                  <FiCheckCircle className="check-icon-blue" />
                  <span>Streamlined documentation systems for seamless cross-team design handoff.</span>
                </div>
              </div>
            </div>

            {/* LESSON ACCORDION COMPONENT */}
            <div className="course-content-accordion-area">
              <div className="accordion-section-header">
                <h2>Course Content</h2>
                <span className="accordion-meta-total">
                  {modules.length} Modules • {totalLessons} Lessons • 12h Total
                </span>
              </div>

              <div className="custom-accordion-stack">
                {modules.map((module, moduleIndex) => {
                  const isOpen = moduleIndex === selectedModuleIndex;
                  return (
                    <div key={module._id} className={`custom-accordion-item ${isOpen ? "is-expanded" : ""}`}>
                      <button
                        className="custom-accordion-trigger"
                        onClick={() => {
                          setSelectedModuleIndex(moduleIndex);
                          setSelectedLessonIndex(0);
                        }}
                      >
                        <div className="trigger-left-block">
                          <span className="module-index-number">
                            {String(moduleIndex + 1).padStart(2, '0')}
                          </span>
                          <div className="module-title-text-group">
                            <h3>{module.title}</h3>
                            <span className="sub-lessons-count">
                              {isOpen ? lessons.length : "Available"} Lessons
                            </span>
                          </div>
                        </div>
                        <div className="trigger-right-block">
                          {isOpen ? <FiChevronUp /> : <FiChevronDown />}
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="custom-accordion-panel"
                          >
                            <div className="panel-inner-content">
                              {lessons.map((lesson, lessonIndex) => {
                                const completed = isCompleted(lesson._id);
                                const locked = isLessonLocked(lessonIndex);
                                const active = selectedLessonIndex === lessonIndex;

                                return (
                                  <div
                                    key={lesson._id}
                                    className={`interactive-lesson-row ${active ? "active-row" : ""} ${locked ? "locked-row" : ""}`}
                                    onClick={() => {
                                      if (locked) return;
                                      setSelectedLessonIndex(lessonIndex);
                                    }}
                                  >
                                    <div className="lesson-row-left">
                                      {completed ? (
                                        <FiCheckCircle className="status-icon completed-color" />
                                      ) : active ? (
                                        <FiPlayCircle className="status-icon active-color" />
                                      ) : locked ? (
                                        <FiLock className="status-icon locked-color" />
                                      ) : (
                                        <div className="status-dot-default" />
                                      )}
                                      <span className="lesson-row-title-text">{lesson.title}</span>
                                    </div>
                                    <div className="lesson-row-right">
                                      {active && !completed && (
                                        <button
                                          className="btn-inline-complete"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            markComplete();
                                          }}
                                        >
                                          Complete ✓
                                        </button>
                                      )}
                                      {/* 5. TIMESTAMPS REMOVED AS REQUESTED */}
                                    </div>
                                  </div>
                                );
                              })}

                              {/* QUIZ ACCORDION HOOKS */}
                              {quiz && (
                                <div className="panel-quiz-card-row">
                                  <div className="quiz-row-left">
                                    <FiAward className="quiz-award-icon" />
                                    <div>
                                      <h4>{quiz.title}</h4>
                                      <p>Evaluation Module Test • 10 Questions</p>
                                    </div>
                                  </div>
                                  <Link to={`/student/quiz/${quiz._id}`} className="btn-take-quiz-action">
                                    Take Quiz
                                  </Link>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </main>

          {/* STICKY RIGHT COLUMN OVERVIEWS */}
          <aside className="sidebar-sticky-flow">

            {/* 4. DYNAMIC ENROLLMENT AND PRICE PANEL */}
            <div className="checkout-widget-card">
              {isEnrolled ? (
                <div className="enrolled-status-banner">
                  <span className="enrolled-badge-dot"></span>
                  <strong>Paid & Enrolled</strong>
                </div>
              ) : (
                <>
                  <div className="pricing-header-row">
                    <span className="current-price-tag">{formatPrice(course.price)}</span>
                    <span className="old-strike-price">{formatPrice(course.price * 1.8)}</span>
                  </div>
                  <p className="scarcity-urgency-text">⏱ Limited time left at this tier price</p>
                </>
              )}

              <div className="action-buttons-stack">
                {isEnrolled ? (
                  <div className="workspace-status-notification">
                    Your account holds lifetime academic clearance for this course track.
                  </div>
                ) : (
                  <button className="btn-primary-action-buy" onClick={handleEnroll}>
                    Enroll Now
                  </button>
                )}
              </div>

              <span className="guarantee-footer-text">30-Day Money-Back Guarantee</span>
              <hr className="divider-line" />

              <div className="course-includes-perks-list">
                <h4>Course Includes:</h4>
                <ul>
                  <li><FiVideo /> 12 hours on-demand video streaming</li>
                  <li><FiFileText /> {totalLessons} dynamic class assets</li>
                  <li><FiCheckCircle /> Progress Tracking (Completed: {progress.length})</li>
                  <li><FiAward /> Digital certificate of completion</li>
                </ul>
              </div>
            </div>

            {/* 4. REAL INSTRUCTOR PROFILE LOADED VIA DB STATUS */}
            <div className="instructor-profile-widget">
              <div className="instructor-avatar-circle">
                {course.instructor?.image ? (
                  <img src={course.instructor.image} alt={instructorName} />
                ) : (
                  <div className="instructor-avatar-fallback">
                    {instructorInitials}
                  </div>
                )}
              </div>
              <div className="instructor-meta-details">
                <h3>{instructorName}</h3>
                <p className="instructor-title-bio">{instructorTitle}</p>
                <div className="instructor-stats-inline">
                  <span>Mentoring Partner</span>
                  <span>•</span>
                  <span>4.9 Star Rating</span>
                </div>
              </div>
            </div>

            {/* HARDWARE OVERVIEWS CARD */}
            <div className="requirements-widget-card">
              <h3>Requirements</h3>
              <ul>
                <li>Intermediate knowledge of development canvas environments</li>
                <li>Basic understanding of programmatic context configurations</li>
                <li>Experience with structural engineering code syntax tools</li>
              </ul>
            </div>

          </aside>
        </div>
      </div>

      {/* FOOTER CANVAS */}
      <footer className="benedex-footer-wrapper">
        <div className="footer-top-row">
          <div className="footer-brand-column">
            <h3>Benedex Digital</h3>
            <p>© 2026 Benedex Digital Hub. Built for African Excellence.</p>
          </div>
          <div className="footer-links-column">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Currency: NGN</span>
            <span>Contact Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StudentsCourseDetails;