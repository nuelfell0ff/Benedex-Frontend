import React from 'react'
import "./StudentsCourseDetails.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import API from "../../services/api";
import { motion } from "framer-motion";

import {
  FiArrowLeft,
  FiFileText,
  FiCheckCircle,
  FiBookOpen,
  FiPlayCircle,
  FiArrowDownRight,
  FiLock
} from "react-icons/fi";
import { TbFileArrowLeft, TbFileArrowRight } from 'react-icons/tb';
import { BsArrowLeft, BsArrowRight } from 'react-icons/bs';

const StudentsCourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [totalLessons, setTotalLessons] = useState(0);

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

        // Current module lessons + quiz
        const [lessonRes, quizRes] = await Promise.all([
          API.get(`/lessons/module/${moduleId}`),
          API.get(`/quizzes/module/${moduleId}`).catch(() => null),
        ]);

        setLessons(lessonRes.data || []);
        setQuiz(quizRes?.data || null);
        setSelectedLessonIndex(0);

        // TOTAL LESSONS IN COURSE
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

  useEffect(() => {

    console.log(
      "CURRENT PROGRESS:"
    );

    console.log(progress);

  }, [progress]);

  /* ---------------- HELPERS ---------------- */
  const currentLesson = lessons[selectedLessonIndex];

  const isCompleted = (lessonId) => {

    return progress.some((p) => {

      const progressLessonId =
        p.lesson?._id ||
        p.lesson;

      return (
        String(progressLessonId) ===
        String(lessonId)
      );

    });

  };

  const isLessonLocked = (lessonIndex) => {

    // First lesson is always unlocked
    if (lessonIndex === 0) return false;

    const previousLesson =
      lessons[lessonIndex - 1];

    return !isCompleted(
      previousLesson._id
    );

  };

  const markComplete = async () => {

    if (!currentLesson) return;

    try {

      const response = await API.post(
        `/lessons/complete/${currentLesson._id}`
      );

      console.log(
        "Lesson completed:",
        response.data
      );

      const progressRes =
        await API.get(
          "/lessons/progress"
        );

      setProgress(
        progressRes.data || []
      );

    } catch (err) {

      console.log(
        "MARK COMPLETE ERROR"
      );

      console.log(
        err.response?.data
      );

      // LESSON ALREADY COMPLETED
      if (
        err.response?.status === 400 &&
        err.response?.data?.message ===
        "Lesson already completed"
      ) {

        console.log(
          "Refreshing progress..."
        );

        const progressRes =
          await API.get(
            "/lessons/progress"
          );

        setProgress(
          progressRes.data || []
        );
      }
    }
  };

  const nextLesson = () => {

    if (!currentLesson) return;

    const completed =
      isCompleted(
        currentLesson._id
      );

    if (!completed) {

      alert(
        "Mark this lesson as complete first."
      );

      return;
    }

    if (
      selectedLessonIndex <
      lessons.length - 1
    ) {

      setSelectedLessonIndex(
        prev => prev + 1
      );

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
    <div className='scd-page container-fluid'>
      <div className="scd-layout">
        {/* main contenr */}
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

                {/* {currentLesson.type === "text" && (
                  <div className="lesson-reader">
                    <div className="reader-header">
                      <span className="reader-badge">Lesson</span>
                      <h1>{currentLesson.title}</h1>
                    </div>

                    <div className="text-content">
                      {currentLesson.content}
                    </div>
                  </div>
                )} */}

                {currentLesson.type === "text" && (
                  <div className="text-content">
                    <div className="reader-header">
                      <span className="reader-badge">Lesson</span>
                    </div>
                    <pre className="lesson-reader">
                      {currentLesson.content}
                    </pre>
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
              <div className="lesson-actions d-flex justify-content-center align-items-center p">

                <button onClick={prevLesson} disabled={selectedLessonIndex === 0}>
                  <BsArrowLeft />
                  Prev
                </button>

                <button
                  onClick={markComplete}
                  disabled={isCompleted(currentLesson._id)}
                  className="complete"
                >
                  {isCompleted(currentLesson._id)
                    ? "Completed ✓"
                    : "Mark Complete"}
                </button>

                <button
                  onClick={nextLesson}
                  disabled={selectedLessonIndex === lessons.length - 1}
                >
                  Next
                  <BsArrowRight />
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

        <div>
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
                {totalLessons}
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

          {/* MODULES SIDEBAR */}
          <aside className="scd-sidebar">

            <div className="accordion">

              {modules.map((module, moduleIndex) => {

                const isOpen =
                  moduleIndex === selectedModuleIndex;

                return (

                  <div
                    key={module._id}
                    className="accordion-item"
                  >

                    {/* MODULE HEADER */}
                    <button
                      className={`accordion-button ${!isOpen ? "collapsed" : ""
                        }`}
                      onClick={() => {
                        setSelectedModuleIndex(
                          moduleIndex
                        );
                        setSelectedLessonIndex(0);
                      }}
                    >

                      <div className="accordion-title">

                        <strong>
                          {module.title}
                        </strong>

                        <span>
                          Module {moduleIndex + 1}
                        </span>

                      </div>

                    </button>

                    {/* MODULE CONTENT */}
                    <div
                      className={`accordion-collapse ${isOpen ? "show" : ""
                        }`}
                    >

                      <div className="accordion-body">

                        {isOpen &&
                          lessons.map(
                            (
                              lesson,
                              lessonIndex
                            ) => {

                              const completed =
                                isCompleted(
                                  lesson._id
                                );

                              const locked =
                                isLessonLocked(
                                  lessonIndex
                                );

                              const active =
                                selectedLessonIndex ===
                                lessonIndex;

                              return (

                                <div
                                  key={lesson._id}
                                  className={`lesson-item
                          ${active
                                      ? "active"
                                      : ""
                                    }
                          ${locked
                                      ? "locked"
                                      : ""
                                    }
                        `}
                                  onClick={() => {

                                    if (locked)
                                      return;

                                    setSelectedLessonIndex(
                                      lessonIndex
                                    );

                                  }}
                                >

                                  {/* STATUS ICON */}
                                  <div className="lesson-icon">

                                    {completed ? (

                                      <FiCheckCircle className="lesson-completed" />

                                    ) : active ? (

                                      <FiPlayCircle className="lesson-current" />

                                    ) : locked ? (

                                      <FiLock className="lesson-locked" />

                                    ) : (

                                      <div className="lesson-dot" />

                                    )}

                                  </div>

                                  {/* LESSON TITLE */}
                                  <span className="lesson-title">
                                    {lesson.title}
                                  </span>

                                </div>

                              );
                            }
                          )}

                      </div>

                    </div>

                  </div>

                );
              })}

            </div>

          </aside>

          {/* RIGHT PANEL */}
          <aside className="scd-progress">
            <h3>Progress</h3>

            <div className="progress-box">
              Completed Lessons: {progress.length}
            </div>

          </aside>
        </div>
      </div>
    </div>
  )
}

export default StudentsCourseDetails