import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import API from "../../services/api";
import {
  FiCpu,
  FiZap,
  FiBookOpen,
  FiDollarSign,
  FiClock,
  FiTool,
  FiCheckCircle,
  FiAlertTriangle,
  FiRefreshCw,
  FiLayers,
  FiImage,
  FiFileText,
  FiTerminal,
  FiCheck,
  FiLoader,
  FiEdit3,
} from "react-icons/fi";
import "./AdminSyllabusGenerator.css";

const GENERATION_JOB_STORAGE_KEY =
  "benedex_active_course_generation_job";

function AdminSyllabusGenerator() {
  const [syllabusText, setSyllabusText] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [duration, setDuration] =
    useState("3 Months");

  const [toolsInput, setToolsInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [errorState, setErrorState] =
    useState(null);

  const [generatedCourse, setGeneratedCourse] =
    useState(null);

  const [progressLogs, setProgressLogs] =
    useState([]);

  const [progress, setProgress] =
    useState(0);

  const [currentStep, setCurrentStep] =
    useState(
      "Preparing course generation..."
    );

  const [jobId, setJobId] =
    useState(null);

  const logsEndRef = useRef(null);

  const lastLoggedStepRef =
    useRef("");

  const pollingRef =
    useRef(null);

  // ==========================================
  // ADD LOG
  // ==========================================

  const addProgressLog = (
    message,
    type = "info"
  ) => {
    if (!message) {
      return;
    }

    setProgressLogs((previous) => {
      const lastLog =
        previous[previous.length - 1];

      if (
        lastLog?.message === message
      ) {
        return previous;
      }

      return [
        ...previous,
        {
          id:
            Date.now() +
            Math.random(),
          message,
          type,
          time:
            new Date().toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }
            ),
        },
      ];
    });
  };

  // ==========================================
  // HANDLE GENERATION STATUS
  // ==========================================

  const handleGenerationStatus = (
    job
  ) => {
    if (!job) {
      return;
    }

    setProgress(
      Number(job.progress) || 0
    );

    setCurrentStep(
      job.currentStep ||
        "Generating course..."
    );

    if (
      job.currentStep &&
      job.currentStep !==
        lastLoggedStepRef.current
    ) {
      let type = "info";

      if (
        job.currentStep.includes(
          "completed:"
        ) ||
        job.currentStep.includes(
          "completed"
        )
      ) {
        type = "success";
      } else if (
        job.currentStep.includes(
          "failed"
        )
      ) {
        type = "error";
      } else if (
        job.currentStep.includes(
          "could not"
        ) ||
        job.currentStep.includes(
          "warning"
        )
      ) {
        type = "warning";
      } else if (
        job.currentStep.includes(
          "Generating"
        ) ||
        job.currentStep.includes(
          "Preparing"
        ) ||
        job.currentStep.includes(
          "Creating"
        )
      ) {
        type = "step";
      }

      addProgressLog(
        job.currentStep,
        type
      );

      lastLoggedStepRef.current =
        job.currentStep;
    }

    if (job.course) {
      setGeneratedCourse(
        job.course
      );
    }

    if (
      job.status === "completed"
    ) {
      setProgress(100);
      setLoading(false);

      if (job.course) {
        setGeneratedCourse(
          job.course
        );
      }

      addProgressLog(
        "Course generation completed. Draft is ready for admin review.",
        "success"
      );

      localStorage.removeItem(
        GENERATION_JOB_STORAGE_KEY
      );

      setJobId(null);

      return "completed";
    }

    if (
      job.status === "failed"
    ) {
      setLoading(false);

      const message =
        job.error ||
        "Course generation failed.";

      setErrorState(message);

      addProgressLog(
        message,
        "error"
      );

      localStorage.removeItem(
        GENERATION_JOB_STORAGE_KEY
      );

      setJobId(null);

      return "failed";
    }

    setLoading(true);

    return "active";
  };

  // ==========================================
  // FETCH GENERATION STATUS
  // ==========================================

  const fetchGenerationStatus =
    async (activeJobId) => {
      if (!activeJobId) {
        return null;
      }

      try {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          throw new Error(
            "Authentication token not found. Please log in again."
          );
        }

        const baseURL =
          API.defaults.baseURL ||
          "http://localhost:5000/api";

        const response =
          await fetch(
            `${baseURL}/courses/admin/generation/${activeJobId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                Accept:
                  "application/json",
              },
            }
          );

        if (!response.ok) {
          let errorMessage =
            "Unable to retrieve course generation status.";

          try {
            const errorData =
              await response.json();

            errorMessage =
              errorData.message ||
              errorMessage;
          } catch {
            // Ignore invalid error response.
          }

          throw new Error(
            errorMessage
          );
        }

        const data =
          await response.json();

        return data.job || null;
      } catch (error) {
        console.error(
          "Generation status error:",
          error
        );

        throw error;
      }
    };

  // ==========================================
  // STOP POLLING
  // ==========================================

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(
        pollingRef.current
      );

      pollingRef.current = null;
    }
  };

  // ==========================================
  // START POLLING
  // ==========================================

  const startPolling = (
    activeJobId
  ) => {
    if (!activeJobId) {
      return;
    }

    stopPolling();

    const poll = async () => {
      try {
        const job =
          await fetchGenerationStatus(
            activeJobId
          );

        if (!job) {
          stopPolling();
          setLoading(false);

          localStorage.removeItem(
            GENERATION_JOB_STORAGE_KEY
          );

          setJobId(null);

          return;
        }

        const status =
          handleGenerationStatus(
            job
          );

        if (
          status === "completed" ||
          status === "failed"
        ) {
          stopPolling();
        }
      } catch (error) {
        console.error(
          "Polling error:",
          error
        );

        setErrorState(
          error.message ||
            "Unable to monitor course generation."
        );
      }
    };

    poll();

    pollingRef.current =
      setInterval(
        poll,
        2500
      );
  };

  // ==========================================
  // CHECK FOR ACTIVE GENERATION
  // ==========================================

  const checkForActiveGeneration =
    async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          return;
        }

        const baseURL =
          API.defaults.baseURL ||
          "http://localhost:5000/api";

        const response =
          await fetch(
            `${baseURL}/courses/admin/generation/active`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                Accept:
                  "application/json",
              },
            }
          );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        const activeJob =
          data.job;

        if (!activeJob) {
          return;
        }

        setJobId(
          activeJob._id
        );

        localStorage.setItem(
          GENERATION_JOB_STORAGE_KEY,
          activeJob._id
        );

        setProgressLogs([]);

        lastLoggedStepRef.current =
          "";

        handleGenerationStatus(
          activeJob
        );

        startPolling(
          activeJob._id
        );
      } catch (error) {
        console.error(
          "Active generation check error:",
          error
        );
      }
    };

  // ==========================================
  // CHECK ACTIVE JOB ON PAGE LOAD
  // ==========================================

  useEffect(() => {
    const storedJobId =
      localStorage.getItem(
        GENERATION_JOB_STORAGE_KEY
      );

    if (storedJobId) {
      setJobId(storedJobId);

      fetchGenerationStatus(
        storedJobId
      )
        .then((job) => {
          if (!job) {
            localStorage.removeItem(
              GENERATION_JOB_STORAGE_KEY
            );

            setJobId(null);

            checkForActiveGeneration();

            return;
          }

          const status =
            handleGenerationStatus(
              job
            );

          if (
            status === "active"
          ) {
            startPolling(
              storedJobId
            );
          }
        })
        .catch(() => {
          checkForActiveGeneration();
        });

      return;
    }

    checkForActiveGeneration();

    return () => {
      stopPolling();
    };
  }, []);

  // ==========================================
  // CLEANUP POLLING
  // ==========================================

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  // ==========================================
  // AUTO SCROLL PROGRESS TERMINAL
  // ==========================================

  useEffect(() => {
    if (loading) {
      logsEndRef.current?.scrollIntoView(
        {
          behavior: "smooth",
        }
      );
    }
  }, [
    progressLogs,
    loading,
  ]);

  // ==========================================
  // GENERATE COURSE
  // ==========================================

  const handleGenerateCourse = async (
    e
  ) => {
    e.preventDefault();

    if (!syllabusText.trim()) {
      return;
    }

    stopPolling();

    setLoading(true);
    setErrorState(null);
    setGeneratedCourse(null);
    setProgressLogs([]);
    setProgress(0);
    setCurrentStep(
      "Preparing course generation..."
    );

    lastLoggedStepRef.current =
      "";

    const toolsArray = toolsInput
      ? toolsInput
          .split(",")
          .map((tool) =>
            tool.trim()
          )
          .filter(Boolean)
      : [];

    try {
      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {
        throw new Error(
          "Authentication token not found. Please log in again."
        );
      }

      const baseURL =
        API.defaults.baseURL ||
        "http://localhost:5000/api";

      const response =
        await fetch(
          `${baseURL}/courses/admin/generate-from-syllabus`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${token}`,
              Accept:
                "application/json",
            },
            body: JSON.stringify({
              syllabusText:
                syllabusText.trim(),
              price:
                Number(price) || 0,
              duration:
                duration ||
                "3 Months",
              tools: toolsArray,
            }),
          }
        );

      if (!response.ok) {
        let errorMessage =
          "Unable to start course generation.";

        try {
          const errorData =
            await response.json();

          errorMessage =
            errorData.message ||
            errorMessage;
        } catch {
          // Ignore invalid error response.
        }

        throw new Error(
          errorMessage
        );
      }

      const data =
        await response.json();

      if (!data.jobId) {
        throw new Error(
          "The server did not return a generation job ID."
        );
      }

      setJobId(
        data.jobId
      );

      localStorage.setItem(
        GENERATION_JOB_STORAGE_KEY,
        data.jobId
      );

      addProgressLog(
        "Course generation started in the background.",
        "success"
      );

      addProgressLog(
        "You can safely navigate to other pages while generation continues.",
        "info"
      );

      startPolling(
        data.jobId
      );
    } catch (error) {
      console.error(
        "Course Generation Error:",
        error
      );

      setLoading(false);

      setErrorState(
        error.message ||
          "Unable to start course generation."
      );

      addProgressLog(
        `Generation could not start: ${
          error.message ||
          "Unknown error"
        }`,
        "error"
      );
    }
  };

  // ==========================================
  // RESET FORM
  // ==========================================

  const handleResetForm = () => {
    stopPolling();

    localStorage.removeItem(
      GENERATION_JOB_STORAGE_KEY
    );

    setSyllabusText("");
    setPrice("");
    setDuration("3 Months");
    setToolsInput("");
    setGeneratedCourse(null);
    setErrorState(null);
    setProgressLogs([]);
    setProgress(0);
    setCurrentStep(
      "Preparing course generation..."
    );
    setJobId(null);

    lastLoggedStepRef.current =
      "";
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="bx-ad-workspace container-fluid py-4">

      <header className="bx-ad-hero-banner mb-4">
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">

          <div className="d-flex align-items-center gap-3">

            <div className="bx-ad-icon-box">
              <FiZap size={24} />
              <span className="bx-ad-pulse-light" />
            </div>

            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <h1 className="bx-ad-title mb-0">
                  Automated Course Synthesizer
                </h1>

                <span className="bx-ad-ver-badge">
                  Curriculum Engine
                </span>
              </div>

              <p className="bx-ad-subtitle mb-0">
                Paste any syllabus or topic
                outline to automatically
                generate structured modules,
                comprehensive lesson guides,
                and relevant visual materials.
              </p>
            </div>

          </div>

          {generatedCourse && (
            <button
              onClick={
                handleResetForm
              }
              className="bx-ad-refresh-action-btn"
            >
              <FiRefreshCw />

              <span>
                Create Another Course
              </span>
            </button>
          )}

        </div>
      </header>

      {errorState && (
        <motion.div
          className="alert alert-danger mb-4 p-3 rounded-4 border-0 shadow-sm d-flex align-items-center justify-content-between"
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
        >
          <div className="d-flex align-items-center gap-3 text-danger">
            <FiAlertTriangle size={22} />

            <span className="font-weight-medium small mb-0">
              {errorState}
            </span>
          </div>

          <button
            className="bx-ad-retry-btn"
            onClick={() =>
              setErrorState(null)
            }
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {loading ? (
        <motion.div
          className="bx-ad-generation-panel"
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
        >

          <div className="bx-ad-generation-header">

            <div className="d-flex align-items-center gap-3">

              <div className="bx-ad-terminal-icon">
                <FiTerminal />
              </div>

              <div>
                <h3 className="bx-ad-generation-title mb-1">
                  AI Course Generation
                </h3>

                <p className="bx-ad-generation-subtitle mb-0">
                  Background generation is running
                </p>
              </div>

            </div>

            <div className="bx-ad-live-indicator">
              <span />
              GENERATING
            </div>

          </div>

          <div className="bx-ad-progress-wrapper">

            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="bx-ad-progress-label">
                Generation Progress
              </span>

              <strong className="bx-ad-progress-value">
                {progress}%
              </strong>
            </div>

            <div className="bx-ad-progress-track">
              <div
                className="bx-ad-progress-bar"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      progress
                    )
                  )}%`,
                }}
              />
            </div>

            <div className="bx-ad-current-step">
              <FiLoader />

              <span>
                {currentStep}
              </span>
            </div>

          </div>

          <div className="bx-ad-terminal">

            <div className="bx-ad-terminal-topbar">
              <div className="d-flex align-items-center gap-2">
                <span className="bx-ad-dot" />
                <span className="bx-ad-dot" />
                <span className="bx-ad-dot" />
              </div>

              <span className="bx-ad-terminal-label">
                benedex-ai-engine
              </span>
            </div>

            <div className="bx-ad-terminal-body">

              <div className="bx-ad-terminal-welcome">
                <span className="bx-ad-terminal-green">
                  $
                </span>{" "}
                Background curriculum
                pipeline active...
              </div>

              {progressLogs.map(
                (log) => (
                  <div
                    key={log.id}
                    className={`bx-ad-log-line is-${log.type}`}
                  >
                    <span className="bx-ad-log-time">
                      [
                      {log.time}
                      ]
                    </span>

                    <span className="bx-ad-log-icon">
                      {log.type ===
                        "success" && (
                        <FiCheck />
                      )}

                      {log.type ===
                        "error" && (
                        <FiAlertTriangle />
                      )}

                      {log.type ===
                        "warning" && (
                        <FiAlertTriangle />
                      )}

                      {log.type ===
                        "step" && (
                        <FiLoader />
                      )}

                      {log.type ===
                        "info" && (
                        <FiTerminal />
                      )}
                    </span>

                    <span className="bx-ad-log-message">
                      {log.message}
                    </span>
                  </div>
                )
              )}

              <div
                ref={
                  logsEndRef
                }
                className="bx-ad-terminal-cursor"
              >
                <span>$</span>
                <span className="bx-ad-cursor" />
              </div>

            </div>

          </div>

          <div className="bx-ad-generation-footer">

            <FiCpu />

            <span>
              Generation continues on the
              server. You can safely navigate
              away and return later to check
              its progress.
            </span>

          </div>

        </motion.div>
      ) : generatedCourse ? (

        <motion.div
          className="bx-ad-card-panel mb-4"
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
        >

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom pb-3 mb-4 gap-3">

            <div>

              <span className="bx-ad-status-pill is-success mb-2">
                <FiCheckCircle className="me-1" />
                Draft Created & Ready for Review
              </span>

              <h2 className="bx-ad-title h4 mb-1">
                {generatedCourse.title}
              </h2>

              <p className="text-muted small mb-0">
                {generatedCourse.description}
              </p>

            </div>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="bx-ad-badge-info">
                Status:{" "}
                {generatedCourse.status ||
                  "draft"}
              </span>

              {generatedCourse.slug && (
                <span className="bx-ad-badge-info">
                  Course Link Identifier:{" "}
                  {generatedCourse.slug}
                </span>
              )}
            </div>

          </div>

          <div className="bx-ad-review-notice mb-4">

            <div className="bx-ad-review-notice-icon">
              <FiEdit3 />
            </div>

            <div>
              <h4>
                Admin Review Required
              </h4>

              <p>
                The course has been generated
                as a draft. Review and edit the
                course, modules, lessons, and
                quizzes before publishing it to
                students.
              </p>
            </div>

          </div>

          <div className="row g-3 mb-4">

            <div className="col-6 col-md-3">
              <div className="bx-ad-stat-card">

                <span className="bx-ad-stat-label">
                  Enrollment Price
                </span>

                <div className="d-flex align-items-center justify-content-between mt-2">

                  <h3 className="bx-ad-stat-val mb-0">
                    ₦
                    {generatedCourse.price?.toLocaleString()}
                  </h3>

                  <div className="bx-ad-stat-icon is-gold">
                    <FiDollarSign />
                  </div>

                </div>

              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="bx-ad-stat-card">

                <span className="bx-ad-stat-label">
                  Course Duration
                </span>

                <div className="d-flex align-items-center justify-content-between mt-2">

                  <h3 className="bx-ad-stat-val mb-0">
                    {generatedCourse.duration}
                  </h3>

                  <div className="bx-ad-stat-icon is-blue">
                    <FiClock />
                  </div>

                </div>

              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="bx-ad-stat-card">

                <span className="bx-ad-stat-label">
                  Stack Tools
                </span>

                <div className="d-flex align-items-center justify-content-between mt-2">

                  <h3 className="bx-ad-stat-val mb-0">
                    {generatedCourse.tools?.length ||
                      0}{" "}
                    Tools
                  </h3>

                  <div className="bx-ad-stat-icon is-purple">
                    <FiTool />
                  </div>

                </div>

              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="bx-ad-stat-card">

                <span className="bx-ad-stat-label">
                  Cover Visual
                </span>

                <div className="d-flex align-items-center justify-content-between mt-2">

                  <span className="text-success font-weight-bold small">
                    Visual Attached
                  </span>

                  <div className="bx-ad-stat-icon is-green">
                    <FiImage />
                  </div>

                </div>

              </div>
            </div>

          </div>

          {generatedCourse.image && (
            <div className="bx-ad-course-cover-preview mb-4 overflow-hidden rounded-3 border">

              <img
                src={
                  generatedCourse.image
                }
                alt={
                  generatedCourse.title
                }
                className="w-100 object-fit-cover"
                style={{
                  maxHeight:
                    "240px",
                }}
              />

            </div>
          )}

          <div className="d-flex justify-content-end gap-3 pt-2">

            <button
              onClick={
                handleResetForm
              }
              className="bx-ad-refresh-action-btn"
            >
              <FiRefreshCw />

              <span>
                Generate Another Syllabus
              </span>
            </button>

          </div>

        </motion.div>

      ) : (

        <section className="row g-4">

          <div className="col-12 col-lg-8">

            <motion.div
              className="bx-ad-card-panel h-100"
              initial={{
                opacity: 0,
                scale: 0.99,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
            >

              <h3 className="bx-ad-panel-title mb-3">
                <FiFileText />

                <span>
                  Input Syllabus / Course Outline
                  Text
                </span>
              </h3>

              <form
                onSubmit={
                  handleGenerateCourse
                }
              >

                <div className="mb-4">

                  <label className="bx-ad-stat-label mb-2">
                    Raw Syllabus, Curriculum
                    Breakdown, or Topic List *
                  </label>

                  <textarea
                    rows={12}
                    className="form-control bx-ad-textarea"
                    placeholder={`Paste the full syllabus here... e.g.
Module 1: Introduction to Full-Stack Web Architecture
- Client-server communication models
- HTTP requests and status codes
- RESTful API principles

Module 2: Advanced React & State Management
- React Hooks in production
- Global state management patterns`}
                    value={syllabusText}
                    onChange={(e) =>
                      setSyllabusText(
                        e.target.value
                      )
                    }
                    required
                  />

                </div>

                <div className="row g-3 mb-4">

                  <div className="col-12 col-md-4">

                    <label className="bx-ad-stat-label mb-2">
                      Price (₦ NG) *
                    </label>

                    <div className="input-group">

                      <span className="input-group-text bg-light border-end-0">
                        ₦
                      </span>

                      <input
                        type="number"
                        className="form-control bx-ad-input border-start-0"
                        placeholder="e.g. 25000"
                        value={price}
                        onChange={(e) =>
                          setPrice(
                            e.target.value
                          )
                        }
                        required
                      />

                    </div>

                  </div>

                  <div className="col-12 col-md-4">

                    <label className="bx-ad-stat-label mb-2">
                      Duration
                    </label>

                    <select
                      className="form-select bx-ad-input"
                      value={duration}
                      onChange={(e) =>
                        setDuration(
                          e.target.value
                        )
                      }
                    >
                      <option value="1 Month">
                        1 Month
                      </option>

                      <option value="2 Months">
                        2 Months
                      </option>

                      <option value="3 Months">
                        3 Months
                      </option>

                      <option value="6 Months">
                        6 Months
                      </option>
                    </select>

                  </div>

                  <div className="col-12 col-md-4">

                    <label className="bx-ad-stat-label mb-2">
                      Stack Tools
                      (Comma-separated)
                    </label>

                    <input
                      type="text"
                      className="form-control bx-ad-input"
                      placeholder="React, Node.js, MongoDB"
                      value={toolsInput}
                      onChange={(e) =>
                        setToolsInput(
                          e.target.value
                        )
                      }
                    />

                  </div>

                </div>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !syllabusText.trim()
                  }
                  className="bx-ad-submit-btn w-100 py-3 font-weight-bold d-flex align-items-center justify-content-center gap-2"
                >
                  <FiZap size={18} />

                  <span>
                    Synthesize Full Course
                    Architecture
                  </span>

                </button>

              </form>

            </motion.div>

          </div>

          <div className="col-12 col-lg-4">

            <motion.div
              className="bx-ad-card-panel h-100 d-flex flex-column justify-content-between"
              initial={{
                opacity: 0,
                scale: 0.99,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                delay: 0.1,
              }}
            >

              <div>

                <h3 className="bx-ad-panel-title mb-3">
                  <FiCpu />

                  <span>
                    Automation Capabilities
                  </span>
                </h3>

                <div className="bx-ad-spec-list space-y-3">

                  <div className="d-flex align-items-start gap-3 p-3 bg-light rounded-3 mb-3">

                    <div className="bx-ad-stat-icon is-blue shrink-0">
                      <FiBookOpen />
                    </div>

                    <div>

                      <h4 className="bx-ad-table-primary mb-1">
                        Comprehensive Lesson
                        Guides
                      </h4>

                      <p className="bx-ad-subtitle mb-0">
                        Generates complete
                        instructional content,
                        structured readings,
                        practical exercises,
                        and key takeaway points
                        for every topic.
                      </p>

                    </div>

                  </div>

                  <div className="d-flex align-items-start gap-3 p-3 bg-light rounded-3 mb-3">

                    <div className="bx-ad-stat-icon is-purple shrink-0">
                      <FiImage />
                    </div>

                    <div>

                      <h4 className="bx-ad-table-primary mb-1">
                        Contextual Visual
                        Illustrations
                      </h4>

                      <p className="bx-ad-subtitle mb-0">
                        Automatically pairs each
                        lesson with high-quality
                        visual media relevant to
                        the subject matter.
                      </p>

                    </div>

                  </div>

                  <div className="d-flex align-items-start gap-3 p-3 bg-light rounded-3 mb-3">

                    <div className="bx-ad-stat-icon is-green shrink-0">
                      <FiLayers />
                    </div>

                    <div>

                      <h4 className="bx-ad-table-primary mb-1">
                        Structured Curriculum
                        Mapping
                      </h4>

                      <p className="bx-ad-subtitle mb-0">
                        Organizes your raw syllabus
                        into sequential learning
                        modules and step-by-step
                        student lessons.
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              <div className="mt-4 pt-3 border-t">

                <span className="bx-ad-badge-info d-inline-block mb-2">
                  Admin Review Workflow
                </span>

                <p className="text-muted small mb-0">
                  Courses generated through this
                  terminal are saved as drafts.
                  Review and edit the generated
                  content before manually publishing
                  it for student enrollment.
                </p>

              </div>

            </motion.div>

          </div>

        </section>

      )}

    </div>
  );
}

export default AdminSyllabusGenerator;