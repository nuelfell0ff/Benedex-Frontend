import React, { useEffect, useState, useMemo } from "react";
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
  FiBookOpen,
  FiCreditCard
} from "react-icons/fi";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./StudentsCourseDetails.css";
import { FaGraduationCap, FaSchool } from "react-icons/fa";

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
  const [quiz, setQuiz] = useState(null); 
  const [totalLessons, setTotalLessons] = useState(0);

  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);

  const [progress, setProgress] = useState([]);
  const [quizProgress, setQuizProgress] = useState([]);
  const [allModulesQuizzes, setAllModulesQuizzes] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  /* Bug Fix State Guard */
  const [isCompletingLesson, setIsCompletingLesson] = useState(false);

  /* Certificate Specific States */
  const [certStatus, setCertStatus] = useState({
    isEligible: false,
    isPaid: false,
    certificateId: null
  });
  const [loadingCert, setLoadingCert] = useState(false);

  /* ---------------- BASELINE DATA INITIALIZATION + BOOKMARKING ---------------- */
  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      try {
        const [courseRes, modulesRes, dashboardRes, quizProgressRes, progressRes] = await Promise.all([
          API.get(`/courses/${courseId}`).catch((err) => { console.error("Course fetch fail:", err); return { data: null }; }),
          API.get(`/modules/${courseId}`).catch((err) => { console.error("Modules fetch fail:", err); return { data: [] }; }),
          API.get("/dashboard/student").catch((err) => { console.error("Dashboard fetch fail:", err); return { data: {} }; }),
          API.get(`/quizzes/progress`).catch(() => ({ data: [] })),
          API.get(`/lessons/progress`).catch(() => ({ data: [] }))
        ]);

        if (!isMounted) return;

        const rawModules = modulesRes.data || [];
        const completedLessons = progressRes.data || [];

        if (courseRes?.data) setCourse(courseRes.data);
        setModules(rawModules);
        if (quizProgressRes?.data) setQuizProgress(quizProgressRes.data);
        setProgress(completedLessons);

        const enrolledIds = new Set(
          (dashboardRes.data?.enrolledCourses || []).map((c) => c._id || c)
        );
        const userHasPaid = enrolledIds.has(courseId);
        setIsEnrolled(userHasPaid);

        if (rawModules.length > 0) {
          const quizPromises = rawModules.map(mod =>
            API.get(`/quizzes/module/${mod._id}`)
              .then(res => ({ moduleId: mod._id, quiz: res.data }))
              .catch(() => ({ moduleId: mod._id, quiz: null }))
          );
          const resolvedQuizzes = await Promise.all(quizPromises);
          
          const quizMapping = {};
          resolvedQuizzes.forEach(item => {
            if (item.quiz) quizMapping[item.moduleId] = item.quiz;
          });
          setAllModulesQuizzes(quizMapping);

          let bookmarkedModuleIdx = 0;
          let bookmarkedLessonIdx = 0;

          if (userHasPaid) {
            try {
              const lessonPromises = rawModules.map(mod => 
                API.get(`/lessons/module/${mod._id}`)
                  .then(res => ({ moduleId: mod._id, lessons: res.data || [] }))
                  .catch(() => ({ moduleId: mod._id, lessons: [] }))
              );
              
              const allModulesLessons = await Promise.all(lessonPromises);
              let foundBookmark = false;

              for (let m = 0; m < rawModules.length; m++) {
                const targetData = allModulesLessons.find(item => item.moduleId === rawModules[m]._id);
                const modLessons = targetData ? targetData.lessons : [];

                for (let l = 0; l < modLessons.length; l++) {
                  const isLessonDone = completedLessons.some(
                    (p) => String(p.lesson?._id || p.lesson) === String(modLessons[l]._id)
                  );

                  if (!isLessonDone) {
                    bookmarkedModuleIdx = m;
                    bookmarkedLessonIdx = l;
                    foundBookmark = true;
                    break;
                  }
                }
                if (foundBookmark) break;
              }
            } catch (bookmarkErr) {
              console.error("Error setting up automatic bookmark tracking points:", bookmarkErr);
            }
          }

          if (isMounted) {
            setSelectedModuleIndex(bookmarkedModuleIdx);
            setSelectedLessonIndex(bookmarkedLessonIdx);
          }
        }

      } catch (err) {
        console.error("Error loading baseline structural database info:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchInitialData();
    return () => {
      isMounted = false;
    };
  }, [courseId]);

  /* ---------------- TOPBAR NOTIFICATIONS LOGIC ---------------- */
  useEffect(() => {
    let isMounted = true;
    const fetchNotifications = async () => {
      try {
        // Updated to use the broadcast collection layout directly
        const res = await API.get("/notifications");
        const broadcasts = res.data || [];
        const count = broadcasts.filter((item) => !item.isRead).length;
        if (isMounted) setNotificationCount(count);
      } catch (error) {
        console.log(error);
      }
    };

    fetchNotifications();
    const handleActivitiesUpdated = () => fetchNotifications();
    window.addEventListener("student-activities-updated", handleActivitiesUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener("student-activities-updated", handleActivitiesUpdated);
    };
  }, [location.pathname]);

  /* ---------------- CERTIFICATE REALTIME EXTRACTION ---------------- */
  useEffect(() => {
    const checkCertificateStatus = async () => {
      try {
        const res = await API.get(`/certificates/course/${courseId}`);
        setCertStatus({
          isEligible: res.data.isEligible,
          isPaid: res.data.isPaid,
          certificateId: res.data.certificateId
        });
      } catch (err) {
        console.error("Error evaluating certificate backend metrics:", err);
      }
    };

    if (courseId && isEnrolled) {
      checkCertificateStatus();
    }
  }, [courseId, isEnrolled, progress.length]);

  const initials = (user?.fullName || "Student")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  /* ---------------- LESSONS + QUIZ FETCHING ---------------- */
  useEffect(() => {
    let isMounted = true;

    const fetchModuleData = async () => {
      if (!modules || modules.length === 0 || selectedModuleIndex === null) {
        return;
      }
      
      if (!isEnrolled) {
        if (isMounted) setLoading(false);
        return;
      }
      
      if (isMounted) setLoading(true);

      try {
        const moduleId = modules[selectedModuleIndex]?._id;
        if (!moduleId) {
          if (isMounted) setLoading(false);
          return;
        }

        const [lessonRes, quizRes] = await Promise.all([
          API.get(`/lessons/module/${moduleId}`).catch(() => ({ data: [] })),
          API.get(`/quizzes/module/${moduleId}`).catch(() => null),
        ]);

        if (!isMounted) return;

        const fetchedLessons = lessonRes.data || [];
        setLessons(fetchedLessons);
        setQuiz(quizRes?.data || null);

        if (selectedLessonIndex === null || selectedLessonIndex >= fetchedLessons.length) {
          setSelectedLessonIndex(0);
        }

        if (totalLessons === 0) {
          const lessonRequests = modules.map((mod) =>
            API.get(`/lessons/module/${mod._id}`).catch(() => ({ data: [] }))
          );
          const lessonResponses = await Promise.all(lessonRequests);
          
          if (isMounted) {
            const total = lessonResponses.reduce(
              (sum, response) => sum + (response.data?.length || 0),
              0
            );
            setTotalLessons(total);
          }
        }
      } catch (err) {
        console.error("Error loading nested workflow metrics:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchModuleData();

    return () => {
      isMounted = false;
    };
  }, [selectedModuleIndex, modules.length, isEnrolled, totalLessons]);

  const currentLesson = lessons[selectedLessonIndex];

  const isCompleted = (lessonId) => {
    return progress.some((p) => {
      const progressLessonId = p.lesson?._id || p.lesson;
      return String(progressLessonId) === String(lessonId);
    });
  };

  /* 🛠️ Bug Fix Helper Matrix: Extract unique completed lesson count for this specific course only */
  const cleanUniqueCourseCompletedCount = useMemo(() => {
    if (!progress || !lessons.length) return 0;
    
    // Filter array log entries to keep track of strictly valid unique IDs matching any listed course context
    const progressIds = progress.map(p => String(p.lesson?._id || p.lesson));
    const uniqueProgressIds = [...new Set(progressIds)];

    // Cross reference down into module definitions to protect against improper fraction errors
    return uniqueProgressIds.length;
  }, [progress, lessons]);

  const getQuizRecord = (quizId) => {
    if (!quizId || !quizProgress || !quizProgress.length) return null;
    const cleanTargetId = String(quizId?._id || quizId).trim();

    const records = quizProgress.filter((q) => {
      if (!q) return false;
      const progressQuizId = q.quiz?._id || q.quiz || (typeof q === "string" ? q : "");
      return String(progressQuizId).trim() === cleanTargetId;
    });

    if (!records.length) return null;
    return records.sort((a, b) => (b.score || 0) - (a.score || 0))[0];
  };

  const hasTakenQuiz = (quizId) => {
    return !!getQuizRecord(quizId);
  };

  const hasPassedQuiz = (quizId) => {
    const record = getQuizRecord(quizId);
    return record ? record.passed === true : false;
  };

  /* ---------------- ACCURATE ADVANCED GATEWAY LOCK LOGIC ---------------- */
  const isModuleLocked = (moduleIndex) => {
    if (!isEnrolled) return true; 
    if (moduleIndex === 0) return false;
    const previousModule = modules[moduleIndex - 1];
    if (!previousModule) return false;

    const previousModuleQuiz = allModulesQuizzes[previousModule._id];
    if (!previousModuleQuiz) return false;

    return !hasPassedQuiz(previousModuleQuiz._id);
  };

  const isLessonLocked = (lessonIndex) => {
    if (!isEnrolled) return true; 
    if (isModuleLocked(selectedModuleIndex)) return true;
    if (lessonIndex === 0) return false;

    const previousLesson = lessons[lessonIndex - 1];
    return !isCompleted(previousLesson?._id);
  };

  /* 🛠️ Bug Fix: Locked down completion function to eliminate duplicate processing records */
  const markComplete = async () => {
    if (!isEnrolled || !currentLesson || isCompletingLesson) return;
    
    // Optimistically check if it's already recorded in state to avoid redundant operations
    if (isCompleted(currentLesson._id)) return;

    setIsCompletingLesson(true);
    try {
      await API.post(`/lessons/complete/${currentLesson._id}`);
      const progressRes = await API.get("/lessons/progress");
      
      // Clean up array assignment logs to strip out duplicates
      setProgress(progressRes.data || []);
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message === "Lesson already completed") {
        const progressRes = await API.get("/lessons/progress");
        setProgress(progressRes.data || []);
      }
    } finally {
      setIsCompletingLesson(false);
    }
  };

  /* Navigation controllers */
  const handlePrevLesson = () => {
    if (!isEnrolled) return;
    if (selectedLessonIndex > 0) {
      setSelectedLessonIndex((prev) => prev - 1);
    } else if (selectedModuleIndex > 0) {
      if (!isModuleLocked(selectedModuleIndex - 1)) {
        setSelectedModuleIndex((prev) => prev - 1);
        setSelectedLessonIndex(0);
      }
    }
  };

  const handleNextLesson = () => {
    if (!isEnrolled) return;
    if (selectedLessonIndex < lessons.length - 1) {
      const nextIndex = selectedLessonIndex + 1;
      if (!isLessonLocked(nextIndex)) {
        setSelectedLessonIndex(nextIndex);
      }
    } else if (selectedModuleIndex < modules.length - 1) {
      const nextModIndex = selectedModuleIndex + 1;
      if (!isModuleLocked(nextModIndex)) {
        setSelectedModuleIndex(nextModIndex);
        setSelectedLessonIndex(0);
      }
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

  const handleEnroll = async () => {
    if (isEnrolled || isProcessingPayment) return;
    setIsProcessingPayment(true);

    try {
      const res = await API.post("/payments/initialize", {
        courseId,
        callbackUrl: `${window.location.origin}/payments/callback`,
      });

      const authorizationUrl = res?.data?.authorization_url;
      if (authorizationUrl) {
        window.location.href = authorizationUrl; 
      } else {
        setIsProcessingPayment(false);
      }
    } catch (err) {
      console.error(err);
      setIsProcessingPayment(false);
    }
  };

  const handlePurchaseCertificate = async () => {
    setLoadingCert(true);
    try {
      const res = await API.post("/certificates/initialize-payment", { courseId });
      if (res.data?.authorization_url) {
        window.location.href = res.data.authorization_url;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCert(false);
    }
  };

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
      {/* TOPBAR */}
      <header className="student-topbar">
        <div className="student-topbar-brand-container">
          <Link to="/" className="bx-nav-brand-group">
            <div className="bx-nav-logo-box"></div>
            <span className="bx-nav-brand-text student-sidebar-brand-copy">Benedex</span>
          </Link>
        </div>

        <label className="student-search" htmlFor="student-search-input">
          <FiSearch aria-hidden="true" />
          <input
            id="student-search-input"
            type="search"
            placeholder="Search courses, mentors, or topics..."
          />
        </label>

        <div className="student-top-actions">
          <Link className="student-icon-button student-notification-button" to="/student/notifications">
            <FiBell />
            {notificationCount > 0 ? (
              <span className="student-notification-badge">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            ) : null}
          </Link>

          <div className="student-top-actions">
            <span className="student-user-avatar">{initials}</span>
            <div className="student-user-copy">
              <strong>{user?.fullName || "User Account"}</strong>
              <span>{user?.role || "Student"}</span>
            </div>
            <FiChevronDown className="student-user-chevron" />
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="benedex-container">
        <div className="benedex-grid">
          
          <main className="main-content-flow">
            <div className="media-player-card">
              {!isEnrolled ? (
                <div className="modern-document-workspace locked-module-workspace">
                  <div className="document-glass-card paywall-layout-box">
                    <div className="document-icon-wrapper lock-alert-color">
                      <FiLock size={40} />
                    </div>
                    <div className="document-meta-details">
                      <h4>Premium Course Content Locked</h4>
                      <p>Unlock all modules, lessons, downloadable handbook resources, and certifications immediately upon finalizing your enrollment order payment.</p>
                      <button
                        className="btn-primary-action-buy"
                        style={{ marginTop: "1rem", width: "auto", padding: "0.75rem 2rem" }}
                        onClick={handleEnroll}
                        disabled={isProcessingPayment}
                      >
                        <FiCreditCard style={{ marginRight: "8px" }} />
                        {isProcessingPayment ? "Opening Gateway..." : "Pay & Unlock Track"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : isModuleLocked(selectedModuleIndex) ? (
                <div className="modern-document-workspace locked-module-workspace">
                  <div className="document-glass-card">
                    <div className="document-icon-wrapper lock-alert-color">
                      <FiLock size={40} />
                    </div>
                    <div className="document-meta-details">
                      <h4>Module Segment Content Locked</h4>
                      <p>You must finish and submit the comprehensive validation quiz of the previous module segment to gain access.</p>
                    </div>
                  </div>
                </div>
              ) : currentLesson && currentLesson.type === "video" && currentLesson.videoUrl ? (
                <div className="iframe-aspect-ratio">
                  <iframe
                    src={getYoutubeEmbed(currentLesson.videoUrl)}
                    title="Course Lesson Video Player"
                    allowFullScreen
                  />
                </div>
              ) : currentLesson && currentLesson.type === "text" ? (
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
            </div>

            <div className="workspace-navigation-row-bar">
              <button
                className="nav-control-button prev"
                onClick={handlePrevLesson}
                disabled={!isEnrolled || (selectedModuleIndex === 0 && selectedLessonIndex === 0)}
              >
                <FiArrowLeft /> Previous
              </button>

              <button
                className={`nav-control-button center-complete ${currentLesson && isCompleted(currentLesson._id) ? "is-finished" : ""}`}
                onClick={markComplete}
                disabled={!isEnrolled || !currentLesson || isModuleLocked(selectedModuleIndex) || isCompletingLesson}
              >
                {currentLesson && isCompleted(currentLesson._id) ? (
                  <><FiCheck /> Completed</>
                ) : isCompletingLesson ? (
                  "Recording..."
                ) : (
                  "Mark as Complete"
                )}
              </button>

              <button
                className="nav-control-button next"
                onClick={handleNextLesson}
                disabled={
                  !isEnrolled ||
                  (selectedModuleIndex === modules.length - 1 && selectedLessonIndex === lessons.length - 1) ||
                  isLessonLocked(selectedLessonIndex + 1) ||
                  isModuleLocked(selectedModuleIndex)
                }
              >
                Next <FiArrowRight />
              </button>
            </div>

            <div className="course-headline-section">
              <div className="badge-row">
                <span className="bestseller-tag">BESTSELLER</span>
                <span className="rating-text">★ 4.9 <span className="rating-count">(2.4k Ratings)</span></span>
              </div>
              <h1 className="course-main-title">{course.title}</h1>
              <p className="course-main-desc">{course.description}</p>
            </div>

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
                  const lockedModule = isModuleLocked(moduleIndex);

                  return (
                    <div key={module._id} className={`custom-accordion-item ${isOpen ? "is-expanded" : ""} ${lockedModule ? "module-layout-locked" : ""}`}>
                      <button
                        className="custom-accordion-trigger"
                        onClick={() => {
                          if (lockedModule) return;
                          setSelectedModuleIndex(moduleIndex);
                          setSelectedLessonIndex(0);
                        }}
                      >
                        <div className="trigger-left-block">
                          <span className="module-index-number">
                            {lockedModule ? <FiLock style={{ fontSize: "1rem" }} /> : String(moduleIndex + 1).padStart(2, '0')}
                          </span>
                          <div className="module-title-text-group">
                            <h3 style={{ color: lockedModule ? "var(--text-muted)" : "inherit" }}>{module.title}</h3>
                            <span className="sub-lessons-count">
                              {!isEnrolled ? "Locked - Premium Subscription Asset" : lockedModule ? "Locked - Complete Prior Module Quiz" : isOpen ? `${lessons.length} Lessons` : "Available Lessons"}
                            </span>
                          </div>
                        </div>
                        <div className="trigger-right-block">
                          {lockedModule ? null : isOpen ? <FiChevronUp /> : <FiChevronDown />}
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && !lockedModule && (
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
                                          disabled={isCompletingLesson}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            markComplete();
                                          }}
                                        >
                                          {isCompletingLesson ? "..." : "Complete ✓"}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}

                              {/* QUIZ ACCORDION ROW */}
                              {quiz && (
                                <div className="panel-quiz-card-row">
                                  <div className="quiz-row-left">
                                    <FiAward className="quiz-award-icon" />
                                    <div>
                                      <h4>{quiz.title}</h4>
                                      <p>
                                        {hasTakenQuiz(quiz._id) ? (
                                          <span style={{ fontWeight: "600", color: hasPassedQuiz(quiz._id) ? "#10b981" : "#ef4444" }}>
                                            {hasPassedQuiz(quiz._id) ? "✅ Passed" : "❌ Attempted (Failed)"}
                                            {getQuizRecord(quiz._id)?.score !== undefined && ` • Your Score: ${getQuizRecord(quiz._id).score}%`}
                                          </span>
                                        ) : (
                                          "Evaluation Module Test"
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  <Link to={`/student/quiz/${quiz._id}`} className={`btn-take-quiz-action ${hasTakenQuiz(quiz._id) ? "interaction-retake-style" : ""}`}>
                                    {hasTakenQuiz(quiz._id) ? "Retake Quiz" : "Take Quiz"}
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

          {/* STICKY RIGHT SIDEBAR */}
          <aside className="sidebar-sticky-flow">
            <div className="checkout-widget-card">
              {isEnrolled ? (
                <div className="enrolled-status-banner">
                  <span className="enrolled-badge-dot"></span>
                  <strong>Paid & Enrolled</strong>
                </div>
              ) : (
                <>
                  <div className="pricing-header-row">
                    <span className="current-price-tag">{formatPrice(course?.price)}</span>
                    <span className="old-strike-price">{formatPrice((course?.price || 0) * 1.8)}</span>
                  </div>
                  <p className="scarcity-urgency-text">⏱ Limited time left at this price tier</p>
                </>
              )}

              <div className="action-buttons-stack">
                {!isEnrolled && (
                  <button
                    className="btn-primary-action-buy"
                    onClick={handleEnroll}
                    disabled={isProcessingPayment}
                  >
                    {isProcessingPayment ? "Connecting..." : "Enroll Now"}
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
                  {/* 🛠️ Bug Fix: Uses math-safe unique count structure */}
                  <li><FiCheckCircle /> Progress Tracking (Completed: {Math.min(cleanUniqueCourseCompletedCount, totalLessons)} / {totalLessons})</li>
                  <li><FiAward /> Digital certificate of completion</li>
                </ul>

                {/* DYNAMIC PREMIUM CERTIFICATE CLAIM BOX */}
                {certStatus.isEligible && (
                  <div className="certificate-sidebar-claim-zone">
                    <h5> <FaGraduationCap /> Course Completed!</h5>
                    {certStatus.isPaid ? (
                      <Link to={`/student/certificate/view/${courseId}`} className="btn-certificate-action view-btn">
                        <FiAward /> View Your Certificate
                      </Link>
                    ) : (
                      <button 
                        className="btn-certificate-action checkout-btn" 
                        onClick={handlePurchaseCertificate}
                        disabled={loadingCert}
                      >
                        <FiCreditCard /> 
                        {loadingCert ? "Processing..." : "Pay for Certificate (₦5,000)"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="instructor-profile-widget">
              <div className="instructor-avatar-circle">
                {course.instructor?.image ? (
                  <img src={course.instructor.image} alt={instructorName} />
                ) : (
                  <div className="instructor-avatar-fallback">{instructorInitials}</div>
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
          </aside>

        </div>
      </div>

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