import "./CreateModule.css";

import {
  useState
} from "react";

import {
  useParams,
  useNavigate
} from "react-router-dom";

import API from "../../services/api";

import {
  FiLayers,
  FiBookOpen,
  FiHash,
  FiArrowRight
}
from "react-icons/fi";

function CreateModule() {

  const { courseId } =
    useParams();

  const navigate =
    useNavigate();

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({

      title: "",
      description: "",
      month: 1,
      order: 1

    });



  const handleChange =
    (e) => {

      setFormData({

        ...formData,

        [e.target.name]:
          e.target.value

      });

    };



  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        await API.post(

          "/modules",

          {

            title:
              formData.title.trim(),

            description:
              formData.description.trim(),

            course:
              courseId,

            month:
              Number(
                formData.month
              ),

            order:
              Number(
                formData.order
              ),

            content: []

          }

        );

        alert(
          "Module created successfully"
        );

        navigate(
          `/instructor/course/${courseId}`
        );

      }
      catch (error) {

        console.log(error);

      }
      finally {

        setLoading(false);

      }

    };



  return (

    <div className="create-module-page">

      <div className="module-header">

        <div>

          <h1>

            <FiLayers />

            Create Module

          </h1>

          <p>

            Organize your course into structured learning modules.

          </p>

        </div>

      </div>



      <div className="module-card">

        <form
          onSubmit={handleSubmit}
        >

          <div className="form-group">

            <label>

              Module Title

            </label>

            <div className="input-wrapper">

              <FiBookOpen />

              <input

                type="text"

                name="title"

                value={
                  formData.title
                }

                onChange={
                  handleChange
                }

                placeholder="Introduction to UI Design"

                required

              />

            </div>

          </div>



          <div className="form-group">

            <label>

              Description

            </label>

            <textarea

              name="description"

              value={
                formData.description
              }

              onChange={
                handleChange
              }

              rows="5"

              placeholder="Describe what students will learn..."

              required

            />

          </div>



          <div className="row">

            <div className="col-md-6">

              <div className="form-group">

                <label>

                  Learning Month

                </label>

                <div className="input-wrapper">

                  <FiHash />

                  <input

                    type="number"

                    min="1"

                    name="month"

                    value={
                      formData.month
                    }

                    onChange={
                      handleChange
                    }

                    required

                  />

                </div>

              </div>

            </div>



            <div className="col-md-6">

              <div className="form-group">

                <label>

                  Module Order

                </label>

                <div className="input-wrapper">

                  <FiHash />

                  <input

                    type="number"

                    min="1"

                    name="order"

                    value={
                      formData.order
                    }

                    onChange={
                      handleChange
                    }

                    required

                  />

                </div>

              </div>

            </div>

          </div>



          <button

            type="submit"

            className="create-module-btn"

            disabled={loading}

          >

            {

              loading

                ?

                "Creating..."

                :

                <>

                  Create Module

                  <FiArrowRight />

                </>

            }

          </button>

        </form>

      </div>

    </div>

  );

}

export default CreateModule;