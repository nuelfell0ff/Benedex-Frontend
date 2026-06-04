import "./StudentQuiz.css";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import {
  FiClock,
  FiCheckCircle,
  FiArrowRight,
  FiArrowLeft,
} from "react-icons/fi";
import { motion } from "framer-motion";

function StudentQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const [timeLeft, setTimeLeft] = useState(0);

  const timerRef = useRef(null);

  /* ---------------- FETCH QUIZ ---------------- */
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);

        // PRIMARY: quizId route
        let res = await API.get(
          `/quizzes/${quizId}`
        ).catch(() => null);

        // FALLBACK: module-based quiz (VERY IMPORTANT FIX)
        if (!res?.data) {
          res = await API.get(`/quizzes/module/${quizId}`).catch(() => null);
        }

        const data = res?.data;

        if (!data || !data.questions || data.questions.length === 0) {
          setQuiz(null);
          return;
        }

        setQuiz(data);
        setTimeLeft(data.questions.length * 60); // 1 min per question
      } catch (err) {
        console.log(err);
        setQuiz(null);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (!quiz || submitted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [quiz, submitted]);

  const formatTime = (sec = 0) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  /* ---------------- SAFETY ---------------- */
  const questions = quiz?.questions || [];
  const question = questions[current];

  /* ---------------- ANSWERS ---------------- */
  const handleSelect = (value) => {
    setAnswers((prev) => ({
      ...prev,
      [current]: value,
    }));
  };

  /* ---------------- NAVIGATION ---------------- */
  const next = () => {
    if (current < questions.length - 1) {
      setCurrent((p) => p + 1);
    }
  };

  const prev = () => {
    if (current > 0) {
      setCurrent((p) => p - 1);
    }
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    if (submitted || !quiz) return;

    let total = 0;

    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) {
        total += 1;
      }
    });

    setScore(total);
    setSubmitted(true);
    clearInterval(timerRef.current);

    try {
      const res = await API.post(
        `/quizzes/submit/${quizId}`,
        {
          answers,
        }
      );

      setScore(
        res.data.correct
      );
    } catch (err) {
      console.log(err);
    }
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="quiz-loading">
        Loading quiz...
      </div>
    );
  }

  /* ---------------- NO QUIZ SAFETY ---------------- */
  if (!quiz || questions.length === 0) {
    return (
      <div className="quiz-error">
        No quiz available for this module
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="quiz-page">

      {/* HEADER */}
      <div className="quiz-header">
        <h1>{quiz.title}</h1>

        <div className="quiz-meta">
          <span><FiClock /> {formatTime(timeLeft)}</span>
          <span>
            {current + 1} / {questions.length}
          </span>
        </div>
      </div>

      {/* QUIZ BODY */}
      {!submitted ? (
        <motion.div
          key={current}
          className="quiz-card"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
        >

          {/* QUESTION */}
          <h2 className="quiz-question">
            {question?.question}
          </h2>

          {/* OPTIONS */}
          <div className="quiz-options">
            {(question?.options || []).map((opt, i) => (
              <button
                key={i}
                className={`quiz-option ${answers[current] === opt ? "active" : ""
                  }`}
                onClick={() => handleSelect(opt)}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* CONTROLS */}
          <div className="quiz-controls">

            <button onClick={prev} disabled={current === 0}>
              <FiArrowLeft /> Prev
            </button>

            {current < questions.length - 1 ? (
              <button onClick={next}>
                Next <FiArrowRight />
              </button>
            ) : (
              <button className="submit-btn" onClick={handleSubmit}>
                Submit Quiz
              </button>
            )}

          </div>

        </motion.div>
      ) : (
        <motion.div
          className="quiz-result"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <FiCheckCircle size={45} />
          <h2>Quiz Completed</h2>

          <p>
            You scored <strong>{score}</strong> / {questions.length}
          </p>

          <button onClick={() => navigate("/student/courses")}>
            Back to Courses
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default StudentQuiz;