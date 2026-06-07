import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import {
  FiUsers,
  FiLayers,
  FiSearch,
  FiMail,
  FiUserCheck,
  FiInbox,
  FiHash,
  FiTrendingUp,
  FiMessageSquare
} from "react-icons/fi";
import "./InstructorStudents.css";

function InstructorStudents() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Phase 1: Pull down available courses containing populated student objects
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await API.get("/courses/instructor/my-courses");
        const courseData = res.data || [];
        setCourses(courseData);

        if (courseData.length > 0) {
          setSelectedCourse(courseData[0]._id);
          setStudents(courseData[0].students || []);
        }
      } catch (error) {
        console.error("Failed to query course directory indexes:", error);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  // Phase 2: Reactively sync students to the frontend state when the dropdown select shifts
  useEffect(() => {
    if (!selectedCourse) {
      setStudents([]);
      return;
    }

    const currentCourseMatch = courses.find(c => c._id === selectedCourse);
    if (currentCourseMatch) {
      setStudents(currentCourseMatch.students || []);
    }
  }, [selectedCourse, courses]);

  // Navigate directly to the messaging router path, pushing the student object along
  const handleMessageStudent = (student) => {
    const activeCourseMatch = courses.find(c => c._id === selectedCourse);

    navigate("/instructor/messages", {
      state: {
        redirectedFromRoster: true,
        targetStudentData: {
          _id: student._id,
          fullName: student.fullName || student.name || "Unverified Profile",
          profileImage: student.profileImage,
          email: student.email,
          role: student.role || "student",
          courseContext: activeCourseMatch ? activeCourseMatch.title : "Enrolled Course"
        }
      }
    });
  };

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
    setSearchQuery("");
  };

  const filteredStudents = students.filter(student => {
    const lookupTarget = (student.fullName || student.name || "").toLowerCase();
    const emailTarget = (student.email || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    return lookupTarget.includes(query) || emailTarget.includes(query);
  });

  if (loadingCourses) {
    return (
      <div className="bx-roster-loader-screen">
        <div className="bx-roster-spinner" />
        <p>Syncing Student Registry Paths...</p>
      </div>
    );
  }

  return (
    <div className="bx-roster-workspace">
      {/* HEADER BAR CONSOLE */}
      <header className="bx-roster-header">
        <div className="bx-roster-title-zone">
          <h1>Student Rosters</h1>
          <p>Monitor active course enrollments, verify student parameters, and initialize direct communication paths.</p>
        </div>

        {/* TRACKING SCOPE FILTER INTERFACE */}
        <div className="bx-roster-course-picker">
          <label htmlFor="roster-course-select"><FiLayers /> Selected Course Scope</label>
          <div className="bx-roster-dropdown">
            <select
              id="roster-course-select"
              value={selectedCourse}
              onChange={handleCourseChange}
              required
            >
              {courses.length === 0 && <option value="">No Active Courses</option>}
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* METRIC CARD BRIEFINGS TIER */}
      <div className="bx-roster-metrics-grid">
        <div className="bx-roster-mini-card">
          <div className="bx-mini-card-icon"><FiUsers /></div>
          <div className="bx-mini-card-text">
            <span className="bx-mini-label">Total Course Enrollment</span>
            <span className="bx-mini-value">{students.length} Students</span>
          </div>
        </div>
        <div className="bx-roster-mini-card">
          <div className="bx-mini-card-icon verified"><FiUserCheck /></div>
          <div className="bx-mini-card-text">
            <span className="bx-mini-label">Roster Search Yield</span>
            <span className="bx-mini-value">{filteredStudents.length} Found</span>
          </div>
        </div>
      </div>

      {/* MAIN DATA VIEW CONTROLLER PLATFORM */}
      <div className="bx-roster-table-panel">
        <div className="bx-table-toolbar-row">
          <h2>Roster Manifest</h2>

          <div className="bx-table-search-box">
            <FiSearch className="bx-search-inline-icon" />
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={students.length === 0}
            />
          </div>
        </div>

        {/* DATA MATRIX VIEWPORT */}
        <div className="bx-table-viewport-wrapper">
          {filteredStudents.length > 0 ? (
            <table className="bx-premium-data-table">
              <thead>
                <tr>
                  <th><FiHash /> Index</th>
                  <th>Student Identity Name</th>
                  <th>Email Matrix Address</th>
                  <th>Enrollment Status</th>
                  <th className="bx-th-actions">Communication Channels</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filteredStudents.map((student, idx) => (
                    <motion.tr
                      key={student._id || idx}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.3) }}
                    >
                      <td className="bx-td-index">{(idx + 1).toString().padStart(2, '0')}</td>
                      <td className="bx-td-identity">
                        <div className="bx-td-avatar-placeholder">
                          {(student.fullName || student.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <span className="bx-td-name">
                          {student.fullName || student.name || "Unverified Profile"}
                        </span>
                      </td>
                      <td className="bx-td-email">
                        <span className="bx-email-pill">
                          <FiMail /> {student.email || "N/A"}
                        </span>
                      </td>
                      <td className="bx-td-status">
                        <span className="bx-table-active-tag">
                          <FiTrendingUp /> Active
                        </span>
                      </td>
                      <td className="bx-td-actions">
                        <button
                          type="button"
                          className="bx-table-chat-action-btn"
                          onClick={() => handleMessageStudent(student)}
                          title={`Open chat window with ${student.fullName || student.name}`}
                        >
                          <FiMessageSquare /> <span>Message</span>
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          ) : (
            <div className="bx-roster-empty-state">
              <div className="bx-roster-empty-icon">
                <FiInbox />
              </div>
              <h3>Roster Directory Clear</h3>
              <p>
                {students.length === 0
                  ? "No student profiles are registered under this course track at present."
                  : "No student parameters inside this directory match your search query."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InstructorStudents;