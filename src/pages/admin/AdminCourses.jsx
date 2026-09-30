import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import {
  FiBookOpen,
  FiTrash2,
  FiSearch,
  FiLayers,
  FiAlertCircle,
  FiCheckCircle,
  FiCpu,
  FiEdit3,
  FiEye,
  FiClock,
} from "react-icons/fi";
import "./AdminCourses.css";

function AdminCourses() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [modal, setModal] = useState({
    isOpen: false,
    course: null,
    processing: false,
  });

  const fetchCourses = async () => {
    try {
      setLoading(true);

      const res = await API.get("/courses/admin/all");

      setCourses(res.data);
    } catch (error) {
      console.error(
        "Course registry sync failure:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const openDeleteModal = (course) => {
    setModal({
      isOpen: true,
      course,
      processing: false,
    });
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      course: null,
      processing: false,
    });
  };

  const handleDelete = async () => {
    if (!modal.course) return;

    setModal((prev) => ({
      ...prev,
      processing: true,
    }));

    try {
      await API.delete(
        `/courses/${modal.course._id}`
      );

      setCourses((prev) =>
        prev.filter(
          (course) =>
            course._id !== modal.course._id
        )
      );

      closeModal();
    } catch (error) {
      console.error(
        "Course deletion failure:",
        error
      );

      alert(
        "Purge Failure: " +
          (error.response?.data?.message ||
            error.message)
      );

      setModal((prev) => ({
        ...prev,
        processing: false,
      }));
    }
  };

  const handleReview = (course) => {
    navigate(
      `/admin/courses/${course._id}/review`
    );
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title
        ?.toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        ) ||
      course.description
        ?.toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )
  );

  const draftCount = courses.filter(
    (course) => course.status === "draft"
  ).length;

  const publishedCount = courses.filter(
    (course) =>
      course.status === "published"
  ).length;

  if (loading) {
    return (
      <div className="bx-cr-loading-pane">
        <div className="bx-cr-spinner"></div>

        <p className="mt-3 text-muted font-weight-bold">
          Compiling Course Architecture
          Telemetry...
        </p>
      </div>
    );
  }

  return (
    <div className="bx-cr-workspace container-fluid py-4">
      <header className="bx-cr-header d-flex flex-column gap-3 mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div className="bx-cr-title-zone">
            <div className="d-flex align-items-center gap-3">
              <div className="bx-cr-icon-box">
                <FiCpu size={24} />

                <span className="bx-cr-pulse-light" />
              </div>

              <div>
                <div className="d-flex align-items-center gap-2">
                  <h1 className="h3 mb-0 font-weight-bold">
                    Course Architecture
                  </h1>

                  <span className="bx-cr-ver-badge">
                    Registry Hub
                  </span>
                </div>

                <p className="text-muted mb-0 small">
                  Review, edit, and publish
                  system curriculum.
                </p>
              </div>
            </div>
          </div>

          <div className="bx-cr-search-wrapper">
            <FiSearch className="bx-cr-search-icon" />

            <input
              type="text"
              placeholder="Filter by course title or keywords..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />
          </div>
        </div>

        <div className="bx-cr-kpi-bar d-flex gap-3 flex-wrap">
          <div className="bx-cr-kpi-item">
            <FiLayers size={14} />

            <span>
              <strong>
                {courses.length}
              </strong>{" "}
              Total Courses
            </span>
          </div>

          <div className="bx-cr-kpi-item">
            <FiClock
              size={14}
              className="text-warning"
            />

            <span>
              <strong>
                {draftCount}
              </strong>{" "}
              Drafts
            </span>
          </div>

          <div className="bx-cr-kpi-item">
            <FiCheckCircle
              size={14}
              className="text-success"
            />

            <span>
              <strong>
                {publishedCount}
              </strong>{" "}
              Published
            </span>
          </div>
        </div>
      </header>

      <div className="row g-4">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(
            (course, idx) => {
              const isDraft =
                course.status ===
                "draft";

              return (
                <div
                  className="col-12 col-md-6 col-xl-4"
                  key={course._id}
                >
                  <motion.div
                    className={`bx-cr-card ${
                      isDraft
                        ? "bx-cr-card-draft"
                        : ""
                    }`}
                    initial={{
                      opacity: 0,
                      y: 15,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay:
                        idx * 0.05,
                    }}
                  >
                    <div className="bx-cr-card-header">
                      <div className="bx-cr-card-icon">
                        <FiBookOpen />
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <span
                          className={`bx-cr-status-badge ${
                            isDraft
                              ? "bx-cr-status-draft"
                              : "bx-cr-status-published"
                          }`}
                        >
                          {isDraft ? (
                            <>
                              <FiClock
                                size={11}
                              />
                              Draft
                            </>
                          ) : (
                            <>
                              <FiCheckCircle
                                size={11}
                              />
                              Published
                            </>
                          )}
                        </span>

                        <button
                          className="bx-cr-delete-trigger"
                          onClick={() =>
                            openDeleteModal(
                              course
                            )
                          }
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>

                    <div className="bx-cr-card-body">
                      <h3 className="bx-cr-course-title">
                        {course.title}
                      </h3>

                      <p className="bx-cr-course-desc">
                        {course.description}
                      </p>
                    </div>

                    <div className="bx-cr-card-footer">
                      <span className="bx-cr-id-tag">
                        ID:{" "}
                        {course._id.substring(
                          0,
                          8
                        )}
                      </span>

                      <button
                        className={`bx-cr-review-btn ${
                          isDraft
                            ? "bx-cr-review-primary"
                            : "bx-cr-review-secondary"
                        }`}
                        onClick={() =>
                          handleReview(
                            course
                          )
                        }
                      >
                        {isDraft ? (
                          <>
                            <FiEdit3
                              size={14}
                            />
                            Review
                          </>
                        ) : (
                          <>
                            <FiEye
                              size={14}
                            />
                            Manage
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </div>
              );
            }
          )
        ) : (
          <div className="col-12 text-center py-5">
            <div className="alert alert-light border d-inline-block px-5 py-4">
              <FiSearch
                size={30}
                className="text-muted mb-3"
              />

              <p className="mb-0 text-muted font-weight-bold">
                No course architecture
                matches your query.
              </p>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal.isOpen && (
          <div className="bx-cr-modal-overlay">
            <motion.div
              className="bx-cr-modal-card"
              initial={{
                scale: 0.95,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.95,
                opacity: 0,
              }}
            >
              <div className="bx-cr-modal-header text-center">
                <FiAlertCircle className="bx-cr-warning-icon" />

                <h3 className="font-weight-bold mt-3">
                  Confirm Purge
                </h3>
              </div>

              <div className="bx-cr-modal-body text-center">
                <p className="text-muted">
                  You are about to
                  permanently delete
                  <br />

                  <strong className="text-dark">
                    {
                      modal.course
                        ?.title
                    }
                  </strong>

                  <br />

                  from the system
                  database. This action
                  is final.
                </p>
              </div>

              <div className="bx-cr-modal-footer">
                <button
                  className="bx-cr-abort-btn"
                  onClick={closeModal}
                  disabled={
                    modal.processing
                  }
                >
                  Abort
                </button>

                <button
                  className="bx-cr-confirm-btn"
                  onClick={handleDelete}
                  disabled={
                    modal.processing
                  }
                >
                  {modal.processing
                    ? "Purging..."
                    : "Confirm Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminCourses;