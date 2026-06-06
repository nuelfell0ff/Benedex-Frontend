import { useEffect, useState } from "react";

import { FiBell, FiChevronDown, FiSearch } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";

import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Topbar() {
  const { user } = useAuth();
  const location = useLocation();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchNotifications = async () => {
      try {
        const res = await API.get("/dashboard/student");
        const count = res.data?.unreadActivityCount || 0;

        if (isMounted) {
          setNotificationCount(count);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchNotifications();

    const handleActivitiesUpdated = () => {
      fetchNotifications();
    };

    window.addEventListener("student-activities-updated", handleActivitiesUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener("student-activities-updated", handleActivitiesUpdated);
    };
  }, [location.pathname]);

  const initials = (user?.fullName || "Student")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="student-topbar">
      <label className="student-search" htmlFor="student-search-input">
        <FiSearch aria-hidden="true" />
        <input
          id="student-search-input"
          type="search"
          placeholder="Search courses, mentors, or topics..."
          aria-label="Search courses, mentors, or topics"
        />
      </label>

      <div className="student-top-actions">
        <Link className="student-icon-button student-notification-button" to="/student/notifications" aria-label="Notifications">
          <FiBell />
          {notificationCount > 0 ? (
            <span className="student-notification-badge" aria-label={`${notificationCount} new notifications`}>
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          ) : null}
        </Link>

        <div className="student-user-chip">
          <span className="student-user-avatar" aria-hidden="true">
            {initials}
          </span>
          <div className="student-user-copy">
            <strong>{user?.fullName || "Kwame Mensah"}</strong>
            <span>{user.role}</span>
          </div>
          <FiChevronDown aria-hidden="true" className="student-user-chevron" />
        </div>
      </div>
    </header>
  );

}

export default Topbar;