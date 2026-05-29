import {
  useEffect,
  useState
}
  from "react";

import {
  useAuth
}
  from "../../context/AuthContext";

import API from "../../services/api";

function InstructorNotifications() {

  const { user, loading: authLoading } =
    useAuth();

  const [notifications, setNotifications] =
    useState([]);

  const [formData, setFormData] =
    useState({

      title: "",
      message: "",
      type: "announcement"

    });




  useEffect(() => {

    const fetchNotifications =
      async () => {

        try {

          const res =
            await API.get(
              "/notifications"
            );

          setNotifications(
            res.data
          );

        }
        catch (error) {

          console.log(error);

        }

      };

    fetchNotifications();

  }, []);




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

      if (!user?._id) {

        alert(
          "Please sign in again"
        );

        return;

      }

      try {

        const res =
          await API.post(

            "/notifications",

            {
              user: user._id,
              title: formData.title.trim(),
              message: formData.message.trim(),
              type: formData.type
            }
          );

        setNotifications([

          res.data,
          ...notifications

        ]);

        alert(
          "Notification sent"
        );

      }
      catch (error) {

        console.log(error);

      }

    };



  if (authLoading) {

    return <h1>Loading...</h1>;

  }




  return (

    <div>

      <h1>
        Instructor Notifications
      </h1>



      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="title"
          placeholder="Title"
          onChange={handleChange}
          required
        />

        <textarea
          name="message"
          placeholder="Message"
          onChange={handleChange}
          required
        />

        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
        >

          <option value="announcement">
            Announcement
          </option>

          <option value="system">
            System
          </option>

          <option value="live-class">
            Live Class
          </option>

          <option value="assignment">
            Assignment
          </option>

        </select>

        <button type="submit">

          Send Notification

        </button>

      </form>



      <hr />



      {

        notifications.map((notification) => (

          <div key={notification._id}>

            <h3>
              {notification.title}
            </h3>

            <p>
              {notification.message}
            </p>

            <hr />

          </div>

        ))

      }

    </div>

  );

}

export default InstructorNotifications;