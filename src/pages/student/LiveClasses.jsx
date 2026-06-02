import "./LiveClasses.css";
import { useEffect, useState } from "react";
import API from "../../services/api";

import {
  FiVideo,
  FiCalendar,
  FiUsers,
  FiPlayCircle,
  FiClock,
  FiActivity
} from "react-icons/fi";

import { BsBroadcast } from "react-icons/bs";

function LiveClasses() {

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchClasses = async () => {

      try {

        const res = await API.get(
          "/live-classes/student"
        );

        setClasses(res.data);

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

      const meetingLink =
        res.data?.meetingLink ||
        liveClass.meetingLink;

      if (meetingLink) {

        window.open(
          meetingLink,
          "_blank",
          "noopener,noreferrer"
        );

      }

    }
    catch (error) {

      console.log(error);

    }

  };



  const upcomingClasses =
    classes.filter(
      item =>
        new Date(item.startTime) >
        new Date()
    );



  if (loading) {

    return (
      <div className="student-loading-shell">
        <div className="student-loading-card">
          <span className="student-spinner" />
          <strong>Loading Live Classes...</strong>
          <span>Preparing available Live Classes.</span>
        </div>
      </div>
    );

  }



  return (

    <div className="live-page">

      {/* Hero */}

      <div className="live-hero">

        <div>

          <span className="hero-tag">

            <BsBroadcast />

            Live Learning

          </span>

          <h1>
            Live Classes
          </h1>

          <p>
            Join scheduled sessions,
            workshops, mentorship calls
            and interactive classes with
            your instructors.
          </p>

        </div>

        <div className="hero-stats">

          <div>

            <strong>
              {classes.length}
            </strong>

            <span>
              Total Classes
            </span>

          </div>

        </div>

      </div>

      {/* Stats Row */}

      <div className="row g-4 mb-4">

        <div className="col-lg-4">

          <div className="stats-card">

            <div className="stats-icon">
              <FiVideo />
            </div>

            <h3>
              {classes.length}
            </h3>

            <p>
              Available Classes
            </p>

          </div>

        </div>

        <div className="col-lg-4">

          <div className="stats-card">

            <div className="stats-icon">
              <FiCalendar />
            </div>

            <h3>
              {upcomingClasses.length}
            </h3>

            <p>
              Upcoming Sessions
            </p>

          </div>

        </div>

        <div className="col-lg-4">

          <div className="stats-card">

            <div className="stats-icon">
              <FiActivity />
            </div>

            <h3>
              Active
            </h3>

            <p>
              Learning Journey
            </p>

          </div>

        </div>

      </div>

      {/* Classes Grid */}

      {

        classes.length > 0

          ?

          <div className="row g-4">

            {

              classes.map((liveClass) => (

                <div
                  className="col-lg-6 col-xl-4"
                  key={liveClass._id}
                >

                  <div className="class-card">

                    <div className="class-top">

                      <div className="class-status">

                        <BsBroadcast />

                        Live Session

                      </div>

                    </div>

                    <h3>
                      {liveClass.title}
                    </h3>

                    <div className="class-info">

                      <div className="info-row">

                        <FiUsers />

                        <span>

                          {
                            liveClass
                              .instructor
                              ?.fullName
                          }

                        </span>

                      </div>

                      <div className="info-row">

                        <FiCalendar />

                        <span>

                          {
                            new Date(
                              liveClass.startTime
                            ).toLocaleDateString()
                          }

                        </span>

                      </div>

                      <div className="info-row">

                        <FiClock />

                        <span>

                          {
                            new Date(
                              liveClass.startTime
                            ).toLocaleTimeString()
                          }

                        </span>

                      </div>

                    </div>

                    <button
                      className="join-btn"
                      onClick={() =>
                        handleJoinClass(
                          liveClass
                        )
                      }
                    >

                      <FiPlayCircle />

                      Join Class

                    </button>

                  </div>

                </div>

              ))

            }

          </div>

          :

          <div className="empty-state">

            <div className="empty-icon">

              <FiVideo />

            </div>

            <h3>
              No Live Classes Yet
            </h3>

            <p>
              Scheduled classes will
              appear here once your
              instructors create them.
            </p>

          </div>

      }

    </div>

  );

}

export default LiveClasses;