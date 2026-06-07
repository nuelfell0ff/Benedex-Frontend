import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../../services/api";
import {
  FiBook,
  FiPlus,
  FiLayers,
  FiFileText,
  FiUsers,
  FiBarChart2,
  FiTrendingUp,
  FiDollarSign,
  FiInbox
} from "react-icons/fi";
import "./InstructorCourses.css";

function InstructorCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Pull down class instances assigned to the logged-in instructor account context
        const res = await API.get("/courses");
        setCourses(res.data || []);
      } catch (error) {
        console.error("Failed to query catalog structures from database:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Compute summary aggregate data values safely over runtime arrays
  const totalStudentsEnrolled = courses.reduce((acc, curr) => acc + (curr.students?.length || 0), 0);
  const totalPremiumEarnings = courses.reduce((acc, curr) => {
    const enrollmentCount = curr.students?.length || 0;
    const ratePrice = Number(curr.price) || 0;
    return acc + (enrollmentCount * ratePrice);
  }, 0);

  if (loading) {
    return (
      <div className="bx-catalog-loader-screen">
        <div className="bx-catalog-spinner" />
        <p>Assembling Course Catalog Interfaces...</p>
      </div>
    );
  }

  return (
    <div className="bx-catalog-workspace container-fluid py-4">

      {/* MANAGEMENT CORE CONSOLE HEADER CONTAINER */}
      <header className="bx-catalog-header d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <div className="bx-catalog-title-zone">
          <h1 className="h3 mb-1 text-dark font-weight-bold">Course Management</h1>
          <p className="text-muted mb-0 small">Construct curriculum pathways, deploy programmatic assignments, and audit active roster metrics.</p>
        </div>

        <Link to="/instructor/create-course" className="bx-catalog-create-btn">
          <FiPlus />
          <span>Create New Course</span>
        </Link>
      </header>

      {/* AGGREGATE PLATFORM METRICS RIBBON TIER */}
      {courses.length > 0 && (
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <div className="bx-catalog-mini-metric">
              <div className="bx-mini-metric-icon"><FiBook /></div>
              <div className="bx-mini-metric-text">
                <span className="bx-mini-metric-label">Active Catalogs</span>
                <span className="bx-mini-metric-value">{courses.length} Classes</span>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="bx-catalog-mini-metric">
              <div className="bx-mini-metric-icon enrolled"><FiUsers /></div>
              <div className="bx-mini-metric-text">
                <span className="bx-mini-metric-label">Managed Roster Volume</span>
                <span className="bx-mini-metric-value">{totalStudentsEnrolled} Students</span>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="bx-catalog-mini-metric">
              <div className="bx-mini-metric-icon revenue"><FiTrendingUp /></div>
              <div className="bx-mini-metric-text">
                <span className="bx-mini-metric-label">Estimated Gross Revenue</span>
                <span className="bx-mini-metric-value">₦{totalPremiumEarnings.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CORE CATALOG DATA ELEMENT GRID PLACEMENT */}
      {courses.length > 0 ? (
        <div className="row g-4">
          {courses.map((course, idx) => (
            <div className="col-12 col-xl-6" key={course._id}>
              <motion.div
                className="bx-catalog-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.4) }}
              >

                {/* GRAPHIC BANNER SUB-SECTION ZONE */}
                <div className="bx-catalog-card-banner">
                  {course.image ? (
                    <img src={course.image} alt={course.title} loading="lazy" />
                  ) : (
                    <div className="bx-catalog-placeholder-gfx">
                      <FiBook className="bx-gfx-fallback-icon" />
                      <span>Benedex Virtual Workspace</span>
                    </div>
                  )}
                  <div className="bx-catalog-card-price-badge">
                    <FiDollarSign />
                    <span>{Number(course.price) === 0 ? "Free Track" : `₦${Number(course.price).toLocaleString()}`}</span>
                  </div>
                </div>

                {/* METADATA EXPLANATION DESCRIPTION CORPUS ZONE */}
                <div className="bx-catalog-card-body">
                  <div className="bx-card-body-meta mb-2 d-flex align-items-center gap-2">
                    <span className="bx-card-body-students-pill">
                      <FiUsers /> {(course.students?.length || 0)} Enrolled
                    </span>
                  </div>

                  <h3 className="h5 mb-2 font-weight-bold text-dark text-truncate" title={course.title}>
                    {course.title}
                  </h3>

                  <p className="text-muted small mb-4 bx-line-clamp-desc">
                    {course.description || "No supplemental details provided for this curriculum registry track yet."}
                  </p>

                  {/* ACTION PANEL STRATEGIC MATRIX LINKS ROW */}
                  <div className="bx-catalog-card-actions-grid">
                    <Link to={`/instructor/course/${course._id}`} className="bx-catalog-action-link" title="Open syllabus details">
                      <FiBook />
                      <span>Curriculum</span>
                    </Link>

                    <Link to={`/instructor/create-module/${course._id}`} className="bx-catalog-action-link" title="Configure modular framework units">
                      <FiLayers />
                      <span>Modules</span>
                    </Link>

                    <Link to={`/instructor/create-assignment/${course._id}`} className="bx-catalog-action-link" title="Draft programmatic student task goals">
                      <FiFileText />
                      <span>Assignments</span>
                    </Link>

                    <Link to={`/instructor/students/${course._id}`} className="bx-catalog-action-link" title="Audit enrolled student user identities">
                      <FiUsers />
                      <span>Students</span>
                    </Link>

                    <Link to={`/instructor/course/${course._id}`} className="bx-catalog-action-link primary-accent" title="Analyze instructional progression parameters">
                      <FiBarChart2 />
                      <span>Analytics</span>
                    </Link>
                  </div>

                </div>

              </motion.div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bx-catalog-empty-layout">
          <div className="bx-catalog-empty-icon">
            <FiInbox />
          </div>
          <h3>No Managed Classes</h3>
          <p>You have not published any class parameters inside this portal environment registry yet.</p>
          <Link to="/instructor/create-course" className="bx-catalog-create-btn mx-auto mt-2">
            <FiPlus /> <span>Initialize First Course Instance</span>
          </Link>
        </div>
      )}

    </div>
  );
}

export default InstructorCourses;