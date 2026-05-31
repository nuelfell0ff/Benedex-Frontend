import {
  useEffect,
  useState
}
  from "react";

import {
  Link
}
  from "react-router-dom";

import API from "../../services/api";

function StudentCourses() {

  const [courses, setCourses] =
    useState([]);

  const [enrolledCourseIds, setEnrolledCourseIds] =
    useState(new Set());

  const [loading, setLoading] =
    useState(true);




  useEffect(() => {

    const fetchCourses =
      async () => {

        try {

          const [coursesRes, dashboardRes] = await Promise.all([
            API.get("/courses"),
            API.get("/dashboard/student")
          ]);

          setCourses(
            coursesRes.data
          );

          const enrolledIds = new Set(
            (dashboardRes.data?.enrolledCourses || []).map(
              (course) => course._id
            )
          );

          setEnrolledCourseIds(enrolledIds);

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




  const handleEnroll =
    async (courseId) => {

      if (enrolledCourseIds.has(courseId)) {
        return;
      }

      try {

        const res = await API.post("/payments/initialize", {
          courseId,
          callbackUrl: `${window.location.origin}/payments/callback`
        });

        const url = res.data.authorization_url;
        if (url) {
          // redirect current window to paystack so Paystack will redirect back to our callback with reference
          window.location.href = url;
        }

      }
      catch (error) {

        console.log(error);

      }

    };




  if (loading) {

    return <h1>Loading...</h1>;

  }




  return (

    <div>

      <h1>
        Courses
      </h1>



      {

        courses.map((course) => (

          <div key={course._id}>

            <h2>
              {course.title}
            </h2>

            <p>
              {course.description}
            </p>

            <p>

              Price:

              ₦{course.price}

            </p>



            <button
              disabled={enrolledCourseIds.has(course._id)}

              onClick={() => handleEnroll(
                course._id
              )}

            >

              {enrolledCourseIds.has(course._id) ? "Paid / Enrolled" : "Enroll"}

            </button>



            <Link
              to={`/student/courses/${course._id}`}
            >

              <button>

                View Course

              </button>

            </Link>

            <hr />

          </div>

        ))

      }

    </div>

  );

}

export default StudentCourses;