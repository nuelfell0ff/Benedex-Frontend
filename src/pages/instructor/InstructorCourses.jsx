import "./InstructorCourses.css";

import {
  useEffect,
  useState
} from "react";

import {
  Link
} from "react-router-dom";

import API from "../../services/api";

import {
  FiBook,
  FiPlus,
  FiLayers,
  FiFileText,
  FiUsers,
  FiBarChart2
} from "react-icons/fi";

function InstructorCourses() {

  const [courses, setCourses] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const fetchCourses =
      async () => {

        try {

          const res =
            await API.get(
              "/courses"
            );

          setCourses(
            res.data
          );

        }
        catch (error) {

          console.log(error);

        }
        finally {

          setLoading(false);

        }

      };

    fetchCourses();

  }, []);

  if (loading) {

    return (
      <div className="loading-page">
        Loading courses...
      </div>
    );

  }

  return (

    <div className="instructor-courses-page">

      <div className="page-header">

        <div>

          <h1>
            Course Management
          </h1>

          <p>
            Create and manage all learning content.
          </p>

        </div>

        <Link
          to="/instructor/create-course"
          className="create-course-btn"
        >

          <FiPlus />

          Create Course

        </Link>

      </div>

      <div className="row g-4">

        {

          courses.map((course) => (

            <div
              className="col-lg-6"
              key={course._id}
            >

              <div className="course-card">

                <div className="course-banner">

                  {

                    course.image

                      ?

                      <img
                        src={course.image}
                        alt={course.title}
                      />

                      :

                      <div className="placeholder-banner">

                        <FiBook />

                      </div>

                  }

                </div>

                <div className="course-body">

                  <h3>

                    {course.title}

                  </h3>

                  <p>

                    {course.description}

                  </p>

                  <div className="course-meta">

                    <span>

                      ₦{
                        Number(
                          course.price
                        ).toLocaleString()
                      }

                    </span>

                    <span>

                      {
                        course.students?.length || 0
                      }

                      Students

                    </span>

                  </div>

                  <div className="course-actions">

                    <Link

                      to={`/instructor/course/${course._id}`}

                      className="action-btn"

                    >

                      <FiBook />

                      Course

                    </Link>

                    <Link

                      to={`/instructor/create-module/${course._id}`}

                      className="action-btn"

                    >

                      <FiLayers />

                      Modules

                    </Link>

                    {/* <Link

                      to={`/instructor/lessons/${course._id}`}

                      className="action-btn"

                    >

                      <FiFileText />

                      Lessons

                    </Link> */}

                    <Link

                      to={`/instructor/create-assignment/${course._id}`}

                      className="action-btn"

                    >

                      <FiFileText />

                      Assignments

                    </Link>

                    <Link

                      to={`/instructor/students/${course._id}`}

                      className="action-btn"

                    >

                      <FiUsers />

                      Students

                    </Link>

                    <Link

                      to={`/instructor/analytics/${course._id}`}

                      className="action-btn"

                    >

                      <FiBarChart2 />

                      Analytics

                    </Link>

                  </div>

                </div>

              </div>

            </div>

          ))

        }

      </div>

    </div>

  );

}

export default InstructorCourses;