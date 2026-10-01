import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";

import {
  FiArrowLeft,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiFileText,
  FiLayers,
  FiChevronDown,
  FiChevronRight,
  FiSave,
  FiSend,
  FiX,
  FiVideo,
  FiFile,
  FiHelpCircle,
  FiAlertCircle,
  FiTool,
  FiDollarSign,
  FiCalendar,
  FiImage,
  FiLoader,
  FiPlus,
  FiTrash2,
  FiCheck,
} from "react-icons/fi";

import "./AdminCourseReview.css";

function AdminCourseReview() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [expandedModules, setExpandedModules] = useState({});
  const [expandedLessons, setExpandedLessons] = useState({});
  const [expandedQuizzes, setExpandedQuizzes] = useState({});

  const [editing, setEditing] = useState({
    type: null,
    data: null,
  });

  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishModal, setPublishModal] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const fetchCourseStructure = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get(
        `/courses/admin/${courseId}/structure`
      );

      setCourseData(res.data);
    } catch (error) {
      console.error(
        "Course review load failure:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load course architecture."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseStructure();
  }, [courseId]);

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const toggleLesson = (lessonId) => {
    setExpandedLessons((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }));
  };

  const toggleQuiz = (quizId) => {
    setExpandedQuizzes((prev) => ({
      ...prev,
      [quizId]: !prev[quizId],
    }));
  };

  const openEditor = (type, data) => {
    setMessage({
      type: "",
      text: "",
    });

    let editorData = {
      ...data,
    };

    if (type === "quiz") {
      editorData = {
        ...data,
        passMark: data.passMark ?? 70,
        description: data.description || "",
        questions: Array.isArray(data.questions)
          ? data.questions.map((question) => ({
              ...question,
              question: question.question || "",
              correctAnswer:
                question.correctAnswer || "",
              options:
                Array.isArray(question.options) &&
                question.options.length === 4
                  ? [...question.options]
                  : ["", "", "", ""],
            }))
          : [],
      };
    }

    setEditing({
      type,
      data: editorData,
    });
  };

  const closeEditor = () => {
    if (saving) return;

    setEditing({
      type: null,
      data: null,
    });
  };

  const handleEditorChange = (field, value) => {
    setEditing((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value,
      },
    }));
  };

  const handleQuizQuestionChange = (
    questionIndex,
    field,
    value
  ) => {
    setEditing((prev) => {
      const questions = [
        ...(prev.data.questions || []),
      ];

      questions[questionIndex] = {
        ...questions[questionIndex],
        [field]: value,
      };

      return {
        ...prev,
        data: {
          ...prev.data,
          questions,
        },
      };
    });
  };

  const handleQuizOptionChange = (
    questionIndex,
    optionIndex,
    value
  ) => {
    setEditing((prev) => {
      const questions = [
        ...(prev.data.questions || []),
      ];

      const currentQuestion = {
        ...questions[questionIndex],
      };

      const previousOption =
        currentQuestion.options?.[optionIndex];

      const options = [
        ...(currentQuestion.options || [
          "",
          "",
          "",
          "",
        ]),
      ];

      options[optionIndex] = value;

      currentQuestion.options = options;

      if (
        currentQuestion.correctAnswer ===
        previousOption
      ) {
        currentQuestion.correctAnswer = value;
      }

      questions[questionIndex] =
        currentQuestion;

      return {
        ...prev,
        data: {
          ...prev.data,
          questions,
        },
      };
    });
  };

  const addQuizQuestion = () => {
    setEditing((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        questions: [
          ...(prev.data.questions || []),
          {
            question: "",
            options: ["", "", "", ""],
            correctAnswer: "",
          },
        ],
      },
    }));
  };

  const removeQuizQuestion = (questionIndex) => {
    setEditing((prev) => {
      const questions = [
        ...(prev.data.questions || []),
      ];

      if (questions.length <= 1) {
        return prev;
      }

      questions.splice(questionIndex, 1);

      return {
        ...prev,
        data: {
          ...prev.data,
          questions,
        },
      };
    });
  };

  const saveCourse = async () => {
    try {
      setSaving(true);

      const course = editing.data;

      const res = await API.put(
        `/courses/admin/${courseId}`,
        {
          title: course.title,
          description: course.description,
          price: Number(course.price),
          duration: course.duration,
          tools:
            typeof course.tools === "string"
              ? course.tools
                  .split(",")
                  .map((tool) => tool.trim())
                  .filter(Boolean)
              : course.tools,
          image: course.image,
        }
      );

      setCourseData((prev) => ({
        ...prev,
        course: res.data.course,
      }));

      setMessage({
        type: "success",
        text: "Course information saved successfully.",
      });

      closeEditor();
    } catch (error) {
      console.error(
        "Course update failure:",
        error
      );

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to save course information.",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveModule = async () => {
    try {
      setSaving(true);

      const module = editing.data;

      const res = await API.put(
        `/modules/admin/${module._id}`,
        {
          title: module.title,
          description: module.description,
          month: Number(module.month),
          order: Number(module.order),
        }
      );

      setCourseData((prev) => ({
        ...prev,
        modules: prev.modules.map((item) =>
          item._id === module._id
            ? {
                ...item,
                ...res.data.module,
              }
            : item
        ),
      }));

      setMessage({
        type: "success",
        text: "Module updated successfully.",
      });

      closeEditor();
    } catch (error) {
      console.error(
        "Module update failure:",
        error
      );

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to save module.",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveLesson = async () => {
    try {
      setSaving(true);

      const lesson = editing.data;

      const res = await API.put(
        `/lessons/admin/${lesson._id}`,
        {
          title: lesson.title,
          type: lesson.type,
          content: lesson.content,
          videoUrl: lesson.videoUrl,
          documentUrl: lesson.documentUrl,
          illustrationUrl:
            lesson.illustrationUrl,
          photographerName:
            lesson.photographerName,
          photographerUrl:
            lesson.photographerUrl,
          order: Number(lesson.order),
          isPreview: Boolean(
            lesson.isPreview
          ),
        }
      );

      setCourseData((prev) => ({
        ...prev,
        modules: prev.modules.map(
          (module) => ({
            ...module,
            lessons:
              module.lessons?.map(
                (item) =>
                  item._id === lesson._id
                    ? {
                        ...item,
                        ...res.data.lesson,
                      }
                    : item
              ),
          })
        ),
      }));

      setMessage({
        type: "success",
        text: "Lesson updated successfully.",
      });

      closeEditor();
    } catch (error) {
      console.error(
        "Lesson update failure:",
        error
      );

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to save lesson.",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveQuiz = async () => {
    try {
      setSaving(true);

      const quiz = editing.data;

      if (
        !quiz.title ||
        !quiz.title.trim()
      ) {
        setMessage({
          type: "error",
          text: "Quiz title is required.",
        });

        setSaving(false);
        return;
      }

      if (
        !Array.isArray(quiz.questions) ||
        quiz.questions.length === 0
      ) {
        setMessage({
          type: "error",
          text:
            "The quiz must contain at least one question.",
        });

        setSaving(false);
        return;
      }

      const cleanedQuestions = [];

      for (
        let index = 0;
        index < quiz.questions.length;
        index++
      ) {
        const question =
          quiz.questions[index];

        if (
          !question.question ||
          !question.question.trim()
        ) {
          setMessage({
            type: "error",
            text: `Question ${
              index + 1
            } cannot be empty.`,
          });

          setSaving(false);
          return;
        }

        if (
          !Array.isArray(
            question.options
          ) ||
          question.options.length !== 4
        ) {
          setMessage({
            type: "error",
            text: `Question ${
              index + 1
            } must have exactly 4 options.`,
          });

          setSaving(false);
          return;
        }

        const cleanedOptions =
          question.options.map(
            (option) =>
              String(option).trim()
          );

        if (
          cleanedOptions.some(
            (option) => !option
          )
        ) {
          setMessage({
            type: "error",
            text: `All options for question ${
              index + 1
            } must be filled.`,
          });

          setSaving(false);
          return;
        }

        if (
          new Set(cleanedOptions).size !==
          4
        ) {
          setMessage({
            type: "error",
            text: `Question ${
              index + 1
            } must have four different options.`,
          });

          setSaving(false);
          return;
        }

        const correctAnswer =
          String(
            question.correctAnswer || ""
          ).trim();

        if (
          !correctAnswer ||
          !cleanedOptions.includes(
            correctAnswer
          )
        ) {
          setMessage({
            type: "error",
            text: `Select a correct answer for question ${
              index + 1
            }.`,
          });

          setSaving(false);
          return;
        }

        cleanedQuestions.push({
          question:
            question.question.trim(),
          options: cleanedOptions,
          correctAnswer,
        });
      }

      const passMark = Number(
        quiz.passMark
      );

      if (
        Number.isNaN(passMark) ||
        passMark < 0 ||
        passMark > 100
      ) {
        setMessage({
          type: "error",
          text:
            "Pass mark must be between 0 and 100.",
        });

        setSaving(false);
        return;
      }

      const payload = {
        title: quiz.title.trim(),
        description:
          quiz.description || "",
        passMark,
        questions: cleanedQuestions,
      };

      const res = await API.put(
        `/quizzes/admin/${quiz._id}`,
        payload
      );

      setCourseData((prev) => ({
        ...prev,
        modules: prev.modules.map(
          (module) =>
            module.quiz?._id === quiz._id
              ? {
                  ...module,
                  quiz: res.data.quiz,
                }
              : module
        ),
      }));

      setMessage({
        type: "success",
        text: "Quiz updated successfully.",
      });

      closeEditor();
    } catch (error) {
      console.error(
        "Quiz update failure:",
        error
      );

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to save quiz.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!editing.data) return;

    if (editing.type === "course") {
      await saveCourse();
      return;
    }

    if (editing.type === "module") {
      await saveModule();
      return;
    }

    if (editing.type === "lesson") {
      await saveLesson();
      return;
    }

    if (editing.type === "quiz") {
      await saveQuiz();
    }
  };

  const handlePublish = async () => {
    try {
      setPublishing(true);

      const res = await API.patch(
        `/courses/admin/${courseId}/publish`
      );

      setCourseData((prev) => ({
        ...prev,
        course: {
          ...prev.course,
          status:
            res.data.course?.status ||
            "published",
        },
      }));

      setPublishModal(false);

      setMessage({
        type: "success",
        text: "Course published successfully.",
      });
    } catch (error) {
      console.error(
        "Course publishing failure:",
        error
      );

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to publish course.",
      });
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="acr-loading-pane">
        <div className="acr-spinner"></div>

        <p>
          Loading course architecture...
        </p>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="acr-error-pane">
        <div className="acr-error-card">
          <FiAlertCircle size={40} />

          <h3>
            Unable to load course
          </h3>

          <p>
            {error ||
              "The requested course could not be found."}
          </p>

          <button
            className="acr-back-btn"
            onClick={() =>
              navigate(
                "/admin/courses"
              )
            }
          >
            <FiArrowLeft />
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const {
    course,
    modules = [],
  } = courseData;

  const isDraft =
    course.status === "draft";

  const lessonCount =
    modules.reduce(
      (total, module) =>
        total +
        (module.lessons?.length || 0),
      0
    );

  const quizCount =
    modules.filter(
      (module) =>
        Boolean(module.quiz)
    ).length;

  const questionCount =
    modules.reduce(
      (total, module) =>
        total +
        (module.quiz?.questions
          ?.length || 0),
      0
    );

  return (
    <div className="acr-workspace">
      <div className="acr-container">
        <div className="acr-topbar">
          <button
            className="acr-back-link"
            onClick={() =>
              navigate(
                "/admin/courses"
              )
            }
          >
            <FiArrowLeft />
            Back to Courses
          </button>

          <div className="acr-topbar-actions">
            {isDraft ? (
              <button
                className="acr-publish-btn"
                onClick={() =>
                  setPublishModal(true)
                }
                disabled={publishing}
              >
                <FiSend />
                Publish Course
              </button>
            ) : (
              <div className="acr-published-label">
                <FiCheckCircle />
                Course Published
              </div>
            )}
          </div>
        </div>

        {message.text && (
          <motion.div
            className={`acr-alert ${
              message.type === "error"
                ? "acr-alert-error"
                : "acr-alert-success"
            }`}
            initial={{
              opacity: 0,
              y: -8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
          >
            {message.type ===
            "error" ? (
              <FiAlertCircle />
            ) : (
              <FiCheckCircle />
            )}

            <span>
              {message.text}
            </span>

            <button
              onClick={() =>
                setMessage({
                  type: "",
                  text: "",
                })
              }
            >
              <FiX />
            </button>
          </motion.div>
        )}

        <section className="acr-course-hero">
          <div className="acr-course-hero-main">
            <div className="acr-course-icon">
              <FiBookOpen size={28} />
            </div>

            <div className="acr-course-heading">
              <div className="acr-course-status-row">
                <span
                  className={`acr-status ${
                    isDraft
                      ? "acr-status-draft"
                      : "acr-status-published"
                  }`}
                >
                  {isDraft ? (
                    <>
                      <FiClock />
                      Draft
                    </>
                  ) : (
                    <>
                      <FiCheckCircle />
                      Published
                    </>
                  )}
                </span>

                {course.createdByAI && (
                  <span className="acr-ai-badge">
                    <FiEdit3 />
                    AI Generated
                  </span>
                )}
              </div>

              <h1>
                {course.title}
              </h1>

              <p>
                {course.description}
              </p>
            </div>
          </div>

          <button
            className="acr-edit-course-btn"
            onClick={() =>
              openEditor(
                "course",
                {
                  ...course,
                  tools:
                    Array.isArray(
                      course.tools
                    )
                      ? course.tools.join(
                          ", "
                        )
                      : course.tools || "",
                }
              )
            }
          >
            <FiEdit3 />
            Edit Course
          </button>
        </section>

        <section className="acr-stat-grid">
          <div className="acr-stat-card">
            <div className="acr-stat-icon">
              <FiLayers />
            </div>

            <div>
              <span>
                Modules
              </span>

              <strong>
                {modules.length}
              </strong>
            </div>
          </div>

          <div className="acr-stat-card">
            <div className="acr-stat-icon">
              <FiFileText />
            </div>

            <div>
              <span>
                Lessons
              </span>

              <strong>
                {lessonCount}
              </strong>
            </div>
          </div>

          <div className="acr-stat-card">
            <div className="acr-stat-icon">
              <FiHelpCircle />
            </div>

            <div>
              <span>
                Quizzes
              </span>

              <strong>
                {quizCount}
              </strong>
            </div>
          </div>

          <div className="acr-stat-card">
            <div className="acr-stat-icon">
              <FiDollarSign />
            </div>

            <div>
              <span>
                Course Price
              </span>

              <strong>
                ₦
                {Number(
                  course.price || 0
                ).toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="acr-stat-card">
            <div className="acr-stat-icon">
              <FiCalendar />
            </div>

            <div>
              <span>
                Duration
              </span>

              <strong>
                {course.duration ||
                  "Not specified"}
              </strong>
            </div>
          </div>
        </section>

        <section className="acr-content-layout">
          <main className="acr-main-content">
            <div className="acr-section-heading">
              <div>
                <span className="acr-section-eyebrow">
                  Curriculum
                </span>

                <h2>
                  Course Structure
                </h2>
              </div>

              <span className="acr-module-count">
                {modules.length}{" "}
                {modules.length === 1
                  ? "Module"
                  : "Modules"}
              </span>
            </div>

            <div className="acr-module-list">
              {modules.length === 0 ? (
                <div className="acr-empty-state">
                  <FiLayers
                    size={32}
                  />

                  <h3>
                    No modules yet
                  </h3>

                  <p>
                    This course does
                    not have any
                    modules.
                  </p>
                </div>
              ) : (
                modules.map(
                  (
                    module,
                    moduleIndex
                  ) => {
                    const isOpen =
                      expandedModules[
                        module._id
                      ];

                    const lessons =
                      module.lessons ||
                      [];

                    const quiz =
                      module.quiz ||
                      null;

                    const quizOpen =
                      quiz
                        ? expandedQuizzes[
                            quiz._id
                          ]
                        : false;

                    return (
                      <motion.div
                        className={`acr-module ${
                          isOpen
                            ? "acr-module-open"
                            : ""
                        }`}
                        key={
                          module._id
                        }
                        layout
                      >
                        <div
                          className="acr-module-header"
                          onClick={() =>
                            toggleModule(
                              module._id
                            )
                          }
                        >
                          <div className="acr-module-number">
                            {String(
                              moduleIndex +
                                1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </div>

                          <div className="acr-module-main">
                            <div className="acr-module-meta">
                              <span>
                                Module{" "}
                                {moduleIndex +
                                  1}
                              </span>

                              <span>
                                {
                                  lessons.length
                                }{" "}
                                {lessons.length ===
                                1
                                  ? "Lesson"
                                  : "Lessons"}
                              </span>

                              {quiz && (
                                <span>
                                  <FiHelpCircle
                                    size={
                                      13
                                    }
                                  />
                                  Quiz
                                </span>
                              )}
                            </div>

                            <h3>
                              {
                                module.title
                              }
                            </h3>

                            {module.description && (
                              <p>
                                {
                                  module.description
                                }
                              </p>
                            )}
                          </div>

                          <div className="acr-module-actions">
                            <button
                              className="acr-icon-btn"
                              title="Edit module"
                              onClick={(
                                e
                              ) => {
                                e.stopPropagation();

                                openEditor(
                                  "module",
                                  module
                                );
                              }}
                            >
                              <FiEdit3 />
                            </button>

                            <button
                              className="acr-chevron-btn"
                              onClick={(
                                e
                              ) => {
                                e.stopPropagation();

                                toggleModule(
                                  module._id
                                );
                              }}
                            >
                              {isOpen ? (
                                <FiChevronDown />
                              ) : (
                                <FiChevronRight />
                              )}
                            </button>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              className="acr-module-content"
                              initial={{
                                height: 0,
                                opacity: 0,
                              }}
                              animate={{
                                height:
                                  "auto",
                                opacity: 1,
                              }}
                              exit={{
                                height: 0,
                                opacity: 0,
                              }}
                            >
                              <div className="acr-module-description">
                                <span>
                                  Module
                                  Description
                                </span>

                                <p>
                                  {module.description ||
                                    "No module description provided."}
                                </p>
                              </div>

                              <div className="acr-lessons-heading">
                                <div>
                                  <FiFileText />

                                  <span>
                                    Lessons
                                  </span>
                                </div>

                                <span>
                                  {
                                    lessons.length
                                  }
                                </span>
                              </div>

                              <div className="acr-lesson-list">
                                {lessons.length >
                                0 ? (
                                  lessons.map(
                                    (
                                      lesson,
                                      lessonIndex
                                    ) => {
                                      const lessonOpen =
                                        expandedLessons[
                                          lesson
                                            ._id
                                        ];

                                      return (
                                        <div
                                          className={`acr-lesson ${
                                            lessonOpen
                                              ? "acr-lesson-open"
                                              : ""
                                          }`}
                                          key={
                                            lesson._id
                                          }
                                        >
                                          <div
                                            className="acr-lesson-header"
                                            onClick={() =>
                                              toggleLesson(
                                                lesson._id
                                              )
                                            }
                                          >
                                            <div className="acr-lesson-index">
                                              {lessonIndex +
                                                1}
                                            </div>

                                            <div className="acr-lesson-info">
                                              <h4>
                                                {
                                                  lesson.title
                                                }
                                              </h4>

                                              <div className="acr-lesson-tags">
                                                <span>
                                                  {lesson.type ===
                                                  "video" ? (
                                                    <FiVideo />
                                                  ) : lesson.type ===
                                                    "document" ? (
                                                    <FiFile />
                                                  ) : (
                                                    <FiFileText />
                                                  )}

                                                  {
                                                    lesson.type
                                                  }
                                                </span>

                                                {lesson.isPreview && (
                                                  <span className="acr-preview-tag">
                                                    Preview
                                                  </span>
                                                )}
                                              </div>
                                            </div>

                                            <div className="acr-lesson-actions">
                                              <button
                                                className="acr-icon-btn"
                                                title="Edit lesson"
                                                onClick={(
                                                  e
                                                ) => {
                                                  e.stopPropagation();

                                                  openEditor(
                                                    "lesson",
                                                    lesson
                                                  );
                                                }}
                                              >
                                                <FiEdit3 />
                                              </button>

                                              <button
                                                className="acr-chevron-btn"
                                                onClick={(
                                                  e
                                                ) => {
                                                  e.stopPropagation();

                                                  toggleLesson(
                                                    lesson._id
                                                  );
                                                }}
                                              >
                                                {lessonOpen ? (
                                                  <FiChevronDown />
                                                ) : (
                                                  <FiChevronRight />
                                                )}
                                              </button>
                                            </div>
                                          </div>

                                          <AnimatePresence>
                                            {lessonOpen && (
                                              <motion.div
                                                className="acr-lesson-content"
                                                initial={{
                                                  height: 0,
                                                  opacity: 0,
                                                }}
                                                animate={{
                                                  height:
                                                    "auto",
                                                  opacity: 1,
                                                }}
                                                exit={{
                                                  height: 0,
                                                  opacity: 0,
                                                }}
                                              >
                                                <div className="acr-lesson-preview">
                                                  <div className="acr-lesson-preview-heading">
                                                    <span>
                                                      Lesson Content
                                                    </span>

                                                    <button
                                                      onClick={() =>
                                                        openEditor(
                                                          "lesson",
                                                          lesson
                                                        )
                                                      }
                                                    >
                                                      <FiEdit3 />
                                                      Edit
                                                    </button>
                                                  </div>

                                                  {lesson.illustrationUrl && (
                                                    <img
                                                      src={
                                                        lesson.illustrationUrl
                                                      }
                                                      alt={
                                                        lesson.title
                                                      }
                                                      className="acr-lesson-image"
                                                    />
                                                  )}

                                                  <div className="acr-content-preview">
                                                    {lesson.content ? (
                                                      lesson.content
                                                        .split(
                                                          "\n"
                                                        )
                                                        .slice(
                                                          0,
                                                          8
                                                        )
                                                        .map(
                                                          (
                                                            line,
                                                            index
                                                          ) => (
                                                            <p
                                                              key={
                                                                index
                                                              }
                                                            >
                                                              {
                                                                line
                                                              }
                                                            </p>
                                                          )
                                                        )
                                                    ) : (
                                                      <p className="acr-no-content">
                                                        No lesson
                                                        content
                                                        available.
                                                      </p>
                                                    )}
                                                  </div>
                                                </div>
                                              </motion.div>
                                            )}
                                          </AnimatePresence>
                                        </div>
                                      );
                                    }
                                  )
                                ) : (
                                  <div className="acr-no-lessons">
                                    <FiFileText />

                                    <span>
                                      No lessons
                                      have been
                                      added to
                                      this module.
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div
                                className={`acr-quiz-section ${
                                  quizOpen
                                    ? "acr-quiz-section-open"
                                    : ""
                                }`}
                              >
                                <div
                                  className="acr-quiz-header"
                                  onClick={() =>
                                    quiz &&
                                    toggleQuiz(
                                      quiz._id
                                    )
                                  }
                                >
                                  <div className="acr-quiz-icon">
                                    <FiHelpCircle />
                                  </div>

                                  <div className="acr-quiz-info">
                                    <span>
                                      Module Assessment
                                    </span>

                                    <strong>
                                      {quiz
                                        ? quiz.title
                                        : "No quiz generated"}
                                    </strong>

                                    {quiz && (
                                      <div className="acr-quiz-meta">
                                        <span>
                                          {
                                            quiz
                                              .questions
                                              ?.length ||
                                            0
                                          }{" "}
                                          Questions
                                        </span>

                                        <span>
                                          Pass Mark:{" "}
                                          {quiz.passMark ??
                                            70}
                                          %
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {quiz && (
                                    <div className="acr-quiz-actions">
                                      <button
                                        className="acr-icon-btn"
                                        title="Edit quiz"
                                        onClick={(
                                          e
                                        ) => {
                                          e.stopPropagation();

                                          openEditor(
                                            "quiz",
                                            quiz
                                          );
                                        }}
                                      >
                                        <FiEdit3 />
                                      </button>

                                      <button
                                        className="acr-chevron-btn"
                                        onClick={(
                                          e
                                        ) => {
                                          e.stopPropagation();

                                          toggleQuiz(
                                            quiz._id
                                          );
                                        }}
                                      >
                                        {quizOpen ? (
                                          <FiChevronDown />
                                        ) : (
                                          <FiChevronRight />
                                        )}
                                      </button>
                                    </div>
                                  )}
                                </div>

                                <AnimatePresence>
                                  {quiz &&
                                    quizOpen && (
                                      <motion.div
                                        className="acr-quiz-content"
                                        initial={{
                                          height: 0,
                                          opacity: 0,
                                        }}
                                        animate={{
                                          height:
                                            "auto",
                                          opacity: 1,
                                        }}
                                        exit={{
                                          height: 0,
                                          opacity: 0,
                                        }}
                                      >
                                        {quiz.description && (
                                          <div className="acr-quiz-description">
                                            <span>
                                              Assessment
                                              Overview
                                            </span>

                                            <p>
                                              {
                                                quiz.description
                                              }
                                            </p>
                                          </div>
                                        )}

                                        <div className="acr-quiz-overview">
                                          <div>
                                            <span>
                                              Questions
                                            </span>

                                            <strong>
                                              {quiz
                                                .questions
                                                ?.length ||
                                                0}
                                            </strong>
                                          </div>

                                          <div>
                                            <span>
                                              Pass Mark
                                            </span>

                                            <strong>
                                              {quiz.passMark ??
                                                70}
                                              %
                                            </strong>
                                          </div>

                                          <div>
                                            <span>
                                              Type
                                            </span>

                                            <strong>
                                              Multiple Choice
                                            </strong>
                                          </div>
                                        </div>

                                        <div className="acr-quiz-question-list">
                                          {quiz.questions?.map(
                                            (
                                              question,
                                              questionIndex
                                            ) => (
                                              <div
                                                className="acr-quiz-question"
                                                key={
                                                  question._id ||
                                                  questionIndex
                                                }
                                              >
                                                <div className="acr-quiz-question-header">
                                                  <span>
                                                    Question{" "}
                                                    {questionIndex +
                                                      1}
                                                  </span>

                                                  <span>
                                                    <FiCheckCircle />
                                                    Correct
                                                    answer
                                                    highlighted
                                                  </span>
                                                </div>

                                                <h4>
                                                  {
                                                    question.question
                                                  }
                                                </h4>

                                                <div className="acr-quiz-options">
                                                  {question.options?.map(
                                                    (
                                                      option,
                                                      optionIndex
                                                    ) => {
                                                      const isCorrect =
                                                        option ===
                                                        question.correctAnswer;

                                                      return (
                                                        <div
                                                          className={`acr-quiz-option ${
                                                            isCorrect
                                                              ? "acr-quiz-option-correct"
                                                              : ""
                                                          }`}
                                                          key={
                                                            optionIndex
                                                          }
                                                        >
                                                          <span className="acr-quiz-option-letter">
                                                            {String.fromCharCode(
                                                              65 +
                                                                optionIndex
                                                            )}
                                                          </span>

                                                          <span className="acr-quiz-option-text">
                                                            {
                                                              option
                                                            }
                                                          </span>

                                                          {isCorrect && (
                                                            <FiCheck />
                                                          )}
                                                        </div>
                                                      );
                                                    }
                                                  )}
                                                </div>
                                              </div>
                                            )
                                          )}
                                        </div>

                                        <button
                                          className="acr-quiz-edit-full-btn"
                                          onClick={() =>
                                            openEditor(
                                              "quiz",
                                              quiz
                                            )
                                          }
                                        >
                                          <FiEdit3 />
                                          Edit Assessment
                                        </button>
                                      </motion.div>
                                    )}
                                </AnimatePresence>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  }
                )
              )}
            </div>
          </main>

          <aside className="acr-sidebar">
            <div className="acr-sidebar-card">
              <div className="acr-sidebar-heading">
                <FiTool />

                <h3>
                  Course Details
                </h3>
              </div>

              <div className="acr-detail-list">
                <div className="acr-detail-item">
                  <span>
                    Status
                  </span>

                  <strong
                    className={
                      isDraft
                        ? "text-warning"
                        : "text-success"
                    }
                  >
                    {isDraft
                      ? "Draft"
                      : "Published"}
                  </strong>
                </div>

                <div className="acr-detail-item">
                  <span>
                    Duration
                  </span>

                  <strong>
                    {course.duration ||
                      "Not specified"}
                  </strong>
                </div>

                <div className="acr-detail-item">
                  <span>
                    Price
                  </span>

                  <strong>
                    ₦
                    {Number(
                      course.price || 0
                    ).toLocaleString()}
                  </strong>
                </div>

                <div className="acr-detail-item">
                  <span>
                    Modules
                  </span>

                  <strong>
                    {modules.length}
                  </strong>
                </div>

                <div className="acr-detail-item">
                  <span>
                    Lessons
                  </span>

                  <strong>
                    {lessonCount}
                  </strong>
                </div>

                <div className="acr-detail-item">
                  <span>
                    Quizzes
                  </span>

                  <strong>
                    {quizCount}
                  </strong>
                </div>

                <div className="acr-detail-item">
                  <span>
                    Questions
                  </span>

                  <strong>
                    {questionCount}
                  </strong>
                </div>
              </div>

              {course.tools?.length >
                0 && (
                <div className="acr-tools-section">
                  <span>
                    Tools & Technologies
                  </span>

                  <div className="acr-tools">
                    {course.tools.map(
                      (
                        tool,
                        index
                      ) => (
                        <span
                          key={index}
                        >
                          {tool}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {isDraft && (
              <div className="acr-publish-card">
                <div className="acr-publish-card-icon">
                  <FiSend />
                </div>

                <h3>
                  Ready to publish?
                </h3>

                <p>
                  Review the course
                  content carefully
                  before making it
                  available to students.
                </p>

                <button
                  onClick={() =>
                    setPublishModal(
                      true
                    )
                  }
                >
                  <FiSend />
                  Publish Course
                </button>
              </div>
            )}

            {course.image && (
              <div className="acr-image-card">
                <div className="acr-sidebar-heading">
                  <FiImage />

                  <h3>
                    Course Cover
                  </h3>
                </div>

                <img
                  src={course.image}
                  alt={course.title}
                />
              </div>
            )}
          </aside>
        </section>
      </div>

      <AnimatePresence>
        {editing.type && (
          <div className="acr-modal-overlay">
            <motion.div
              className={`acr-editor-modal ${
                editing.type === "quiz"
                  ? "acr-quiz-editor-modal"
                  : ""
              }`}
              initial={{
                opacity: 0,
                y: 20,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.98,
              }}
            >
              <div className="acr-modal-header">
                <div>
                  <span>
                    {editing.type ===
                    "quiz"
                      ? "Assessment Editor"
                      : "Content Editor"}
                  </span>

                  <h3>
                    {editing.type ===
                      "course" &&
                      "Edit Course"}

                    {editing.type ===
                      "module" &&
                      "Edit Module"}

                    {editing.type ===
                      "lesson" &&
                      "Edit Lesson"}

                    {editing.type ===
                      "quiz" &&
                      "Edit Module Assessment"}
                  </h3>
                </div>

                <button
                  onClick={
                    closeEditor
                  }
                  disabled={saving}
                >
                  <FiX />
                </button>
              </div>

              <div className="acr-modal-body">
                {editing.type ===
                  "course" && (
                  <div className="acr-form-grid">
                    <div className="acr-form-group acr-full-width">
                      <label>
                        Course Title
                      </label>

                      <input
                        type="text"
                        value={
                          editing.data
                            ?.title ||
                          ""
                        }
                        onChange={(
                          e
                        ) =>
                          handleEditorChange(
                            "title",
                            e.target
                              .value
                          )
                        }
                      />
                    </div>

                    <div className="acr-form-group acr-full-width">
                      <label>
                        Description
                      </label>

                      <textarea
                        rows="5"
                        value={
                          editing.data
                            ?.description ||
                          ""
                        }
                        onChange={(
                          e
                        ) =>
                          handleEditorChange(
                            "description",
                            e.target
                              .value
                          )
                        }
                      />
                    </div>

                    <div className="acr-form-group">
                      <label>
                        Price
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={
                          editing.data
                            ?.price ?? ""
                        }
                        onChange={(
                          e
                        ) =>
                          handleEditorChange(
                            "price",
                            e.target
                              .value
                          )
                        }
                      />
                    </div>

                    <div className="acr-form-group">
                      <label>
                        Duration
                      </label>

                      <input
                        type="text"
                        value={
                          editing.data
                            ?.duration ||
                          ""
                        }
                        onChange={(
                          e
                        ) =>
                          handleEditorChange(
                            "duration",
                            e.target
                              .value
                          )
                        }
                      />
                    </div>

                    <div className="acr-form-group acr-full-width">
                      <label>
                        Tools &
                        Technologies
                      </label>

                      <input
                        type="text"
                        placeholder="React, Node.js, MongoDB"
                        value={
                          editing.data
                            ?.tools ||
                          ""
                        }
                        onChange={(
                          e
                        ) =>
                          handleEditorChange(
                            "tools",
                            e.target
                              .value
                          )
                        }
                      />

                      <small>
                        Separate each
                        tool with a
                        comma.
                      </small>
                    </div>

                    <div className="acr-form-group acr-full-width">
                      <label>
                        Course Image URL
                      </label>

                      <input
                        type="text"
                        value={
                          editing.data
                            ?.image ||
                          ""
                        }
                        onChange={(
                          e
                        ) =>
                          handleEditorChange(
                            "image",
                            e.target
                              .value
                          )
                        }
                      />
                    </div>
                  </div>
                )}

                {editing.type ===
                  "module" && (
                  <div className="acr-form-grid">
                    <div className="acr-form-group acr-full-width">
                      <label>
                        Module Title
                      </label>

                      <input
                        type="text"
                        value={
                          editing.data
                            ?.title ||
                          ""
                        }
                        onChange={(
                          e
                        ) =>
                          handleEditorChange(
                            "title",
                            e.target
                              .value
                          )
                        }
                      />
                    </div>

                    <div className="acr-form-group acr-full-width">
                      <label>
                        Description
                      </label>

                      <textarea
                        rows="5"
                        value={
                          editing.data
                            ?.description ||
                          ""
                        }
                        onChange={(
                          e
                        ) =>
                          handleEditorChange(
                            "description",
                            e.target
                              .value
                          )
                        }
                      />
                    </div>

                    <div className="acr-form-group">
                      <label>
                        Month
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={
                          editing.data
                            ?.month ??
                          1
                        }
                        onChange={(
                          e
                        ) =>
                          handleEditorChange(
                            "month",
                            e.target
                              .value
                          )
                        }
                      />
                    </div>

                    <div className="acr-form-group">
                      <label>
                        Order
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={
                          editing.data
                            ?.order ??
                          1
                        }
                        onChange={(
                          e
                        ) =>
                          handleEditorChange(
                            "order",
                            e.target
                              .value
                          )
                        }
                      />
                    </div>
                  </div>
                )}

                {editing.type ===
                  "lesson" && (
                  <div className="acr-form-grid">
                    <div className="acr-form-group acr-full-width">
                      <label>
                        Lesson Title
                      </label>

                      <input
                        type="text"
                        value={
                          editing.data
                            ?.title ||
                          ""
                        }
                        onChange={(
                          e
                        ) =>
                          handleEditorChange(
                            "title",
                            e.target
                              .value
                          )
                        }
                      />
                    </div>

                    <div className="acr-form-group">
                      <label>
                        Lesson Type
                      </label>

                      <select
                        value={
                          editing.data
                            ?.type ||
                          "text"
                        }
                        onChange={(
                          e
                        ) =>
                          handleEditorChange(
                            "type",
                            e.target
                              .value
                          )
                        }
                      >
                        <option value="text">
                          Text
                        </option>

                        <option value="video">
                          Video
                        </option>

                        <option value="document">
                          Document
                        </option>
                      </select>
                    </div>

                    <div className="acr-form-group">
                      <label>
                        Lesson Order
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={
                          editing.data
                            ?.order ??
                          1
                        }
                        onChange={(
                          e
                        ) =>
                          handleEditorChange(
                            "order",
                            e.target
                              .value
                          )
                        }
                      />
                    </div>

                    <div className="acr-form-group acr-full-width">
                      <label>
                        Lesson Content
                      </label>

                      <textarea
                        className="acr-content-textarea"
                        rows="14"
                        value={
                          editing.data
                            ?.content ||
                          ""
                        }
                        onChange={(
                          e
                        ) =>
                          handleEditorChange(
                            "content",
                            e.target
                              .value
                          )
                        }
                      />
                    </div>

                    <div className="acr-form-group">
                      <label>
                        Video URL
                      </label>

                      <input
                        type="text"
                        value={
                          editing.data
                            ?.videoUrl ||
                          ""
                        }
                        onChange={(
                          e
                        ) =>
                          handleEditorChange(
                            "videoUrl",
                            e.target
                              .value
                          )
                        }
                      />
                    </div>

                    <div className="acr-form-group">
                      <label>
                        Document URL
                      </label>

                      <input
                        type="text"
                        value={
                          editing.data
                            ?.documentUrl ||
                          ""
                        }
                        onChange={(
                          e
                        ) =>
                          handleEditorChange(
                            "documentUrl",
                            e.target
                              .value
                          )
                        }
                      />
                    </div>

                    <div className="acr-form-group acr-full-width">
                      <label>
                        Illustration URL
                      </label>

                      <input
                        type="text"
                        value={
                          editing.data
                            ?.illustrationUrl ||
                          ""
                        }
                        onChange={(
                          e
                        ) =>
                          handleEditorChange(
                            "illustrationUrl",
                            e.target
                              .value
                          )
                        }
                      />
                    </div>

                    <div className="acr-checkbox-group acr-full-width">
                      <label>
                        <input
                          type="checkbox"
                          checked={Boolean(
                            editing.data
                              ?.isPreview
                          )}
                          onChange={(
                            e
                          ) =>
                            handleEditorChange(
                              "isPreview",
                              e.target
                                .checked
                            )
                          }
                        />

                        <span>
                          Make this lesson
                          available as
                          a preview
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {editing.type ===
                  "quiz" && (
                  <div className="acr-quiz-editor">
                    <div className="acr-quiz-editor-intro">
                      <div className="acr-quiz-editor-intro-icon">
                        <FiHelpCircle />
                      </div>

                      <div>
                        <span>
                          Module Assessment
                        </span>

                        <h4>
                          Build and review
                          your assessment
                        </h4>

                        <p>
                          Edit the questions,
                          answer choices and
                          passing requirement
                          before publishing the
                          course.
                        </p>
                      </div>
                    </div>

                    <div className="acr-quiz-settings">
                      <div className="acr-quiz-setting-main">
                        <div className="acr-form-group">
                          <label>
                            Assessment Title
                          </label>

                          <input
                            type="text"
                            value={
                              editing.data
                                ?.title ||
                              ""
                            }
                            onChange={(
                              e
                            ) =>
                              handleEditorChange(
                                "title",
                                e.target
                                  .value
                              )
                            }
                          />
                        </div>

                        <div className="acr-form-group">
                          <label>
                            Description
                          </label>

                          <textarea
                            rows="4"
                            value={
                              editing.data
                                ?.description ||
                              ""
                            }
                            onChange={(
                              e
                            ) =>
                              handleEditorChange(
                                "description",
                                e.target
                                  .value
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="acr-quiz-passmark-card">
                        <span>
                          Passing Score
                        </span>

                        <div>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={
                              editing.data
                                ?.passMark ??
                              70
                            }
                            onChange={(
                              e
                            ) =>
                              handleEditorChange(
                                "passMark",
                                e.target
                                  .value
                              )
                            }
                          />

                          <strong>
                            %
                          </strong>
                        </div>

                        <small>
                          Students must reach
                          this percentage to
                          pass.
                        </small>
                      </div>
                    </div>

                    <div className="acr-quiz-questions-header">
                      <div>
                        <span>
                          Assessment Questions
                        </span>

                        <strong>
                          {editing.data
                            ?.questions
                            ?.length || 0}{" "}
                          Questions
                        </strong>
                      </div>

                      <button
                        type="button"
                        onClick={
                          addQuizQuestion
                        }
                      >
                        <FiPlus />
                        Add Question
                      </button>
                    </div>

                    <div className="acr-editor-question-list">
                      {editing.data?.questions?.map(
                        (
                          question,
                          questionIndex
                        ) => (
                          <div
                            className="acr-editor-question"
                            key={
                              question._id ||
                              questionIndex
                            }
                          >
                            <div className="acr-editor-question-top">
                              <div className="acr-editor-question-number">
                                {String(
                                  questionIndex +
                                    1
                                ).padStart(
                                  2,
                                  "0"
                                )}
                              </div>

                              <div className="acr-editor-question-heading">
                                <span>
                                  Question{" "}
                                  {questionIndex +
                                    1}
                                </span>

                                <strong>
                                  Multiple Choice
                                </strong>
                              </div>

                              <button
                                type="button"
                                className="acr-delete-question-btn"
                                onClick={() =>
                                  removeQuizQuestion(
                                    questionIndex
                                  )
                                }
                                disabled={
                                  editing.data
                                    ?.questions
                                    ?.length <=
                                  1
                                }
                                title="Remove question"
                              >
                                <FiTrash2 />
                              </button>
                            </div>

                            <div className="acr-form-group acr-full-width">
                              <label>
                                Question
                              </label>

                              <textarea
                                rows="3"
                                placeholder="Enter the question..."
                                value={
                                  question.question ||
                                  ""
                                }
                                onChange={(
                                  e
                                ) =>
                                  handleQuizQuestionChange(
                                    questionIndex,
                                    "question",
                                    e.target
                                      .value
                                  )
                                }
                              />
                            </div>

                            <div className="acr-options-editor">
                              <div className="acr-options-editor-heading">
                                <div>
                                  <span>
                                    Answer Options
                                  </span>

                                  <small>
                                    Select the
                                    correct answer
                                  </small>
                                </div>
                              </div>

                              <div className="acr-option-editor-list">
                                {question.options?.map(
                                  (
                                    option,
                                    optionIndex
                                  ) => {
                                    const isCorrect =
                                      question.correctAnswer ===
                                      option;

                                    return (
                                      <div
                                        className={`acr-option-editor ${
                                          isCorrect
                                            ? "acr-option-editor-correct"
                                            : ""
                                        }`}
                                        key={
                                          optionIndex
                                        }
                                      >
                                        <div className="acr-option-editor-letter">
                                          {String.fromCharCode(
                                            65 +
                                              optionIndex
                                          )}
                                        </div>

                                        <input
                                          type="text"
                                          placeholder={`Option ${String.fromCharCode(
                                            65 +
                                              optionIndex
                                          )}`}
                                          value={
                                            option
                                          }
                                          onChange={(
                                            e
                                          ) =>
                                            handleQuizOptionChange(
                                              questionIndex,
                                              optionIndex,
                                              e
                                                .target
                                                .value
                                            )
                                          }
                                        />

                                        <button
                                          type="button"
                                          className={`acr-mark-correct-btn ${
                                            isCorrect
                                              ? "acr-mark-correct-active"
                                              : ""
                                          }`}
                                          onClick={() =>
                                            handleQuizQuestionChange(
                                              questionIndex,
                                              "correctAnswer",
                                              option
                                            )
                                          }
                                          disabled={
                                            !option.trim()
                                          }
                                        >
                                          {isCorrect ? (
                                            <>
                                              <FiCheck />
                                              Correct
                                            </>
                                          ) : (
                                            "Mark correct"
                                          )}
                                        </button>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    <button
                      type="button"
                      className="acr-add-question-btn"
                      onClick={
                        addQuizQuestion
                      }
                    >
                      <FiPlus />
                      Add Another Question
                    </button>
                  </div>
                )}
              </div>

              <div className="acr-modal-footer">
                <button
                  className="acr-cancel-btn"
                  onClick={
                    closeEditor
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  className="acr-save-btn"
                  onClick={
                    handleSave
                  }
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <FiLoader className="acr-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {publishModal && (
          <div className="acr-modal-overlay">
            <motion.div
              className="acr-publish-modal"
              initial={{
                opacity: 0,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
              }}
            >
              <div className="acr-publish-modal-icon">
                <FiSend />
              </div>

              <h3>
                Publish this course?
              </h3>

              <p>
                Once published, this
                course will become
                available to students.
                Make sure you have
                reviewed the curriculum
                and lesson content.
              </p>

              <div className="acr-publish-summary">
                <div>
                  <span>
                    Course
                  </span>

                  <strong>
                    {course.title}
                  </strong>
                </div>

                <div>
                  <span>
                    Modules
                  </span>

                  <strong>
                    {modules.length}
                  </strong>
                </div>

                <div>
                  <span>
                    Lessons
                  </span>

                  <strong>
                    {lessonCount}
                  </strong>
                </div>

                <div>
                  <span>
                    Quizzes
                  </span>

                  <strong>
                    {quizCount}
                  </strong>
                </div>
              </div>

              <div className="acr-publish-modal-actions">
                <button
                  className="acr-cancel-btn"
                  onClick={() =>
                    setPublishModal(
                      false
                    )
                  }
                  disabled={
                    publishing
                  }
                >
                  Cancel
                </button>

                <button
                  className="acr-confirm-publish-btn"
                  onClick={
                    handlePublish
                  }
                  disabled={
                    publishing
                  }
                >
                  {publishing ? (
                    <>
                      <FiLoader className="acr-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <FiSend />
                      Publish Course
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminCourseReview;