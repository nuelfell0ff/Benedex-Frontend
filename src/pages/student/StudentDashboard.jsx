import { useEffect, useMemo, useState } from "react";

import { motion } from "framer-motion";

import {
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiLogIn,
  FiMessageCircle,
  FiLayers,
  FiLock,
  FiPlayCircle,
  FiRadio,
  FiStar,
  FiTarget,
  FiUsers,
} from "react-icons/fi";

import API from "../../services/api";

const badgeCatalog = [
  { label: "Fast Learner", icon: <FiAward /> },
  { label: "Code Master", icon: <FiBriefcase /> },
  { label: "Bug Hunter", icon: <FiTarget /> },
  { label: "Team Lead", icon: <FiUsers /> },
  { label: "UI Architect", icon: <FiLayers /> },
  { label: "Data Wizard", icon: <FiLock /> },
];

const liveSessions = [
  {
    date: "Today at 14:00",
    title: "System Architecture Q&A",
    mentor: "Sarah Drasner",
    action: "Join Session",
    soon: true,
  },
  {
    date: "Tomorrow at 10:00",
    title: "Career Coaching: Portfolio Review",
    mentor: "James Clear",
    action: "Set Reminder",
    soon: false,
  },
];

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const buildFallbackConsistency = (year = new Date().getUTCFullYear()) =>
  monthNames.map((name, monthIndex) => {
    const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

    return {
      name,
      monthIndex,
      daysInMonth,
      days: Array.from({ length: daysInMonth }, (_, dayIndex) => ({
        day: dayIndex + 1,
        count: 0,
        intensity: 0,
      })),
    };
  });

const buildConsistencyGraph = (learningSummary) => {
  const summary = learningSummary || {
    year: new Date().getUTCFullYear(),
    months: buildFallbackConsistency(),
  };

  const year = summary.year || new Date().getUTCFullYear();
  const monthList = summary.months?.length > 0 ? summary.months : buildFallbackConsistency(year);
  const activityMap = new Map();
  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysToRender = isLeapYear ? 366 : 365;

  monthList.forEach((month) => {
    month.days.forEach((day) => {
      const key = `${year}-${String((month.monthIndex ?? 0) + 1).padStart(2, "0")}-${String(day.day).padStart(2, "0")}`;
      activityMap.set(key, day.count || 0);
    });
  });

  const startOfYear = new Date(Date.UTC(year, 0, 1));

  const cells = [];
  const monthMarkers = monthList.map((month) => ({
    label: month.name.slice(0, 3),
    monthIndex: month.monthIndex ?? 0,
  }));

  for (let index = 0; index < daysToRender; index += 1) {
    const date = new Date(startOfYear);
    date.setUTCDate(startOfYear.getUTCDate() + index);

    const key = date.toISOString().slice(0, 10);
    const count = activityMap.get(key) || 0;
    const weekday = date.getUTCDay();

    cells.push({
      key,
      count,
      intensity: count >= 5 ? 4 : count >= 3 ? 3 : count >= 2 ? 2 : count >= 1 ? 1 : 0,
      weekday,
      weekIndex: Math.floor(index / 7),
      monthIndex: date.getUTCMonth(),
    });
  }

  const renderedWeeks = Math.ceil(cells.length / 7);

  return {
    year,
    monthMarkers,
    cells,
    renderedWeeks,
    activeDays: cells.filter((cell) => cell.count > 0).length,
    totalDays: cells.length,
  };
};

const activityIconMap = {
  account_registered: <FiUsers />,
  user_logged_in: <FiLogIn />,
  course_enrolled: <FiBookOpen />,
  assignment_submitted: <FiCheckCircle />,
  module_completed: <FiLayers />,
  lesson_started: <FiPlayCircle />,
  live_class_joined: <FiRadio />,
  xp_awarded: <FiStar />,
};

const formatTimeAgo = (value) => {
  if (!value) return "Just now";

  const date = new Date(value);
  const diffSeconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));

  if (diffSeconds < 60) return `${diffSeconds}s ago`;

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

function StudentDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboard = async () => {
      try {
        const res = await API.get("/dashboard/student");

        if (isMounted) {
          setDashboard(res.data);
        }
      } catch (error) {
        console.log(error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const viewModel = useMemo(() => {
    const studentName = dashboard?.profile?.fullName || "Kwame Mensah";
    const firstName = studentName.split(" ")[0] || "Kwame";
    const xp = dashboard?.xp ?? 1240;
    const level = dashboard?.level ?? Math.max(1, Math.floor(xp / 100));
    const xpTarget = dashboard?.xpTarget ?? 2000;
    const xpProgress = dashboard?.xpProgress ?? Math.min(100, Math.round((xp / xpTarget) * 100));
    const currentStreak = dashboard?.learningSummary?.currentStreak ?? 14;
    const learningSummary = dashboard?.learningSummary || {
      activeDays: 0,
      totalDays: 365,
      activityCount: 0,
      months: buildFallbackConsistency(),
    };

    const badgeNames = Array.isArray(dashboard?.badges)
      ? dashboard.badges.map((badge) =>
        typeof badge === "string" ? badge : badge?.name || badge?.title || "Badge"
      )
      : [];

    const consistencyMonths =
      learningSummary.months?.length > 0
        ? learningSummary.months
        : buildFallbackConsistency(learningSummary.year || new Date().getUTCFullYear());

    const consistencyGraph = buildConsistencyGraph(learningSummary);

    const courses =
      dashboard?.enrolledCourses?.length > 0
        ? dashboard.enrolledCourses.slice(0, 2).map((course, index) => ({
          title: course.title,
          description: course.description,
          progress: index === 0 ? 45 : 78,
          lessons: index === 0 ? "12/24 Lessons" : "18/23 Lessons",
          status: "In Progress",
        }))
        : [
          {
            title: "Advanced React Patterns",
            description: "Master design patterns and performance optimization.",
            progress: 45,
            lessons: "12/24 Lessons",
            status: "In Progress",
          },
          {
            title: "Visual Design Systems",
            description: "Scaling design for enterprise platforms.",
            progress: 78,
            lessons: "18/23 Lessons",
            status: "In Progress",
          },
        ];

    return {
      firstName,
      level,
      xp,
      xpTarget,
      xpProgress,
      currentStreak,
      learningSummary,
      badgeNames,
      consistencyMonths,
      consistencyGraph,
      courses,
      recentActivities: dashboard?.recentActivities || [],
    };
  }, [dashboard]);

  if (loading) {
    return (
      <div className="student-loading-shell">
        <div className="student-loading-card">
          <span className="student-spinner" />
          <strong>Loading dashboard...</strong>
          <span>Fetching your learning progress.</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="student-dashboard"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <section className="student-hero">
        <div>
          <p className="student-hero-kicker">Good Morning, {viewModel.firstName}</p>
          <h1>
            You&apos;re on a {viewModel.currentStreak}-day learning streak. Keep the momentum going!
          </h1>
        </div>
      </section>

      <div className="student-dashboard-grid">
        <div className="student-dashboard-main">
          <div className="student-summary-row">
            <motion.article
              className="student-card student-level-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
            >
              <div>
                <span className="student-card-label">Current Level</span>
                <h2>Level {viewModel.level}</h2>
                <p>
                  {viewModel.xp.toLocaleString()} XP / {viewModel.xpTarget.toLocaleString()} XP
                </p>
                <div className="student-level-bar" aria-hidden="true">
                  <span style={{ width: `${viewModel.xpProgress}%` }} />
                </div>
              </div>

              <div className="student-ring-wrap" aria-label={`${viewModel.xpProgress}% complete`}>
                <svg viewBox="0 0 120 120" className="student-ring">
                  <circle className="student-ring-track" cx="60" cy="60" r="48" />
                  <circle
                    className="student-ring-progress"
                    cx="60"
                    cy="60"
                    r="48"
                    style={{ strokeDashoffset: 301 - (301 * viewModel.xpProgress) / 100 }}
                  />
                </svg>
                <strong>{viewModel.xpProgress}%</strong>
              </div>
            </motion.article>

            <motion.article
              className="student-card student-consistency-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.12 }}
            >
              <div className="student-card-header-row">
                <h3>Learning Consistency</h3>
                <div className="student-legend">
                  <span>Less</span>
                  <div className="student-legend-swatch" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <span>More</span>
                </div>
              </div>

              <div className="student-consistency-chart">
                <div className="student-consistency-months" aria-hidden="true">
                  {viewModel.consistencyGraph.monthMarkers.map((month) => (
                    <span key={month.label}>{month.label}</span>
                  ))}
                </div>

                <div className="student-consistency-body">
                  <div className="student-consistency-weekdays" aria-hidden="true">
                    <span>Mon</span>
                    <span>Wed</span>
                    <span>Fri</span>
                  </div>

                  <div className="student-consistency-grid" aria-label="Yearly learning consistency heatmap">
                    {viewModel.consistencyGraph.cells.map((cell) => (
                      <span
                        key={cell.key}
                        className={`student-consistency-box is-${cell.intensity}`}
                        title={`${cell.key}: ${cell.count} activities`}
                      />
                    ))}
                  </div>
                </div>

              </div>
            </motion.article>
          </div>

          <section className="student-section">
            <div className="student-section-head">
              <h3>Earned Badges</h3>
              <button type="button">View All</button>
            </div>

            <div className="student-badge-grid">
              {badgeCatalog.map((badge) => {
                const active = viewModel.badgeNames.includes(badge.label);

                return (
                  <motion.article
                    key={badge.label}
                    className={`student-badge-card${active ? " is-earned" : " is-muted"}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32 }}
                  >
                    <span className="student-badge-icon" aria-hidden="true">
                      {badge.icon}
                    </span>
                    <strong>{badge.label}</strong>
                  </motion.article>
                );
              })}
            </div>
          </section>

          <section className="student-section">
            <div className="student-section-head student-section-head-inline">
              <h3>Continue Learning</h3>
              <div className="student-carousel-actions" aria-hidden="true">
                <button type="button">
                  <FiArrowRight className="student-rotate-left" />
                </button>
                <button type="button">
                  <FiArrowRight />
                </button>
              </div>
            </div>

            <div className="student-course-grid">
              {viewModel.courses.map((course, index) => (
                <motion.article
                  key={course.title}
                  className="student-course-card"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <div className="student-course-preview">
                    <span>{course.status}</span>
                    <FiPlayCircle />
                  </div>

                  <div className="student-course-body">
                    <h4>{course.title}</h4>
                    <p>{course.description}</p>

                    <div className="student-course-meta">
                      <span>{course.progress}% Complete</span>
                      <span>{course.lessons}</span>
                    </div>

                    <div className="student-course-bar" aria-hidden="true">
                      <span style={{ width: `${course.progress}%` }} />
                    </div>

                    <button type="button" className="student-course-button">
                      Continue Learning <FiArrowRight />
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          </section>
        </div>

        <aside className="student-dashboard-side">
          <motion.section
            className="student-side-card"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
          >
            <div className="student-side-head">
              <h3>Upcoming Live</h3>
              <span className="student-live-pill">LIVE SOON</span>
            </div>

            <div className="student-live-list">
              {liveSessions.map((session) => (
                <article key={session.title} className="student-live-card">
                  <div className="student-live-meta">
                    <FiCalendar />
                    <span>{session.date}</span>
                  </div>
                  <h4>{session.title}</h4>
                  <p>Mentor: {session.mentor}</p>

                  <button type="button" className="student-live-button" disabled={!session.soon}>
                    {session.action}
                  </button>
                </article>
              ))}
            </div>
          </motion.section>

          <motion.section
            className="student-side-card"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
          >
            <h3>Activity Log</h3>

            <div className="student-activity-list">
              {viewModel.recentActivities.length > 0 ? (
                viewModel.recentActivities.map((item) => (
                  <article key={item._id || `${item.type}-${item.createdAt}`} className="student-activity-item">
                    <span className="student-activity-icon" aria-hidden="true">
                      {activityIconMap[item.type] || <FiMessageCircle />}
                    </span>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.type.replaceAll("_", " ")}</p>
                      <span>{formatTimeAgo(item.createdAt)}</span>
                    </div>
                  </article>
                ))
              ) : (
                <article className="student-activity-item student-activity-empty">
                  <span className="student-activity-icon" aria-hidden="true">
                    <FiClock />
                  </span>
                  <div>
                    <strong>No recent activity yet</strong>
                    <p>New actions will show here.</p>
                  </div>
                </article>
              )}
            </div>
          </motion.section>
        </aside>
      </div>

      <footer className="student-footer">
        <p>© 2026 Benedex Digital Hub. Built for African Excellence.</p>
        <p>Empowering the next generation of African digital leaders.</p>
        <div>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Currency: USD/NGN</span>
          <span>Contact Support</span>
        </div>
      </footer>
    </motion.div>
  );
}

export default StudentDashboard;
