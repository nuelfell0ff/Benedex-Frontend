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
} from "react-icons/fi";
import "./AdminSyllabusGenerator.css";

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

  const logsEndRef = useRef(null);

  // ==========================================
  // AUTO SCROLL PROGRESS TERMINAL
  // ==========================================

  useEffect(() => {
    if (loading) {
      logsEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [progressLogs, loading]);

  // ==========================================
  // ADD LOG
  // ==========================================

  const addProgressLog = (
    message,
    type = "info"
  ) => {
    setProgressLogs((previous) => [
      ...previous,
      {
        id:
          Date.now() +
          Math.random(),
        message,
        type,
        time: new Date().toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }
        ),
      },
    ]);
  };

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

    setLoading(true);
    setErrorState(null);
    setGeneratedCourse(null);
    setProgressLogs([]);

    const toolsArray = toolsInput
      ? toolsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Authentication token not found. Please log in again."
        );
      }

      const baseURL =
        API.defaults.baseURL ||
        "http://localhost:5000/api";

      const response = await fetch(
        `${baseURL}/courses/admin/generate-from-syllabus`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
            Accept:
              "text/event-stream",
          },

          body: JSON.stringify({
            syllabusText,
            price:
              Number(price) || 0,
            duration:
              duration || "3 Months",
            tools: toolsArray,
          }),
        }
      );

      if (!response.ok) {
        let errorMessage =
          "Course generation failed.";

        try {
          const errorData =
            await response.json();

          errorMessage =
            errorData.message ||
            errorMessage;
        } catch {
          // Response wasn't JSON.
        }

        throw new Error(errorMessage);
      }

      if (!response.body) {
        throw new Error(
          "Your browser does not support streaming responses."
        );
      }

      const reader =
        response.body.getReader();

      const decoder =
        new TextDecoder("utf-8");

      let buffer = "";

      while (true) {
        const {
          value,
          done,
        } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(
          value,
          {
            stream: true,
          }
        );

        const events =
          buffer.split("\n\n");

        buffer =
          events.pop() || "";

        for (const event of events) {
          const lines =
            event
              .split("\n")
              .filter((line) =>
                line.startsWith("data:")
              );

          if (!lines.length) {
            continue;
          }

          const dataText =
            lines
              .map((line) =>
                line.replace(
                  /^data:\s?/,
                  ""
                )
              )
              .join("\n");

          try {
            const data =
              JSON.parse(dataText);

            // ------------------------------
            // Normal progress event
            // ------------------------------

            if (data.message) {
              addProgressLog(
                data.message,
                data.type || "info"
              );
            }

            // ------------------------------
            // Final course
            // ------------------------------

            if (
              data.type === "complete" &&
              data.course
            ) {
              setGeneratedCourse(
                data.course
              );
            }

            // ------------------------------
            // Backend error
            // ------------------------------

            if (
              data.type === "error"
            ) {
              setErrorState(
                data.message ||
                  "Course generation failed."
              );
            }
          } catch (parseError) {
            console.error(
              "Failed to parse generation event:",
              parseError,
              dataText
            );
          }
        }
      }

      // Flush any remaining decoder data.
      buffer += decoder.decode();

      if (buffer.trim()) {
        const lines =
          buffer
            .split("\n")
            .filter((line) =>
              line.startsWith("data:")
            );

        for (const line of lines) {
          try {
            const data =
              JSON.parse(
                line.replace(
                  /^data:\s?/,
                  ""
                )
              );

            if (data.message) {
              addProgressLog(
                data.message,
                data.type || "info"
              );
            }

            if (
              data.type === "complete" &&
              data.course
            ) {
              setGeneratedCourse(
                data.course
              );
            }

            if (
              data.type === "error"
            ) {
              setErrorState(
                data.message ||
                  "Course generation failed."
              );
            }
          } catch {
            // Ignore incomplete final chunk.
          }
        }
      }
    } catch (error) {
      console.error(
        "Course Generation Error:",
        error
      );

      setErrorState(
        error.message ||
          "Automated course synthesis encountered an error."
      );

      addProgressLog(
        `Generation stopped: ${
          error.message ||
          "Unknown error"
        }`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RESET
  // ==========================================

  const handleResetForm = () => {
    setSyllabusText("");
    setPrice("");
    setDuration("3 Months");
    setToolsInput("");
    setGeneratedCourse(null);
    setErrorState(null);
    setProgressLogs([]);
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="bx-ad-workspace container-fluid py-4">

      {/* HERO */}

      <header className="bx-ad-hero-banner mb-4">
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">

          <div className="d-flex align-items-center gap-3">

            <div className="bx-ad-icon-box">
              <FiZap size={24} />
              <span className="bx-ad-pulse-light" />
            </div>

            <div>
              <div className="d-flex align-items-center gap-2">
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
              onClick={handleResetForm}
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

      {/* ERROR */}

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

      {/* ===================================== */}
      {/* LIVE GENERATION TERMINAL             */}
      {/* ===================================== */}

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
                  Live backend generation stream
                </p>
              </div>

            </div>

            <div className="bx-ad-live-indicator">
              <span />
              LIVE
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
                Starting automated curriculum
                pipeline...
              </div>

              {progressLogs.map((log) => (
                <div
                  key={log.id}
                  className={`bx-ad-log-line is-${log.type}`}
                >

                  <span className="bx-ad-log-time">
                    [{log.time}]
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
              ))}

              <div
                ref={logsEndRef}
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
              Please keep this page open while
              the AI pipeline generates the course.
            </span>

          </div>

        </motion.div>
      ) : generatedCourse ? (

        /* =================================== */
        /* GENERATED COURSE                    */
        /* =================================== */

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
                Course Created & Ready
              </span>

              <h2 className="bx-ad-title h4 mb-1">
                {generatedCourse.title}
              </h2>

              <p className="text-muted small mb-0">
                {generatedCourse.description}
              </p>

            </div>

            <div className="d-flex align-items-center gap-2">
              <span className="bx-ad-badge-info">
                Course Link Identifier:{" "}
                {generatedCourse.slug}
              </span>
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
                  maxHeight: "240px",
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
              <span>
                Generate Another Syllabus
              </span>
            </button>

          </div>

        </motion.div>

      ) : (

        /* =================================== */
        /* INPUT FORM                           */
        /* =================================== */

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
                  Automated Workflow
                </span>

                <p className="text-muted small mb-0">
                  Courses generated through this
                  terminal are immediately
                  published to your platform
                  catalog and ready for student
                  enrollment.
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