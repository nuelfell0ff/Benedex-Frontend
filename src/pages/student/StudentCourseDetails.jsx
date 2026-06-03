import "./StudentCourseDetails.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import API from "../../services/api";
import { motion } from "framer-motion";
import { FiArrowLeft, FiFileText } from "react-icons/fi";

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
  const [loading, setLoading] = useState(true);

  /* ---------------- COURSE + MODULES ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, modulesRes] = await Promise.all([
          API.get(`/courses/${courseId}`),
          API.get(`/modules/${courseId}`),
        ]);

        setCourse(courseRes.data);
        setModules(modulesRes.data || []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, [courseId]);

  /* ---------------- LESSONS + QUIZ ---------------- */
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

        const lessonData = lessonRes.data || [];

        setLessons(lessonData);
        setQuiz(quizRes?.data || null);

        setSelectedLessonIndex(0);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchModuleData();
  }, [selectedModuleIndex, modules]);

  /* ---------------- PROGRESS ---------------- */
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

  /* ---------------- HELPERS ---------------- */
  const currentLesson = lessons[selectedLessonIndex];

  const isCompleted = (lessonId) =>
    progress.some((p) => p.lesson === lessonId);

  const markComplete = async () => {
    if (!currentLesson) return;

    try {
      await API.post(`/lessons/complete/${currentLesson._id}`);

      const res = await API.get(`/lessons/progress`);
      setProgress(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const nextLesson = () => {
    if (selectedLessonIndex < lessons.length - 1) {
      setSelectedLessonIndex((i) => i + 1);
    }
  };

  const prevLesson = () => {
    if (selectedLessonIndex > 0) {
      setSelectedLessonIndex((i) => i - 1);
    }
  };

  const getYoutubeEmbed = (url) => {
    if (!url) return "";

    const match =
      url.match(/watch\?v=([^&]+)/) ||
      url.match(/youtu\.be\/([^?]+)/) ||
      url.match(/embed\/([^?]+)/);

    const id = match?.[1];
    return id ? `https://www.youtube.com/embed/${id}` : url;
  };

  /* ---------------- LOADING ---------------- */
  if (!course) {
    return (
      <div className="scd-loader">
        <div className="spinner" />
        Loading course...
      </div>
    );
  }

  return (
    <div className="scd-page">

      {/* TOP BAR */}
      <div className="scd-topbar">
        <button onClick={() => navigate("/student/courses")} className="back-btn">
          <FiArrowLeft /> Back to Courses
        </button>

        <h1>{course.title}</h1>
      </div>

      <div className="scd-layout">

        {/* MODULES */}
        <aside className="scd-sidebar">
          {modules.map((m, i) => (
            <div
              key={m._id}
              className={`module ${i === selectedModuleIndex ? "active" : ""}`}
              onClick={() => setSelectedModuleIndex(i)}
            >
              <strong>{m.title}</strong>
              <span>{lessons.length} lessons</span>
            </div>
          ))}
        </aside>

        {/* MAIN CONTENT */}
        <main className="scd-main">

          {currentLesson && (
            <motion.div
              key={currentLesson._id}
              className="lesson-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >

              {/* VIDEO / CONTENT */}
              <div className="lesson-media">

                {currentLesson.type === "video" && currentLesson.videoUrl && (
                  <iframe
                    src={getYoutubeEmbed(currentLesson.videoUrl)}
                    title="lesson"
                    allowFullScreen
                  />
                )}

                {currentLesson.type === "text" && (
                  <div className="text-content">
                    {currentLesson.content}
                  </div>
                )}

                {currentLesson.type === "document" && (
                  <a href={currentLesson.documentUrl} target="_blank" rel="noreferrer">
                    <FiFileText /> Open Document
                  </a>
                )}

              </div>

              <h2>{currentLesson.title}</h2>

              {/* NAVIGATION */}
              <div className="lesson-actions">

                <button onClick={prevLesson} disabled={selectedLessonIndex === 0}>
                  Prev
                </button>

                <button
                  onClick={markComplete}
                  disabled={isCompleted(currentLesson._id)}
                  className="complete"
                >
                  {isCompleted(currentLesson._id) ? "Completed" : "Mark Complete"}
                </button>

                <button
                  onClick={nextLesson}
                  disabled={selectedLessonIndex === lessons.length - 1}
                >
                  Next
                </button>

              </div>

              {/* QUIZ */}
              {selectedLessonIndex === lessons.length - 1 && quiz && (
                <div className="quiz-box">
                  <h3>Module Quiz</h3>
                  <p>{quiz.title}</p>

                  <Link to={`/student/quiz/${quiz._id}`} className="quiz-btn">
                    Take Quiz
                  </Link>
                </div>
              )}

            </motion.div>
          )}

        </main>

        {/* RIGHT PANEL */}
        <aside className="scd-progress">
          <h3>Progress</h3>

          <div className="progress-box">
            Completed Lessons: {progress.length}
          </div>

        </aside>

      </div>
    </div>
  );
}

export default StudentCourseDetails;