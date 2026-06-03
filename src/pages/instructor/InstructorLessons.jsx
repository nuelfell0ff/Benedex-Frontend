import "./InstructorLessons.css";

import {
  useEffect,
  useState
} from "react";

import {
  useParams,
  Link
} from "react-router-dom";

import API from "../../services/api";

import {
  FiVideo,
  FiFileText,
  FiFile,
  FiPlus,
  FiBookOpen,
  FiHelpCircle
} from "react-icons/fi";

function InstructorLessons() {

  const { moduleId } = useParams();

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    type: "video",
    order: 1,
    content: "",
    videoUrl: "",
    documentUrl: ""
  });



  const fetchLessons = async () => {

    try {

      const res =
        await API.get(
          `/lessons/module/${moduleId}`
        );

      setLessons(res.data);

    }
    catch (error) {

      console.log(error);

    }
    finally {

      setLoading(false);

    }

  };



  useEffect(() => {

    fetchLessons();

  }, [moduleId]);



  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value

    });

  };



  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setCreating(true);

      await API.post(
        "/lessons",
        {
          title: formData.title,
          type: formData.type,
          module: moduleId,
          order: Number(formData.order),
          content: formData.content,
          videoUrl: formData.videoUrl,
          documentUrl: formData.documentUrl
        }
      );

      setFormData({
        title: "",
        type: "video",
        order: lessons.length + 2,
        content: "",
        videoUrl: "",
        documentUrl: ""
      });

      fetchLessons();

    }
    catch (error) {

      console.log(error);

    }
    finally {

      setCreating(false);

    }

  };



  const getIcon = (type) => {

    switch (type) {

      case "video":
        return <FiVideo />;

      case "document":
        return <FiFile />;

      default:
        return <FiFileText />;

    }

  };



  if (loading) {

    return (

      <div className="loading-page">

        Loading lessons...

      </div>

    );

  }



  return (

    <div className="instructor-lessons-page">

      <div className="lessons-header">

        <div>

          <h1>

            <FiBookOpen />

            Lesson Builder

          </h1>

          <p>

            Create, organize and manage
            lessons inside this module.

          </p>

        </div>



        <div className="header-actions">

          <Link
            to={`/instructor/quiz-builder/${moduleId}`}
            className="quiz-builder-btn"
          >

            <FiHelpCircle />

            Create Quiz

          </Link>

        </div>

      </div>



      <div className="lesson-builder-grid">

        <div className="lesson-form-card">

          <h3>

            Add New Lesson

          </h3>

          <form onSubmit={handleSubmit}>

            <div className="form-group">

              <label>

                Lesson Title

              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Introduction to React"
                required
              />

            </div>



            <div className="form-group">

              <label>

                Lesson Type

              </label>

              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
              >

                <option value="video">

                  Video Lesson

                </option>

                <option value="text">

                  Text Lesson

                </option>

                <option value="document">

                  Document Lesson

                </option>

              </select>

            </div>



            <div className="form-group">

              <label>

                Lesson Order

              </label>

              <input
                type="number"
                min="1"
                name="order"
                value={formData.order}
                onChange={handleChange}
                required
              />

            </div>



            {

              formData.type === "video" &&

              <div className="form-group">

                <label>

                  Video URL

                </label>

                <input
                  type="text"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  placeholder="https://youtube.com/..."
                />

              </div>

            }



            {

              formData.type === "document" &&

              <div className="form-group">

                <label>

                  Document URL

                </label>

                <input
                  type="text"
                  name="documentUrl"
                  value={formData.documentUrl}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/..."
                />

              </div>

            }



            {

              formData.type === "text" &&

              <div className="form-group">

                <label>

                  Lesson Content

                </label>

                <textarea
                  rows="8"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Write your lesson content..."
                />

              </div>

            }



            <button
              type="submit"
              className="create-lesson-btn"
            >

              {

                creating

                  ?

                  "Creating Lesson..."

                  :

                  <>

                    <FiPlus />

                    Create Lesson

                  </>

              }

            </button>

          </form>

        </div>



        <div className="lesson-list-card">

          <h3>

            Module Lessons

            ({lessons.length})

          </h3>



          {

            lessons.length > 0

              ?

              lessons.map((lesson) => (

                <div
                  key={lesson._id}
                  className="lesson-item"
                >

                  <div className="lesson-icon">

                    {getIcon(lesson.type)}

                  </div>



                  <div className="lesson-content">

                    <h4>

                      {lesson.title}

                    </h4>

                    <p>

                      {lesson.type}

                      •

                      Lesson {lesson.order}

                    </p>

                  </div>

                </div>

              ))

              :

              <div className="empty-lessons">

                No lessons have been added yet.

              </div>

          }

        </div>

      </div>

    </div>

  );

}

export default InstructorLessons;