import {
  useEffect,
  useState
}
  from "react";

import API from "../../services/api";

function LiveClasses() {

  const [classes, setClasses] =
    useState([]);

  const [loading, setLoading] =
    useState(true);




  useEffect(() => {

    const fetchClasses =
      async () => {

        try {

          const res =
            await API.get(
              "/live-classes/student"
            );

          setClasses(
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

    fetchClasses();

  }, []);



  const handleJoinClass = async (liveClass) => {

    try {

      const res = await API.post(
        `/live-classes/join/${liveClass._id}`
      );

      const meetingLink = res.data?.meetingLink || liveClass.meetingLink;

      if (meetingLink) {
        window.open(meetingLink, "_blank", "noopener,noreferrer");
      }

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
        Live Classes
      </h1>

      {

        classes.length > 0

          ?

          classes.map((liveClass) => (

            <div key={liveClass._id}>

              <h2>
                {liveClass.title}
              </h2>

              <p>

                Instructor:

                {liveClass.instructor?.fullName}

              </p>

              <p>

                Date:

                {
                  new Date(
                    liveClass.startTime
                  ).toLocaleString()
                }

              </p>

              <button
                type="button"
                onClick={() => handleJoinClass(liveClass)}
              >

                Join Class

              </button>

              <hr />

            </div>

          ))

          :

          <p>
            No live classes available
          </p>

      }

    </div>

  );

}

export default LiveClasses;