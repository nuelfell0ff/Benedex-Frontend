import {
  useEffect,
  useState
} from "react";

import API from "../../services/api";

function InstructorLiveClasses() {

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [classes, setClasses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(false);
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
        setCourses(res.data);

        if (res.data.length > 0) {
          setSelectedCourse(res.data[0]._id);
        }
      }
      catch (error) {
        console.log(error);
      }
      finally {
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
        setClasses(res.data);
      }
      catch (error) {
        console.log(error);
      }
      finally {
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
      alert("Select a course first");
      return;
    }

    try {
      const res = await API.post(
        "/live-classes",
        {
          title: formData.title.trim(),
          description: formData.description.trim(),
          course: selectedCourse,
          meetingLink: formData.meetingLink.trim(),
          platform: formData.platform,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString()
        }
      );

      setClasses((currentClasses) => [
        res.data,
        ...currentClasses
      ]);

      alert("Live class created");
    }
    catch (error) {
      console.log(error);
    }
  };

  if (loadingCourses || loadingClasses) {
    return <h1>Loading...</h1>;
  }

  return (
    <div>
      <h1>
        Instructor Live Classes
      </h1>

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

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Class Title"
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="meetingLink"
          placeholder="Meeting Link"
          onChange={handleChange}
          required
        />

        <select
          name="platform"
          value={formData.platform}
          onChange={handleChange}
          required
        >
          <option value="zoom">
            Zoom
          </option>
          <option value="google-meet">
            Google Meet
          </option>
        </select>

        <input
          type="datetime-local"
          name="startTime"
          onChange={handleChange}
          required
        />

        <input
          type="datetime-local"
          name="endTime"
          onChange={handleChange}
          required
        />

        <button type="submit">
          Create Live Class
        </button>
      </form>

      <hr />

      {
        classes.map((liveClass) => (
          <div key={liveClass._id}>
            <h2>
              {liveClass.title}
            </h2>

            <p>
              {liveClass.description}
            </p>

            <p>
              Start:
              {
                new Date(
                  liveClass.startTime
                ).toLocaleString()
              }
            </p>

            <p>
              End:
              {
                new Date(
                  liveClass.endTime
                ).toLocaleString()
              }
            </p>

            <a
              href={liveClass.meetingLink}
              target="_blank"
            >
              Open Meeting
            </a>

            <hr />
          </div>
        ))
      }
    </div>
  );

}

export default InstructorLiveClasses;
