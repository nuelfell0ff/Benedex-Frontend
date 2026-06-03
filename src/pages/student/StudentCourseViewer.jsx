import "./StudentCourseViewer.css";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/api";
import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiFileText,
  FiPlayCircle,
  FiArrowLeft,
  FiArrowRight,
} from "react-icons/fi";

function StudentCourseViewer() {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [courseRes, moduleRes] = await Promise.all([
          API.get(`/courses/${courseId}`),
          API.get(`/modules/${courseId}`),
        ]);

        setCourse(courseRes.data);
        setModules(moduleRes.data || []);

        const firstModule = moduleRes.data?.[0];
        if (firstModule) setSelectedModule(firstModule);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [courseId]);

  useEffect(() => {
    if (!selectedModule) return;

    const loadLessons = async () => {
      try {
        const res = await API.get(
          `/lessons/module/${selectedModule._id}`
        );

        setLessons(res.data || []);
        setSelectedLesson(res.data?.[0] || null);
      } catch (err) {
        console.log(err);
      }
    };

    loadLessons();
  }, [selectedModule]);

  const getEmbedUrl = (url) => {
    if (!url) return "";

    // FIX: YouTube broken embed issue
    if (url.includes("youtube.com/watch")) {
      const id = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${id}`;
    }

    if (url.includes("youtu.be")) {
      const id = url.split("/").pop();
      return `https://www.youtube.com/embed/${id}`;
    }

    return url;
  };

  const markComplete = async () => {
    if (!selectedLesson) return;

    try {
      await API.post(`/lessons/complete/${selectedLesson._id}`);
      setCompletedLessons((prev) => new Set(prev).add(selectedLesson._id));
    } catch (err) {
      console.log(err);
    }
  };

  const moduleProgress = useMemo(() => {
    if (!lessons.length) return 0;
    const done = lessons.filter((l) =>
      completedLessons.has(l._id)
    ).length;

    return Math.round((done / lessons.length) * 100);
  }, [lessons, completedLessons]);

  if (loading) {
    return (
      <div className="scv-loading">
        <div className="scv-spinner" />
        Loading course...
      </div>
    );
  }

  return (
    <div className="scv-page">
      {/* LEFT */}
      <aside className="scv-left">
        <div className="scv-left-header">
          <h2>Course Content</h2>
          <p>{course?.title}</p>
        </div>

        <div className="scv-modules">
          {modules.map((m) => (
            <div
              key={m._id}
              className={`scv-module ${
                selectedModule?._id === m._id ? "active" : ""
              }`}
              onClick={() => setSelectedModule(m)}
            >
              <div>
                <strong>{m.title}</strong>
                <span>{m.description || "Module"}</span>
              </div>

              <div className="scv-progress">
                {selectedModule?._id === m._id && (
                  <div style={{ width: `${moduleProgress}%` }} />
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* CENTER */}
      <main className="scv-center">
        {selectedLesson && (
          <motion.div
            className="scv-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* VIDEO */}
            {selectedLesson.type === "video" && (
              <div className="scv-video">
                <iframe
                  src={getEmbedUrl(selectedLesson.videoUrl)}
                  title={selectedLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* TEXT */}
            {selectedLesson.type === "text" && (
              <div className="scv-text">
                {selectedLesson.content}
              </div>
            )}

            {/* DOCUMENT */}
            {selectedLesson.type === "document" && (
              <a
                className="scv-doc"
                href={selectedLesson.documentUrl}
                target="_blank"
                rel="noreferrer"
              >
                <FiFileText /> Open Document
              </a>
            )}

            {/* TITLE */}
            <h1>{selectedLesson.title}</h1>
            <p>Lesson {selectedLesson.order}</p>

            {/* ACTIONS */}
            <div className="scv-actions">
              <button className="scv-btn secondary">
                <FiArrowLeft /> Previous
              </button>

              <button
                className="scv-btn primary"
                onClick={markComplete}
                disabled={completedLessons.has(selectedLesson._id)}
              >
                <FiCheckCircle />
                {completedLessons.has(selectedLesson._id)
                  ? "Completed"
                  : "Mark as Complete"}
              </button>

              <button className="scv-btn secondary">
                Next <FiArrowRight />
              </button>
            </div>
          </motion.div>
        )}
      </main>

      {/* RIGHT */}
      <aside className="scv-right">
        <h3>Course Progress</h3>

        <div className="scv-card">
          <span>Progress</span>
          <strong>{moduleProgress}%</strong>
          <div className="scv-bar">
            <div style={{ width: `${moduleProgress}%` }} />
          </div>
        </div>

        <div className="scv-card">
          <span>Lessons</span>
          <strong>{lessons.length}</strong>
        </div>

        <div className="scv-card">
          <span>Completed</span>
          <strong>{completedLessons.size}</strong>
        </div>
      </aside>
    </div>
  );
}

export default StudentCourseViewer;