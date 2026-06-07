import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../../services/api";
import {
  FiBookOpen,
  FiUsers,
  FiClock,
  FiCheckSquare,
  FiPlus,
  FiTrendingUp,
  FiAlertTriangle,
  FiArrowRight,
  FiActivity,
  FiBarChart2,
  FiLoader,
  FiCpu
} from "react-icons/fi";
import "./InstructorDashboard.css";

function InstructorDashboard() {
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);
  
  // Real State Registers connected to API payloads
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    completionRate: 0,
    pendingGrading: 0,
    activeCourses: 0
  });
  
  const [courses, setCourses] = useState([]);
  const [weeklyEngagement, setWeeklyEngagement] = useState([]);
  const [atRiskStudents, setAtRiskStudents] = useState([]);

  useEffect(() => {
    const fetchDashboardTelemetry = async () => {
      try {
        setLoading(true);
        setErrorState(null);
        
        // Parallelized network dispatches to optimize performance pipelines
        const [metricsRes, coursesRes, engagementRes, analyticsRes] = await Promise.all([
          API.get("/instructor/analytics/overview"),
          API.get("/instructor/courses"),
          API.get("/instructor/analytics/weekly-engagement"),
          API.get("/instructor/analytics/students-at-risk")
        ]);

        setMetrics(metricsRes.data);
        setCourses(coursesRes.data);
        setWeeklyEngagement(engagementRes.data); 
        setAtRiskStudents(analyticsRes.data);
      } catch (error) {
        console.error("Critical dashboard telemetry fetch failure:", error);
        setErrorState("Pipeline Synchronization Error: Check backend routing connectivity.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardTelemetry();
  }, []);

  if (loading) {
    return (
      <div className="bx-id-loading-screen d-flex flex-column align-items-center justify-content-center">
        <FiLoader className="bx-id-spinner" size={40} />
        <p className="mt-3 text-muted font-weight-bold">Compiling Real-Time LMS Telemetry...</p>
      </div>
    );
  }

  if (errorState) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger d-inline-block px-4 py-3" role="alert">
          <FiAlertTriangle className="me-2" /> {errorState}
        </div>
      </div>
    );
  }

  return (
    <div className="bx-id-workspace container-fluid py-4">
      
      {/* PREMIUM REDESIGNED CONSOLE HEADER */}
      <header className="bx-id-premium-banner mb-4">
        <div className="row align-items-center g-3">
          <div className="col-12 col-md-7 col-lg-8">
            <div className="d-flex align-items-center gap-3">
              <div className="bx-id-header-icon-box">
                <FiCpu size={24} />
                <span className="bx-id-pulse-indicator" />
              </div>
              <div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <h1 className="bx-id-main-title mb-0">Instructor Command Terminal</h1>
                  <span className="bx-id-system-badge">v2.4 Live</span>
                </div>
                <p className="bx-id-subtitle mb-0">
                  Monitor course performance indicators, evaluate telemetry tracking charts, and deploy syllabus blueprints.
                </p>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-5 col-lg-4 text-md-end">
            <Link to="/instructor/courses/new" className="bx-id-action-trigger-btn">
              <FiPlus size={18} />
              <span>Initialize Course Blueprint</span>
            </Link>
          </div>
        </div>
      </header>

      {/* METRIC KPI MONITOR STRIPS */}
      <section className="row g-3 mb-4">
        {[
          { label: "Aggregate Registered Students", val: metrics.totalStudents.toLocaleString(), icon: <FiUsers />, color: "blue" },
          { label: "Mean Completion Rate", val: `${metrics.completionRate}%`, icon: <FiTrendingUp />, color: "green" },
          { label: "Pending Evaluation Queue", val: metrics.pendingGrading, icon: <FiCheckSquare />, color: "amber" },
          { label: "Active Syllabus Managed", val: metrics.activeCourses, icon: <FiBookOpen />, color: "purple" }
        ].map((kpi, idx) => (
          <div className="col-12 col-sm-6 col-xl-3" key={idx}>
            <div className="bx-id-kpi-card">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="bx-id-kpi-label">{kpi.label}</span>
                  <h2 className="bx-id-kpi-val mb-0 mt-1">{kpi.val}</h2>
                </div>
                <div className={`bx-id-kpi-icon-wrapper is-${kpi.color}`}>
                  {kpi.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* MID-LEVEL RESPONSIVE MATRIX: CHART vs GRADING QUEUE */}
      <section className="row g-4 mb-4">
        <div className="col-12 col-lg-8">
          <div className="bx-id-card-panel h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="bx-id-panel-title mb-0">
                <FiBarChart2 />
                <span>Weekly Student Engagement Curve</span>
              </h3>
              <span className="bx-id-badge-info">Live Telemetry</span>
            </div>
            
            <div className="bx-id-chart-placeholder-frame d-flex align-items-end justify-content-between px-1">
              {weeklyEngagement.length > 0 ? (
                weeklyEngagement.map((height, idx) => (
                  <div className="bx-id-chart-column-wrapper d-flex flex-column align-items-center flex-grow-1" key={idx}>
                    <motion.div 
                      className="bx-id-chart-bar" 
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.04 }}
                    />
                    <span className="bx-id-chart-label-text mt-2">Wk {idx + 1}</span>
                  </div>
                ))
              ) : (
                <div className="w-100 text-center py-5 text-muted small">No structural tracking metrics calculated yet for this period.</div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="bx-id-card-panel h-100 d-flex flex-column">
            <h3 className="bx-id-panel-title mb-3">
              <FiCheckSquare />
              <span>Pending Grading Queue</span>
            </h3>
            
            <div className="bx-id-grading-scroll-list d-flex flex-column gap-2 flex-grow-1">
              {courses.some(c => c.pendingTasks?.length > 0) ? (
                courses.flatMap(c => c.pendingTasks || []).map((item, idx) => (
                  <div className="bx-id-grading-item-row" key={idx}>
                    <div className="min-w-0 flex-grow-1">
                      <h4 className="bx-id-grading-task-title text-truncate mb-1">{item.taskName}</h4>
                      <span className="bx-id-mini-tag">{item.courseCode}</span>
                    </div>
                    <div className="text-end flex-shrink-0">
                      <span className="bx-id-time-elapsed d-block mb-1"><FiClock size={11} /> {item.submittedAt}</span>
                      <Link to={`/instructor/evaluate/${item.submissionId}`} className="bx-id-row-action-link text-decoration-none small font-weight-bold">Evaluate</Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bx-id-empty-queue-message text-center py-5 m-auto">
                  <p className="text-muted small mb-0">Grading clear. No items pending human verification arrays.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* LOWER RESPONSIVE MATRIX: COURSE SHELVES vs RISK MONITORS */}
      <section className="row g-4">
        <div className="col-12 col-xl-8">
          <div className="bx-id-card-panel">
            <h3 className="bx-id-panel-title mb-4">
              <FiBookOpen />
              <span>Active Course Directory Architecture</span>
            </h3>

            <div className="row g-3">
              {courses.length > 0 ? (
                courses.map((course) => (
                  <div className="col-12" key={course._id || course.id}>
                    <div className="bx-id-course-strip-card">
                      <div className="row g-3 align-items-center">
                        <div className="col-12 col-md-6">
                          <h4 className="bx-id-course-strip-title mb-2">{course.title}</h4>
                          <div className="d-flex flex-wrap gap-2 gap-md-3 text-muted small">
                            <span><strong>{course.studentsCount}</strong> Enrolled Students</span>
                            <span className="d-none d-sm-inline">•</span>
                            <span><strong>{course.modulesCount}</strong> Architecture Modules</span>
                          </div>
                        </div>

                        <div className="col-12 col-md-4">
                          <div className="d-flex justify-content-between align-items-center mb-1 small text-muted">
                            <span>Mean Course Completion</span>
                            <span className="font-weight-bold text-dark">{course.completionRate}%</span>
                          </div>
                          <div className="bx-id-progress-track">
                            <div className="bx-id-progress-bar" style={{ width: `${course.completionRate}%` }} />
                          </div>
                        </div>

                        <div className="col-12 col-md-2 text-end">
                          <Link to={`/instructor/lessons/module/${course._id || course.id}`} className="bx-id-arrow-btn w-100 w-md-auto" title="Open module system builder">
                            <FiArrowRight />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center py-5">
                  <p className="text-muted small">No course records mapped to this instructor identity block.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="bx-id-card-panel">
            <div className="d-flex align-items-center gap-2 mb-2">
              <FiAlertTriangle className="text-warning" size={18} />
              <h3 className="bx-id-panel-title mb-0">Student At-Risk Radar</h3>
            </div>
            <p className="text-muted small mb-3">Identifies student performance records dropping significantly below baseline course benchmarks.</p>

            <div className="table-responsive">
              <table className="bx-id-radar-table w-100">
                <thead>
                  <tr>
                    <th>Student Node</th>
                    <th>Engagement Delta</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {atRiskStudents.length > 0 ? (
                    atRiskStudents.map((student, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className="bx-id-student-name d-block">{student.studentName}</span>
                          <span className="bx-id-student-meta text-muted">{student.lastActiveWindow}</span>
                        </td>
                        <td>
                          <span className="bx-id-deviation-badge">{student.performanceDropPercentage}% Drop</span>
                        </td>
                        <td className="text-end">
                          <button type="button" className="bx-id-action-icon-btn" title="Dispatch intervention notification">
                            <FiArrowRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center py-4 text-muted small">All tracking lines are within normal operational parameters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default InstructorDashboard;