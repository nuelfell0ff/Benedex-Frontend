import { useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import { motion } from "framer-motion";

import {
  FiArrowRight,
  FiBookOpen,
  FiChevronDown,
  FiClock,
  FiFilter,
  FiLayers,
  FiPlayCircle,
  FiStar,
  FiUsers,
} from "react-icons/fi";

import API from "../../services/api";

function StudentCourses() {

  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState("All programs");
  const [sortBy, setSortBy] = useState("popular");
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const [coursesRes, dashboardRes] = await Promise.all([
          API.get("/courses"),
          API.get("/dashboard/student"),
        ]);

        setCourses(coursesRes.data || []);

        const enrolledIds = new Set(
          (dashboardRes.data?.enrolledCourses || []).map((course) => course._id)
        );

        setEnrolledCourseIds(enrolledIds);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const tracks = useMemo(() => {
    const uniqueTools = courses.flatMap((course) => course.tools || []).filter(Boolean);
    return ["All programs", ...new Set(uniqueTools)].slice(0, 6);
  }, [courses]);

  const stats = useMemo(() => {
    const uniqueInstructors = new Set(
      courses.map((course) => course.instructor?._id || course.instructor?.fullName || course.instructor)
    );

    const uniqueTools = new Set(courses.flatMap((course) => course.tools || []));

    return [
      {
        label: "Programs",
        value: courses.length,
        icon: <FiBookOpen />,
      },
      {
        label: "Enrolled",
        value: enrolledCourseIds.size,
        icon: <FiLayers />,
      },
      {
        label: "Mentors",
        value: uniqueInstructors.size,
        icon: <FiUsers />,
      },
      {
        label: "Tracks",
        value: uniqueTools.size,
        icon: <FiStar />,
      },
    ];
  }, [courses, enrolledCourseIds]);

  const visibleCourses = useMemo(() => {
    const filtered = courses.filter((course) => {
      if (selectedTrack === "All programs") {
        return true;
      }

      return (course.tools || []).includes(selectedTrack);
    });

    const sorted = [...filtered].sort((left, right) => {
      const leftPopularity = left.students?.length || 0;
      const rightPopularity = right.students?.length || 0;

      if (sortBy === "price-low") {
        return left.price - right.price;
      }

      if (sortBy === "price-high") {
        return right.price - left.price;
      }

      if (sortBy === "title") {
        return left.title.localeCompare(right.title);
      }

      return rightPopularity - leftPopularity;
    });

    return sorted.slice(0, visibleCount);
  }, [courses, selectedTrack, sortBy, visibleCount]);

  const filteredCourseCount = useMemo(() => {
    return courses.filter((course) => {
      if (selectedTrack === "All programs") {
        return true;
      }

      return (course.tools || []).includes(selectedTrack);
    }).length;
  }, [courses, selectedTrack]);

  const featuredInstructors = useMemo(() => {
    const seen = new Map();

    courses.forEach((course) => {
      const instructor = course.instructor;

      if (instructor?._id && !seen.has(instructor._id)) {
        seen.set(instructor._id, instructor);
      }
    });

    return Array.from(seen.values()).slice(0, 4);
  }, [courses]);

  const handleEnroll = async (courseId) => {
    if (enrolledCourseIds.has(courseId)) {
      return;
    }

    try {
      const res = await API.post("/payments/initialize", {
        courseId,
        callbackUrl: `${window.location.origin}/payments/callback`,
      });

      const url = res.data.authorization_url;
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getLevel = (course, index) => {
    if (course.price >= 120000 || index % 3 === 2) {
      return "Advanced";
    }

    if (course.price >= 65000 || index % 3 === 1) {
      return "Intermediate";
    }

    return "Beginner";
  };

  const formatPrice = (value) => `₦${Number(value || 0).toLocaleString()}`;

  const formatStudents = (value) => {
    const count = Number(value || 0);

    if (count >= 1000) {
      return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k students`;
    }

    return `${count} students`;
  };

  const getPreviewLabel = (course) => {
    if (course.tools?.[0]) {
      return course.tools[0];
    }

    return "Premium track";
  };

  if (loading) {
    return (
      <div className="student-loading-shell">
        <div className="student-loading-card">
          <span className="student-spinner" />
          <strong>Loading programs...</strong>
          <span>Preparing your course catalog.</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="student-catalog-page"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <section className="student-catalog-hero">
        <div className="student-catalog-hero-copy">
          <p className="student-catalog-kicker">Education / Programs</p>
          <h1>Explore Our Programs</h1>
          <p className="student-catalog-intro">
            Master the digital economy with industry-leading programs designed for the African context.
            Built for practical growth, premium delivery, and clear next steps.
          </p>

          <div className="student-catalog-instructor-row">
            <div className="student-catalog-avatar-stack" aria-hidden="true">
              {featuredInstructors.length > 0 ? (
                featuredInstructors.map((instructor, index) => (
                  <span key={instructor._id || instructor.fullName || index} className="student-catalog-avatar">
                    {(instructor.fullName || "Instructor")
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </span>
                ))
              ) : (
                <>
                  <span className="student-catalog-avatar">BD</span>
                  <span className="student-catalog-avatar">HD</span>
                  <span className="student-catalog-avatar">UX</span>
                </>
              )}
              <span className="student-catalog-avatar student-catalog-avatar-count">
                +{Math.max(0, courses.length - featuredInstructors.length)}
              </span>
            </div>

            <div className="student-catalog-instructor-copy">
              <strong>Top instructors joining daily</strong>
              <span>Fresh guidance, premium mentoring, and a growing program library.</span>
            </div>
          </div>
        </div>

        <div className="student-catalog-hero-side">
          <div className="student-catalog-stats">
            {stats.map((item, index) => (
              <motion.article
                key={item.label}
                className="student-catalog-stat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <span className="student-catalog-stat-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="student-catalog-toolbar">
        <div className="student-catalog-filters" aria-label="Program filters">
          {tracks.map((track) => (
            <button
              key={track}
              type="button"
              className={`student-catalog-chip${selectedTrack === track ? " is-active" : ""}`}
              onClick={() => {
                setSelectedTrack(track);
                setVisibleCount(4);
              }}
            >
              {track}
            </button>
          ))}
        </div>

        <div className="student-catalog-controls">
          <button type="button" className="student-catalog-filter-button" aria-label="More filters">
            <FiFilter /> More Filters
          </button>

          <label className="student-catalog-sorter">
            <span>Sort by</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="title">A to Z</option>
            </select>
            <FiChevronDown aria-hidden="true" />
          </label>
        </div>
      </section>

      <section className="student-catalog-grid-wrap">
        <div className="student-catalog-grid-head">
          <p>
            Showing {Math.min(visibleCourses.length, filteredCourseCount)} of {filteredCourseCount} programs
          </p>
        </div>

        <div className="student-catalog-grid">
          {visibleCourses.map((course, index) => {
            const enrolled = enrolledCourseIds.has(course._id);
            const level = getLevel(course, index);
            const instructorName = course.instructor?.fullName || "Benedex Mentor";
            const tools = course.tools || [];
            const previewLabel = getPreviewLabel(course);
            const studentCount = course.students?.length || 0;

            return (
              <motion.article
                key={course._id}
                className="student-catalog-card"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, delay: index * 0.05 }}
                whileHover={{ y: -6 }}
              >
                <div className="student-catalog-card-preview">
                  <div className="student-catalog-card-surface">
                    {course.image ? (
                      <img src={course.image} alt={course.title} />
                    ) : (
                      <div className="student-catalog-card-fallback" aria-hidden="true">
                        <FiPlayCircle />
                      </div>
                    )}
                  </div>

                  <div className="student-catalog-card-badges">
                    <span>{previewLabel}</span>
                    {enrolled ? <span className="is-enrolled">Paid</span> : <span className="is-trending">Hot</span>}
                  </div>
                </div>

                <div className="student-catalog-card-body">
                  <div className="student-catalog-card-meta-top">
                    <span>
                      <FiLayers /> {level}
                    </span>
                    <span>
                      <FiStar /> {enrolled ? "Your track" : "Premium"}
                    </span>
                  </div>

                  <h3>{course.title}</h3>
                  <p>{course.description}</p>

                  <div className="student-catalog-card-tags" aria-label="Program tools">
                    {(tools.length > 0 ? tools : ["Strategy"]).slice(0, 3).map((tool) => (
                      <span key={tool}>{tool}</span>
                    ))}
                  </div>

                  <div className="student-catalog-card-info">
                    <span>
                      <FiUsers /> {formatStudents(studentCount)}
                    </span>
                    <span>
                      <FiClock /> {course.duration || "3 Months"}
                    </span>
                  </div>

                  <div className="student-catalog-card-footer">
                    <div>
                      <span>Price</span>
                      <strong>{formatPrice(course.price)}</strong>
                    </div>

                    <div className="student-catalog-instructor-mini">
                      <span>{(instructorName || "BM").split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span>
                      <strong>{instructorName}</strong>
                    </div>
                  </div>

                  <div className="student-catalog-card-actions">
                    <button
                      type="button"
                      className="student-catalog-enroll-button"
                      disabled={enrolled}
                      onClick={() => handleEnroll(course._id)}
                    >
                      {enrolled ? "Paid / Enrolled" : "Enroll Now"}
                    </button>

                    <Link className="student-catalog-view-button" to={`/student/courses/${course._id}`}>
                      View Course <FiArrowRight />
                    </Link>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {filteredCourseCount > visibleCount ? (
          <div className="student-catalog-more-row">
            <button
              type="button"
              className="student-catalog-more-button"
              onClick={() => setVisibleCount((count) => count + 4)}
            >
              Show More Programs <FiChevronDown />
            </button>
          </div>
        ) : null}
      </section>

      <section className="student-catalog-cta">
        <div className="student-catalog-cta-copy">
          <h2>Not sure where to start?</h2>
          <p>
            Take a quick assessment, review your learning path, and move into the right track with confidence.
          </p>
        </div>

        <div className="student-catalog-cta-actions">
          <Link className="student-catalog-cta-primary" to="/student/assignments">
            Start Free Assessment <FiArrowRight />
          </Link>

          <Link className="student-catalog-cta-secondary" to="/student/messages">
            Talk to a Career Coach
          </Link>
        </div>
      </section>
    </motion.div>
  );

}

export default StudentCourses;