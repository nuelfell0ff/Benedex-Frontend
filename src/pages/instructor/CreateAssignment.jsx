import {
  useEffect,
  useState
}
  from "react";

import {
  useParams
}
  from "react-router-dom";

import API from "../../services/api";

function CreateAssignment() {

  const { courseId } =
    useParams();

  const [courses, setCourses] =
    useState([]);

  const [modules, setModules] =
    useState([]);

  const [selectedCourse, setSelectedCourse] =
    useState(courseId || "");

  const [formData, setFormData] =
    useState({

      title: "",
      description: "",
      dueDate: "",
      module: ""

    });




  useEffect(() => {

    setSelectedCourse(
      courseId || ""
    );

  }, [courseId]);




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

      };

    fetchCourses();

  }, []);




  useEffect(() => {

    if (!selectedCourse) {

      setModules([]);

      return;

    }

    const fetchModules =
      async () => {

        try {

          const res =
            await API.get(
              `/modules/${selectedCourse}`
            );

          setModules(
            res.data
          );

        }
        catch (error) {

          console.log(error);

        }

      };

    fetchModules();

  }, [selectedCourse]);




  const handleChange =
    (e) => {

      setFormData({

        ...formData,
        [e.target.name]:
          e.target.value

      });

    };




  const handleCourseChange =
    (e) => {

      setSelectedCourse(
        e.target.value
      );

      setFormData({

        ...formData,
        module: ""

      });

    };




  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        await API.post(

          "/assignments",

          {

            title: formData.title.trim(),
            description: formData.description.trim(),
            dueDate: formData.dueDate,
            module: formData.module,
            course: selectedCourse

          }

        );

        alert(
          "Assignment created"
        );

      }
      catch (error) {

        console.log(error);

      }

    };




  return (

    <div>

      <h1>
        Create Assignment
      </h1>

      <form onSubmit={handleSubmit}>

        <select
          value={selectedCourse}
          onChange={handleCourseChange}
          required
        >

          <option value="">

            Select Course

          </option>

          {

            courses.map((course) => (

              <option
                key={course._id}
                value={course._id}
              >

                {course.title}

              </option>

            ))

          }

        </select>

        <input
          type="text"
          name="title"
          placeholder="Assignment Title"
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="description"
          placeholder="Description"
          onChange={handleChange}
          required
        />

        <input
          type="date"
          name="dueDate"
          onChange={handleChange}
          required
        />



        <select
          name="module"
          onChange={handleChange}
          value={formData.module}
          required
        >

          <option value="">

            Select Module

          </option>

          {

            modules.map((module) => (

              <option
                key={module._id}
                value={module._id}
              >

                {module.title}

              </option>

            ))

          }

        </select>



        <button type="submit">

          Create Assignment

        </button>

      </form>

    </div>

  );

}

export default CreateAssignment;