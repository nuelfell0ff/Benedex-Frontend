import "./Assignments.css";

import {
  useEffect,
  useState
}
  from "react";

import API from "../../services/api";

import {

  FiFileText,
  FiUpload,
  FiCheckCircle,
  FiClock,
  FiAward,
  FiMessageSquare

}
  from "react-icons/fi";

function Assignments() {

  const [assignments, setAssignments] =
    useState([]);

  const [submissions, setSubmissions] =
    useState([]);

  const [selectedFiles, setSelectedFiles] =
    useState({});

  const [loading, setLoading] =
    useState(true);



  useEffect(() => {

    const fetchData =
      async () => {

        try {

          const [
            assignmentsRes,
            submissionsRes
          ] = await Promise.all([

            API.get(
              "/assignments"
            ),

            API.get(
              "/assignments/my-submissions"
            )

          ]);

          setAssignments(
            assignmentsRes.data
          );

          setSubmissions(
            submissionsRes.data
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

  }, []);



  const handleFileChange =
    (assignmentId, file) => {

      setSelectedFiles(
        prev => ({

          ...prev,

          [assignmentId]: file

        })
      );

    };



  const handleSubmit =
    async (assignmentId) => {

      try {

        const file =
          selectedFiles[
          assignmentId
          ];

        if (!file) {

          alert(
            "Please select a file"
          );

          return;

        }

        const formData =
          new FormData();

        formData.append(
          "assignment",
          assignmentId
        );

        formData.append(
          "file",
          file
        );

        await API.post(

          "/assignments/submit",

          formData,

          {

            headers: {

              "Content-Type":
                "multipart/form-data"

            }

          }

        );

        const submissionsRes =
          await API.get(
            "/assignments/my-submissions"
          );

        setSubmissions(
          submissionsRes.data
        );

      }
      catch (error) {

        console.log(error);

      }

    };



  const getSubmission =
    (assignmentId) => {

      return submissions.find(

        submission =>

          submission.assignment?._id ===
          assignmentId

      );

    };



  if (loading) {

    return (
      <div className="student-loading-shell">
        <div className="student-loading-card">
          <span className="student-spinner" />
          <strong>Loading Assignments...</strong>
          <span>Preparing available Assignments...</span>
        </div>
      </div>
    );

  }



  const submittedCount =
    submissions.length;

  const pendingCount =
    assignments.length -
    submittedCount;



  return (

    <div className="assignment-page">

      {/* Hero */}

      <div className="assignment-hero">

        <div>

          <h1>
            Assignments
          </h1>

          <p>
            Submit coursework,
            track progress,
            receive grades and
            instructor feedback.
          </p>

        </div>

      </div>



      {/* Stats */}

      <div className="row g-4 mb-4">

        <div className="col-md-4">

          <div className="assignment-stat">

            <FiFileText />

            <h3>
              {assignments.length}
            </h3>

            <span>
              Total Assignments
            </span>

          </div>

        </div>

        <div className="col-md-4">

          <div className="assignment-stat">

            <FiCheckCircle />

            <h3>
              {submittedCount}
            </h3>

            <span>
              Submitted
            </span>

          </div>

        </div>

        <div className="col-md-4">

          <div className="assignment-stat">

            <FiClock />

            <h3>
              {pendingCount}
            </h3>

            <span>
              Pending
            </span>

          </div>

        </div>

      </div>



      <div className="row g-4">

        {

          assignments.map(
            assignment => {

              const submission =
                getSubmission(
                  assignment._id
                );

              return (

                <div
                  className="col-lg-6"
                  key={assignment._id}
                >

                  <div className="assignment-card">

                    <div className="assignment-header">

                      <h3>
                        {assignment.title}
                      </h3>

                      {

                        submission

                          ?

                          <span className="status submitted">

                            Submitted

                          </span>

                          :

                          <span className="status pending">

                            Pending

                          </span>

                      }

                    </div>



                    <p className="assignment-description">

                      {
                        assignment.description
                      }

                    </p>



                    <div className="assignment-meta">

                      <div>

                        <FiClock />

                        <span>

                          Due:

                          {

                            new Date(
                              assignment.dueDate
                            ).toLocaleDateString()

                          }

                        </span>

                      </div>

                    </div>



                    {

                      submission &&

                      <div className="submission-box">

                        <div>

                          <FiCheckCircle />

                          Submitted Successfully

                        </div>

                        {

                          submission.grade !==
                          null &&

                          <div className="grade-box">

                            <FiAward />

                            Grade:

                            {
                              submission.grade
                            }%

                          </div>

                        }

                        {

                          submission.feedback &&

                          <div className="feedback-box">

                            <FiMessageSquare />

                            {
                              submission.feedback
                            }

                          </div>

                        }

                      </div>

                    }



                    {

                      !submission &&

                      <>

                        <input

                          type="file"

                          className="form-control"

                          onChange={(e) =>

                            handleFileChange(

                              assignment._id,

                              e.target.files[0]

                            )

                          }

                        />



                        <button

                          className="submit-btn"

                          onClick={() =>

                            handleSubmit(
                              assignment._id
                            )

                          }

                        >

                          <FiUpload />

                          Submit Assignment

                        </button>

                      </>

                    }

                  </div>

                </div>

              );

            }

          )

        }

      </div>

    </div>

  );

}

export default Assignments;