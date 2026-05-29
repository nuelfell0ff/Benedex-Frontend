import {
  useEffect,
  useState
}
  from "react";

import API from "../../services/api";

function GradeSubmissions() {

  const [submissions, setSubmissions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [grades, setGrades] =
    useState({});

  const [feedbacks, setFeedbacks] =
    useState({});




  useEffect(() => {

    const fetchSubmissions =
      async () => {

        try {

          const res =
            await API.get(
              "/assignments/submissions"
            );

          setSubmissions(
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

    fetchSubmissions();

  }, []);




  const handleGradeChange =
    (submissionId, value) => {

      setGrades({

        ...grades,

        [submissionId]: value

      });

    };




  const handleFeedbackChange =
    (submissionId, value) => {

      setFeedbacks({

        ...feedbacks,

        [submissionId]: value

      });

    };




  const handleGradeSubmission =
    async (submissionId) => {

      try {

        await API.put(

          `/assignments/grade/${submissionId}`,

          {

            grade:
              grades[submissionId],

            feedback:
              feedbacks[submissionId]

          }

        );

        alert(
          "Submission graded"
        );

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
        Grade Submissions
      </h1>



      {

        submissions.length > 0

          ?

          submissions.map((submission) => (

            <div key={submission._id}>

              <h2>

                {
                  submission.assignment?.title
                }

              </h2>



              <p>

                Student:

                {
                  submission.student?.fullName
                }

              </p>



              <p>

                Status:

                {
                  submission.status
                }

              </p>



              <a

                href={
                  submission.fileUrl
                }

                target="_blank"

              >

                View Submission

              </a>



              <br />
              <br />



              <input

                type="number"

                placeholder="Grade"

                value={
                  grades[submission._id] || ""
                }

                onChange={(e) =>

                  handleGradeChange(

                    submission._id,
                    e.target.value

                  )

                }

              />



              <br />
              <br />



              <textarea

                placeholder="Feedback"

                value={
                  feedbacks[submission._id] || ""
                }

                onChange={(e) =>

                  handleFeedbackChange(

                    submission._id,
                    e.target.value

                  )

                }

              />



              <br />
              <br />



              <button

                onClick={() =>

                  handleGradeSubmission(
                    submission._id
                  )

                }

              >

                Submit Grade

              </button>

              <hr />

            </div>

          ))

          :

          <p>
            No submissions found
          </p>

      }

    </div>

  );

}

export default GradeSubmissions;