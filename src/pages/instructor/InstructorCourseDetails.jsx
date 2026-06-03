import "./InstructorCourseDetails.css";

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../services/api";

import {
  FiLayers,
  FiPlus,
  FiBookOpen,
  FiUser,
  FiCheckCircle
} from "react-icons/fi";

function InstructorCourseDetails() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await API.get(`/courses/${courseId}`);
        setCourse(courseRes.data);

        const modulesRes = await API.get(`/modules/${courseId}`);
        setModules(modulesRes.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  if (loading) return <h1>Loading...</h1>;

  return (
    <div className="instructor-course-details">
      <div className="course-header">
        <h1>{course.title}</h1>
        <p>{course.description}</p>
        <div className="course-actions">
          <Link
            to={`/instructor/create-module/${course._id}`}
            className="action-btn create-module-btn"
          >
            <FiPlus /> Add Module
          </Link>
          <Link
            to={`/instructor/create-assignment/${course._id}`}
            className="action-btn create-assignment-btn"
          >
            <FiBookOpen /> Add Assignment
          </Link>
        </div>
      </div>

      <div className="modules-list">
        {modules.length === 0 && <p>No modules created yet.</p>}
        {modules.map((module) => (
          <div key={module._id} className="module-card">
            <div className="module-header">
              <h2>
                <FiLayers /> {module.title}
              </h2>
              <span className="module-info">
                Month {module.month} | Order {module.order} | Lessons{" "}
                {module.content.length}
              </span>
            </div>

            <div className="module-actions">
              <Link
                to={`/instructor/lessons/${module._id}`}
                className="action-btn"
              >
                <FiBookOpen /> Manage Lessons
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InstructorCourseDetails;