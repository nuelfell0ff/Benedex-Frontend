import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";
import { 
  FiTv, 
  FiPlusCircle, 
  FiBookOpen, 
  FiLink, 
  FiClock, 
  FiCalendar, 
  FiVideo, 
  FiExternalLink,
  FiLayers,
  FiBox
} from "react-icons/fi";
import { SiZoom, SiGooglemeet } from "react-icons/si";
import "./InstructorLiveClasses.css";

function InstructorLiveClasses() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [classes, setClasses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    meetingLink: "",
    platform: "zoom",
    startTime: "",
    endTime: ""
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await API.get("/courses");
        setCourses(res.data || []);

        if (res.data && res.data.length > 0) {
          setSelectedCourse(res.data[0]._id);
        }
      } catch (error) {
        console.error("Failed to query instructor course layout indices:", error);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourse) {
      setClasses([]);
      return;
    }

    const fetchClasses = async () => {
      try {
        setLoadingClasses(true);
        const res = await API.get(`/live-classes/${selectedCourse}`);
        setClasses(res.data || []);
      } catch (error) {
        console.error("Failed to fetch stream schedules for target course identifier:", error);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [selectedCourse]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCourse) {
      alert("Please map this schedule configuration to an active course trajectory first.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await API.post("/live-classes", {
        title: formData.title.trim(),
        description: formData.description.trim(),
        course: selectedCourse,
        meetingLink: formData.meetingLink.trim(),
        platform: formData.platform,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString()
      });

      setClasses((currentClasses) => [res.data, ...currentClasses]);
      
      // Flush form inputs cleanly upon successful write sequence
      setFormData({
        title: "",
        description: "",
        meetingLink: "",
        platform: "zoom",
        startTime: "",
        endTime: ""
      });
    } catch (error) {
      console.error("Failed to compile and transmit stream schedule allocation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper calculation engine for clean layout date timestamps
  const formatScheduleDate = (isoString) => {
    const targetDate = new Date(isoString);
    return {
      date: targetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      time: targetDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loadingCourses) {
    return (
      <div className="bx-live-loader-screen">
        <div className="bx-live-spinner" />
        <p>Resolving Academic Faculty Catalogs...</p>
      </div>
    );
  }

  return (
    <div className="bx-live-workspace-container">
      {/* SECTION PANEL HEADLINE HEADER */}
      <header className="bx-live-header-panel">
        <div className="bx-live-title-block">
          <h1>Live Classes Manager</h1>
          <p>Orchestrate live stream classrooms, broadcast telemetry vectors, and maintain synchronized video links across course scopes.</p>
        </div>

        {/* TARGET SELECT SELECTOR MODULE */}
        <div className="bx-course-select-module">
          <label htmlFor="course-filter-select"><FiLayers /> Active Tracking Scope</label>
          <div className="bx-custom-dropdown">
            <select
              id="course-filter-select"
              value={selectedCourse}
              onChange={handleCourseChange}
              required
            >
              <option value="">Select Course Target...</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* TWO-COLUMN ARCHITECTURE TIER */}
      <div className="bx-live-split-matrix">
        
        {/* COLUMN LEFT: SCHEDULER MATRIX FORM */}
        <div className="bx-live-form-column">
          <h2>Deploy Live Broadcast</h2>
          <form onSubmit={handleSubmit} className="bx-live-premium-form">
            <div className="bx-live-field-row">
              <label>Class Title Session</label>
              <input
                type="text"
                name="title"
                placeholder="e.g., Matrix Transformations & Linear Calculus"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="bx-live-field-row">
              <label>Brief Stream Description</label>
              <textarea
                name="description"
                placeholder="Provide comprehensive agenda details, pre-requisite code modules, or instructional updates..."
                rows={3}
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="bx-live-form-grid-inner">
              <div className="bx-live-field-row">
                <label><FiLink /> Stream Target Link</label>
                <input
                  type="text"
                  name="meetingLink"
                  placeholder="https://..."
                  value={formData.meetingLink}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="bx-live-field-row">
                <label><FiVideo /> Telemetry Platform</label>
                <div className="bx-custom-dropdown">
                  <select
                    name="platform"
                    value={formData.platform}
                    onChange={handleChange}
                    required
                  >
                    <option value="zoom">Zoom Video</option>
                    <option value="google-meet">Google Meet</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bx-live-form-grid-inner">
              <div className="bx-live-field-row">
                <label><FiCalendar /> Windows Start Time</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="bx-live-field-row">
                <label><FiClock /> Windows End Time</label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <motion.button
              type="submit"
              className="bx-live-submit-action-btn"
              disabled={isSubmitting || !selectedCourse}
              whileHover={{ y: -1 }}
              whileTap={{ y: 1 }}
            >
              {isSubmitting ? (
                <span className="bx-live-inline-loader" />
              ) : (
                <><PlusCircle /> Launch Streaming Slot</>
              )}
            </motion.button>
          </form>
        </div>

        {/* COLUMN RIGHT: ACTIVE CHANNEL TIMELINE STREAM */}
        <div className="bx-live-feed-column">
          <div className="bx-feed-meta-row">
            <h2>Active Schedules</h2>
            <span className="bx-feed-count-tag">{classes.length} Slotted</span>
          </div>

          <div className="bx-live-scroll-frame">
            {loadingClasses ? (
              <div className="bx-inner-feed-loader">
                <div className="bx-live-spinner-small" />
                <p>Syncing Dynamic Course Stream Registries...</p>
              </div>
            ) : classes.length > 0 ? (
              <div className="bx-classes-vertical-stack">
                <AnimatePresence mode="popLayout">
                  {classes.map((liveClass, index) => {
                    const startMeta = formatScheduleDate(liveClass.startTime);
                    const endMeta = formatScheduleDate(liveClass.endTime);
                    const isZoom = liveClass.platform === "zoom";

                    return (
                      <motion.article
                        key={liveClass._id || index}
                        className="bx-live-class-card"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.35, delay: index * 0.04 }}
                      >
                        <div className="bx-class-card-top">
                          <span className={`bx-platform-badge ${isZoom ? "zoom-theme" : "meet-theme"}`}>
                            {isZoom ? <SiZoom className="bx-p-icon" /> : <SiGooglemeet className="bx-p-icon" />}
                            {isZoom ? "Zoom Workspace" : "Google Meet"}
                          </span>
                          
                          <div className="bx-class-duration-badge">
                            <FiClock /> {startMeta.time} - {endMeta.time}
                          </div>
                        </div>

                        <h3>{liveClass.title}</h3>
                        <p className="bx-class-card-desc">{liveClass.description}</p>

                        <div className="bx-class-card-footer">
                          <div className="bx-footer-date-stamp">
                            <FiCalendar /> <span>{startMeta.date}</span>
                          </div>
                          
                          <a
                            href={liveClass.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="bx-join-stream-action"
                          >
                            Initialize Channel <FiExternalLink />
                          </a>
                        </div>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              /* EMPTY CHANNELS SYSTEM BANNER FALLBACK */
              <motion.div 
                className="bx-live-empty-banner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="bx-live-empty-icon-box">
                  <FiBox />
                </div>
                <h3>No Streams Configured</h3>
                <p>There are no active live streams cataloged under the selected tracking dashboard path at this time.</p>
              </motion.div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Minimal placeholder component replacement rule matching the scope logic seamlessly
function PlusCircle(props) {
  return <FiPlusCircle {...props} style={{ inlineSize: "16px", blockSize: "16px", ...props.style }} />;
}

export default InstructorLiveClasses;