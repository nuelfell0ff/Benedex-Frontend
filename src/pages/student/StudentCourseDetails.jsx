import "./StudentCourseDetails.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import API from "../../services/api";
import { motion } from "framer-motion";

import {
  FiArrowLeft,
  FiFileText,
  FiCheckCircle,
  FiBookOpen,
  FiPlayCircle
} from "react-icons/fi";

function StudentCourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);

  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);

  const [progress, setProgress] = useState([]);
  const [quiz, setQuiz] = useState(null);

  /* ================= COURSE ================= */

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const [courseRes, modulesRes] = await Promise.all([
          API.get(`/courses/${courseId}`),
          API.get(`/modules/${courseId}`)
        ]);

        setCourse(courseRes.data);
        setModules(modulesRes.data || []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchCourse();
  }, [courseId]);

  /* ================= MODULE DATA ================= */

  useEffect(() => {
    const fetchModuleData = async () => {
      if (!modules.length) return;

      try {
        const moduleId = modules[selectedModuleIndex]?._id;

        const [lessonRes, quizRes] = await Promise.all([
          API.get(`/lessons/module/${moduleId}`),
          API.get(`/quizzes/module/${moduleId}`).catch(() => null)
        ]);

        setLessons(lessonRes.data || []);
        setQuiz(quizRes?.data || null);

        setSelectedLessonIndex(0);
      } catch (err) {
        console.log(err);
      }
    };

    fetchModuleData();
  }, [modules, selectedModuleIndex]);

  /* ================= PROGRESS ================= */

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await API.get("/lessons/progress");
        setProgress(res.data || []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchProgress();
  }, []);

  /* ================= HELPERS ================= */

  const currentLesson = lessons[selectedLessonIndex];

  const isCompleted = (lessonId) =>
    progress.some(
      (item) =>
        item.lesson === lessonId ||
        item.lesson?._id === lessonId
    );

  const markComplete = async () => {
    if (!currentLesson) return;

    try {
      await API.post(
        `/lessons/complete/${currentLesson._id}`
      );

      const res = await API.get(
        "/lessons/progress"
      );

      setProgress(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const nextLesson = () => {
    if (
      selectedLessonIndex <
      lessons.length - 1
    ) {
      setSelectedLessonIndex(
        (prev) => prev + 1
      );
    }
  };

  const prevLesson = () => {
    if (selectedLessonIndex > 0) {
      setSelectedLessonIndex(
        (prev) => prev - 1
      );
    }
  };

  const getYoutubeEmbed = (url) => {
    if (!url) return "";

    const match =
      url.match(/watch\?v=([^&]+)/) ||
      url.match(/youtu\.be\/([^?]+)/) ||
      url.match(/embed\/([^?]+)/);

    const id = match?.[1];

    return id
      ? `https://www.youtube.com/embed/${id}`
      : url;
  };

  /* ================= LOADING ================= */

  if (!course) {
    return (
      <div className="scd-loader">
        Loading Course...
      </div>
    );
  }

  return (
    <div className="scd-page">
      <div className="scd-container">

        <button
          className="back-btn"
          onClick={() =>
            navigate("/student/courses")
          }
        >
          <FiArrowLeft />
          Back to Courses
        </button>

        <div className="course-layout">

          {/* ================= LEFT SIDE ================= */}

          <div>

            {/* VIDEO HERO */}

            <motion.div
              className="video-hero"
              initial={{
                opacity: 0,
                y: 20
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
            >
              <div className="video-wrapper">

                {currentLesson?.type ===
                  "video" &&
                  currentLesson?.videoUrl ? (
                  <iframe
                    src={getYoutubeEmbed(
                      currentLesson.videoUrl
                    )}
                    title="Lesson Video"
                    allowFullScreen
                  />
                ) : (
                  <img
                    src={
                      course.thumbnail ||
                      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
                    }
                    alt={course.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                  />
                )}

              </div>
            </motion.div>

            {/* COURSE INFO */}

            <div className="course-info">

              <h1 className="course-title">
                {course.title}
              </h1>

              <p className="course-description">
                {course.description}
              </p>

            </div>

            {/* MODULES */}

            <div className="modules-section">

              <h2 className="modules-title">
                Course Modules
              </h2>

              {modules.map((module, index) => (
                <div
                  key={module._id}
                  className="module-card"
                >
                  <div
                    className={`module-header ${selectedModuleIndex ===
                      index
                      ? "active"
                      : ""
                      }`}
                    onClick={() => {
                      setSelectedModuleIndex(
                        index
                      );
                    }}
                  >
                    <div className="module-name">
                      {module.title}
                    </div>
                  </div>

                  {selectedModuleIndex ===
                    index && (
                      <div className="lesson-list">

                        {lessons.map(
                          (
                            lesson,
                            lessonIndex
                          ) => (
                            <div
                              key={lesson._id}
                              className={`lesson-item ${selectedLessonIndex ===
                                lessonIndex
                                ? "active"
                                : ""
                                }`}
                              onClick={() =>
                                setSelectedLessonIndex(
                                  lessonIndex
                                )
                              }
                            >
                              {lesson.title}
                            </div>
                          )
                        )}

                      </div>
                    )}
                </div>
              ))}
            </div>

            {/* LESSON CONTENT */}

            {currentLesson && (
              <motion.div
                className="lesson-content"
                key={currentLesson._id}
                initial={{
                  opacity: 0
                }}
                animate={{
                  opacity: 1
                }}
              >
                <h2>
                  {currentLesson.title}
                </h2>

                {currentLesson.type ===
                  "text" && (
                    <div className="lesson-text">
                      {
                        currentLesson.content
                      }
                    </div>
                  )}

                {currentLesson.type ===
                  "document" && (
                    <a
                      href={
                        currentLesson.documentUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="document-btn"
                    >
                      <FiFileText />
                      Open Document
                    </a>
                  )}

                <div className="lesson-actions">

                  <button
                    className="prev-btn"
                    onClick={prevLesson}
                    disabled={
                      selectedLessonIndex === 0
                    }
                  >
                    Previous
                  </button>

                  <button
                    className="complete-btn"
                    onClick={markComplete}
                    disabled={isCompleted(
                      currentLesson._id
                    )}
                  >
                    {isCompleted(
                      currentLesson._id
                    )
                      ? "Completed"
                      : "Mark Complete"}
                  </button>

                  <button
                    className="next-btn"
                    onClick={nextLesson}
                    disabled={
                      selectedLessonIndex ===
                      lessons.length - 1
                    }
                  >
                    Next
                  </button>

                </div>

                {/* QUIZ */}

                {selectedLessonIndex ===
                  lessons.length - 1 &&
                  quiz && (
                    <div className="quiz-box">

                      <h3>
                        Module Quiz
                      </h3>

                      <p>
                        You have completed
                        this module.
                        Take the quiz to
                        continue.
                      </p>

                      <Link
                        to={`/student/quiz/${modules[selectedModuleIndex]._id}`}
                      >
                        Take Quiz
                      </Link>

                    </div>
                  )}
              </motion.div>
            )}
          </div>

          {/* ================= RIGHT SIDEBAR ================= */}

          <aside className="course-sidebar">

            <div className="sidebar-card">

              <h3>
                Course Progress
              </h3>

              <div className="progress-value">
                {progress.length}
              </div>

              <p>
                Lessons Completed
              </p>

            </div>

            <div className="sidebar-card">

              <h3>
                Course Details
              </h3>

              <ul className="sidebar-list">

                <li>
                  <FiBookOpen />
                  {" "}
                  {modules.length}
                  {" "}
                  Modules
                </li>

                <li>
                  <FiPlayCircle />
                  {" "}
                  {lessons.length}
                  {" "}
                  Lessons
                </li>

                <li>
                  <FiCheckCircle />
                  {" "}
                  Student Access
                </li>

              </ul>

            </div>

          </aside>

        </div>
      </div>
    </div>
  );
}

export default StudentCourseDetails;