import {
  useEffect,
  useState
}
  from "react";

import {
  useParams
}
  from "react-router-dom";

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

function CourseDetails() {

  const { id } =
    useParams();

  const [course, setCourse] =
    useState(null);

  const [modules, setModules] =
    useState([]);

  const [loading, setLoading] =
    useState(true);




  useEffect(() => {

    const fetchData =
      async () => {

        try {

          const courseRes =
            await API.get(
              `/courses/${id}`
            );

          setCourse(
            courseRes.data
          );



          const moduleRes =
            await API.get(
              `/modules/${id}`
            );

          setModules(
            moduleRes.data
          );

        }
        catch (error) {

          console.log(error);

        }
        finally {

          setLoading(false);

        }

      };

    fetchData();

  }, [id]);




  if (loading) {

    return (
      <div className="student-loading-shell">
        <div className="student-loading-card">
          <span className="student-spinner" />
          <strong>Loading Course...</strong>
          <span>Preparing your course.</span>
        </div>
      </div>
    );

  }




  return (

    <div>

      <h1>
        {course?.title}
      </h1>

      <p>
        {course?.description}
      </p>



      <hr />



      <h2>
        Modules
      </h2>

      {

        modules.length > 0

          ?

          modules.map((module) => (

            <div key={module._id}>

              <h3>

                Month {module.month}

                :
                {module.title}

              </h3>

              <p>
                {module.description}
              </p>

            </div>

          ))

          :

          <p>
            No modules available
          </p>

      }

    </div>

  );

}

export default CourseDetails;