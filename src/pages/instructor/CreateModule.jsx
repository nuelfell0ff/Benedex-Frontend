import {
  useState
}
  from "react";

import {
  useParams
}
  from "react-router-dom";

import API from "../../services/api";

function CreateModule() {

  const { courseId } =
    useParams();

  const [formData, setFormData] =
    useState({

      title: "",
      description: "",
      month: 1,
      order: 1,
      videoUrl: ""

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
              Number(formData.month),

            order:
              Number(formData.order),

            content: [

              {

                title: "Lesson",
                videoUrl:
                  formData.videoUrl

              }

            ]

          }

        );

        alert(
          "Module created"
        );

      }
      catch (error) {

        console.log(error);

      }

    };




  return (

    <div>

      <h1>
        Create Module
      </h1>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="title"
          placeholder="Module Title"
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
          type="number"
          name="month"
          placeholder="Month"
          onChange={handleChange}
          min="1"
          required
        />

        <input
          type="number"
          name="order"
          placeholder="Order"
          onChange={handleChange}
          min="1"
          required
        />

        <input
          type="text"
          name="videoUrl"
          placeholder="Video URL"
          onChange={handleChange}
          required
        />

        <button type="submit">

          Create Module

        </button>

      </form>

    </div>

  );

}

export default CreateModule;