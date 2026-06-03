import "./InstructorQuizBuilder.css";

import {
  useState
}
from "react";

import {
  useParams,
  useNavigate
}
from "react-router-dom";

import API from "../../services/api";

import {
  FiPlus,
  FiTrash2,
  FiCheckCircle,
  FiHelpCircle,
  FiSave
}
from "react-icons/fi";

function InstructorQuizBuilder() {

  const { moduleId } =
    useParams();

  const navigate =
    useNavigate();

  const [loading, setLoading] =
    useState(false);

  const [quizData, setQuizData] =
    useState({

      title: "",
      description: "",
      passMark: 70

    });

  const [questions, setQuestions] =
    useState([
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: ""
      }
    ]);



  const handleQuizChange =
    (e) => {

      setQuizData({

        ...quizData,
        [e.target.name]:
          e.target.value

      });

    };



  const handleQuestionChange =
    (index, value) => {

      const updated =
        [...questions];

      updated[index].question =
        value;

      setQuestions(updated);

    };



  const handleOptionChange =
    (
      qIndex,
      optionIndex,
      value
    ) => {

      const updated =
        [...questions];

      updated[qIndex]
        .options[optionIndex] =
        value;

      setQuestions(updated);

    };



  const handleCorrectAnswer =
    (
      qIndex,
      value
    ) => {

      const updated =
        [...questions];

      updated[qIndex]
        .correctAnswer =
        value;

      setQuestions(updated);

    };



  const addQuestion =
    () => {

      setQuestions([

        ...questions,

        {
          question: "",
          options: [
            "",
            "",
            "",
            ""
          ],
          correctAnswer: ""
        }

      ]);

    };



  const removeQuestion =
    (index) => {

      if (
        questions.length === 1
      ) return;

      const updated =
        questions.filter(

          (_, i) =>
            i !== index

        );

      setQuestions(updated);

    };



  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        await API.post(

          "/quizzes",

          {

            title:
              quizData.title,

            description:
              quizData.description,

            passMark:
              Number(
                quizData.passMark
              ),

            module:
              moduleId,

            questions

          }

        );

        alert(
          "Quiz created successfully"
        );

        navigate(-1);

      }
      catch (error) {

        console.log(error);

      }
      finally {

        setLoading(false);

      }

    };



  return (

    <div className="quiz-builder-page">

      <div className="quiz-header">

        <h1>

          <FiHelpCircle />

          Quiz Builder

        </h1>

        <p>

          Create assessments
          for your students.

        </p>

      </div>



      <form
        onSubmit={handleSubmit}
      >

        <div className="quiz-card">

          <div className="form-group">

            <label>
              Quiz Title
            </label>

            <input

              type="text"

              name="title"

              value={
                quizData.title
              }

              onChange={
                handleQuizChange
              }

              required

            />

          </div>



          <div className="form-group">

            <label>
              Description
            </label>

            <textarea

              rows="4"

              name="description"

              value={
                quizData.description
              }

              onChange={
                handleQuizChange
              }

            />

          </div>



          <div className="form-group">

            <label>
              Pass Mark (%)
            </label>

            <input

              type="number"

              min="1"

              max="100"

              name="passMark"

              value={
                quizData.passMark
              }

              onChange={
                handleQuizChange
              }

              required

            />

          </div>

        </div>



        {

          questions.map(

            (
              question,
              qIndex
            ) => (

              <div
                key={qIndex}
                className="question-card"
              >

                <div className="question-top">

                  <h3>

                    Question

                    {

                      qIndex + 1

                    }

                  </h3>

                  <button

                    type="button"

                    className="delete-btn"

                    onClick={() =>
                      removeQuestion(
                        qIndex
                      )
                    }

                  >

                    <FiTrash2 />

                  </button>

                </div>



                <input

                  type="text"

                  placeholder="Enter question"

                  value={
                    question.question
                  }

                  onChange={(e) =>
                    handleQuestionChange(
                      qIndex,
                      e.target.value
                    )
                  }

                  required

                />



                <div className="options-grid">

                  {

                    question.options.map(

                      (
                        option,
                        optionIndex
                      ) => (

                        <input

                          key={
                            optionIndex
                          }

                          type="text"

                          placeholder={`Option ${
                            optionIndex + 1
                          }`}

                          value={
                            option
                          }

                          onChange={(e) =>
                            handleOptionChange(
                              qIndex,
                              optionIndex,
                              e.target.value
                            )
                          }

                          required

                        />

                      )

                    )

                  }

                </div>



                <select

                  value={
                    question.correctAnswer
                  }

                  onChange={(e) =>
                    handleCorrectAnswer(
                      qIndex,
                      e.target.value
                    )
                  }

                  required

                >

                  <option value="">
                    Select Correct Answer
                  </option>

                  {

                    question.options.map(

                      (
                        option,
                        index
                      ) => (

                        <option
                          key={index}
                          value={option}
                        >

                          {
                            option ||
                            `Option ${
                              index + 1
                            }`
                          }

                        </option>

                      )

                    )

                  }

                </select>

              </div>

            )

          )

        }



        <button

          type="button"

          className="add-question-btn"

          onClick={addQuestion}

        >

          <FiPlus />

          Add Question

        </button>



        <button

          type="submit"

          className="save-quiz-btn"

        >

          {

            loading

              ?

              "Saving..."

              :

              <>

                <FiSave />

                Save Quiz

              </>

          }

        </button>

      </form>

    </div>

  );

}

export default InstructorQuizBuilder;