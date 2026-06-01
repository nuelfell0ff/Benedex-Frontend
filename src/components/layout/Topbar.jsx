import { FiBell, FiChevronDown, FiSearch } from "react-icons/fi";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

function Topbar() {
  const { user } = useAuth();

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
        <Link className="student-icon-button" to="/student/notifications" aria-label="Notifications">
          <FiBell />
        </Link>

        <div className="student-user-chip">
          <span className="student-user-avatar" aria-hidden="true">
            {initials}
          </span>
          <div className="student-user-copy">
            <strong>{user?.fullName || "Kwame Mensah"}</strong>
            <span>Level 12 Warrior</span>
          </div>
          <FiChevronDown aria-hidden="true" className="student-user-chevron" />
        </div>
      </div>
    </header>
  );

}

export default Topbar;