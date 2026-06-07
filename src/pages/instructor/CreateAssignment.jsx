import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import { 
  FiFileText, 
  FiLayers, 
  FiCalendar, 
  FiBookOpen, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiArrowLeft, 
  FiPlusSquare 
} from "react-icons/fi";
import "./CreateAssignment.css";

function CreateAssignment() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(courseId || "");
  
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingModules, setLoadingModules] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Custom feedback toast notifications state management
  const [toastNotification, setToastNotification] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    module: ""
  });

  // Sync route URL parameter updates if navigated dynamically
  useEffect(() => {
    if (courseId) {
      setSelectedCourse(courseId);
    }
  }, [courseId]);

  // Phase 1: Pull course directory scope assigned to the logged-in user context
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        // Using your instructor course endpoint ensures teachers only create assignments for their own classes
        const res = await API.get("/courses/instructor/my-courses");
        setCourses(res.data || []);
      } catch (error) {
        console.error("Failed to query course directory scopes:", error);
        showToast("error", "Failed to load instructor course pathways.");
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  // Phase 2: Reactive Module Syncing when the selected course parameters change
  useEffect(() => {
    if (!selectedCourse) {
      setModules([]);
      return;
    }

    const fetchModules = async () => {
      try {
        setLoadingModules(true);
        const res = await API.get(`/modules/${selectedCourse}`);
        setModules(res.data || []);
      } catch (error) {
        console.error("Backend modular structural query error:", error);
        showToast("error", "Failed to retrieve associated syllabus modules.");
      } finally {
        setLoadingModules(false);
      }
    };

    fetchModules();
  }, [selectedCourse]);

  const showToast = (type, message) => {
    setToastNotification({ type, message });
    setTimeout(() => setToastNotification(null), 4000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
    setFormData({
      ...formData,
      module: "" // Wipe previous selection to prevent indexing mismatches
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !formData.module) {
      showToast("error", "Please ensure course and syllabus module criteria are met.");
      return;
    }

    try {
      setIsSubmitting(true);
      await API.post("/assignments", {
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDate: formData.dueDate,
        module: formData.module,
        course: selectedCourse
      });

      showToast("success", "Task compiled! Assignment distributed to class tracking lists.");
      
      // Clear entry form states safely
      setFormData({ title: "", description: "", dueDate: "", module: "" });
    } catch (error) {
      console.error("Downstream compilation submission error:", error);
      showToast("error", error.response?.data?.message || "Failed to commit task item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingCourses) {
    return (
      <div className="bx-task-loader-screen">
        <div className="bx-task-spinner" />
        <p>Syncing Academic Course Pathways...</p>
      </div>
    );
  }

  return (
    <div className="bx-task-workspace container-fluid py-4 position-relative">
      
      {/* NOTIFICATION FEEDBACK RADAR TOAST PANEL */}
      <AnimatePresence>
        {toastNotification && (
          <motion.div 
            className={`bx-task-toast-alert ${toastNotification.type}`}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {toastNotification.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
            <span>{toastNotification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DASHBOARD HEADER CONSOLE CONTROLS */}
      <header className="bx-task-header d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <div className="bx-task-title-zone">
          <div className="d-flex align-items-center gap-2 mb-1">
            {/* <button 
              type="button" 
              className="bx-task-back-btn" 
              onClick={() => navigate(-1)}
              title="Return to previous dashboard framework"
            >
              <FiArrowLeft />
            </button> */}
            <h1 className="h3 mb-0 text-dark font-weight-bold">Task Composer</h1>
          </div>
          <p className="text-muted mb-0 small">Publish and distribute new programmatic assignment guidelines down to student nodes.</p>
        </div>
      </header>

      {/* TWO-COLUMN GRID IMPLEMENTATION LAYOUT */}
      <div className="row g-4">
        
        {/* COMPOSER FORM SUBMISSION TIER */}
        <div className="col-12 col-xl-8">
          <motion.div 
            className="bx-task-card-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, cubicBezier: [0.16, 1, 0.3, 1] }}
          >
            <div className="bx-card-header-node mb-4">
              <FiPlusSquare className="bx-card-title-icon" />
              <div>
                <h2 className="h5 mb-1 font-weight-bold">Assignment Specifications</h2>
                <span className="small text-muted">All parameters are required for deployment synchronization.</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bx-task-form-layout d-flex flex-column gap-3">
              
              <div className="row g-3">
                {/* COURSE IDENTIFICATION PICKER DROP SELECTOR */}
                <div className="col-12 col-md-6">
                  <div className="bx-task-input-field">
                    <label htmlFor="selectedCourse"><FiBookOpen /> Targeted Class Track</label>
                    <select
                      id="selectedCourse"
                      value={selectedCourse}
                      onChange={handleCourseChange}
                      required
                    >
                      <option value="">Choose Targeted Course Scope...</option>
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* MODULE STRUCTURAL SELECTOR DROP SELECTOR */}
                <div className="col-12 col-md-6">
                  <div className="bx-task-input-field">
                    <label htmlFor="module"><FiLayers /> Connected Syllabus Module</label>
                    <select
                      id="module"
                      name="module"
                      value={formData.module}
                      onChange={handleChange}
                      disabled={!selectedCourse || loadingModules}
                      required
                    >
                      {loadingModules ? (
                        <option value="">Querying associated tracks...</option>
                      ) : !selectedCourse ? (
                        <option value="">Awaiting course parameter choice...</option>
                      ) : modules.length === 0 ? (
                        <option value="">No Active Curriculum Modules Found</option>
                      ) : (
                        <>
                          <option value="">Choose Target Curriculum Block...</option>
                          {modules.map((mod) => (
                            <option key={mod._id} value={mod._id}>
                              {mod.title}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* ASSIGNMENT TITLE MATRIX LAYER */}
              <div className="bx-task-input-field">
                <label htmlFor="title"><FiFileText /> Project Assignment Title</label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  placeholder="e.g., Build functional UI using React Hooks..."
                  value={formData.title}
                  onChange={handleChange}
                  maxLength={120}
                  required
                />
              </div>

              {/* EXPLICIT INSTRUCTIONAL DESCRIPTION GRID FIELD */}
              <div className="bx-task-input-field">
                <label htmlFor="description"><FiFileText /> Grading Deliverables & Specifications</label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  placeholder="Detail explicit coding parameters, environment constraints, and submittal targets..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* TIMELINE SCHEDULING INTERFACE INPUT */}
              <div className="bx-task-input-field col-12 col-md-6 px-0">
                <label htmlFor="dueDate"><FiCalendar /> Hard Deadline Timeline Target</label>
                <input
                  id="dueDate"
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]} // Blocks back-dating submission guidelines
                  required
                />
              </div>

              {/* TRIGGER DEPLOYMENT CONTROL TIER */}
              <div className="bx-task-action-row pt-2 d-flex justify-content-end">
                <button 
                  type="submit" 
                  className="bx-task-submit-cta btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="bx-task-spinner-sm me-2" />
                      <span>Distributing Roster Frameworks...</span>
                    </>
                  ) : (
                    <span>Publish Assignment</span>
                  )}
                </button>
              </div>

            </form>
          </motion.div>
        </div>

        {/* SIDE CONTEXT SUMMARY DISPLAY SYSTEM */}
        <div className="col-12 col-xl-4">
          <div className="bx-task-sidebar-briefing d-flex flex-column gap-3">
            <div className="bx-briefing-card text-white">
              <h4>Deployment Framework</h4>
              <p className="small mb-0 opacity-75">Once dispatched, this task initializes analytical progress charts for every enrolled student participant profile instantly.</p>
            </div>
            
            <div className="bx-briefing-card outlined">
              <h5>Curriculum Integrity Checklist</h5>
              <ul className="small mb-0 ps-3 text-muted d-flex flex-column gap-2 mt-2">
                <li>Assign tasks to modules to group assignments appropriately.</li>
                <li>Set deadlines clearly to avoid automated late-grade penalties.</li>
                <li>Provide clean text criteria for self-guided student workflows.</li>
              </ul>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default CreateAssignment;