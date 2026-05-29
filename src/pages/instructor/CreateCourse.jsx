import {
  useState
}
  from "react";

import API from "../../services/api";

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function CreateCourse() {

  const [formData, setFormData] =
    useState({

      title: "",
      description: "",
      price: ""

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

          "/courses",

          {

            title: formData.title.trim(),
            slug: `${slugify(formData.title)}-${Date.now()}`,
            description: formData.description.trim(),
            price: Number(formData.price)

          }

        );

        alert(
          "Course created"
        );

      }
      catch (error) {

        console.log(error);

      }

    };




  return (

    <div>

      <h1>
        Create Course
      </h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Course Title"
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
          name="price"
          placeholder="Price"
          onChange={handleChange}
          min="0"
          step="0.01"
          required
        />

        <button type="submit">

          Create Course

        </button>

      </form>

    </div>

  );

}

export default CreateCourse;