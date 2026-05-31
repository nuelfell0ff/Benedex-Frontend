import { FiBell, FiChevronDown, FiLogOut, FiSearch } from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";

function Topbar() {
  const { user, logout } = useAuth();

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
        <button type="button" className="student-icon-button" aria-label="Notifications">
          <FiBell />
        </button>

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

        <button
          type="button"
          className="student-icon-button student-logout-button"
          onClick={logout}
          aria-label="Sign out"
        >
          <FiLogOut />
        </button>
      </div>
    </header>
  );

}

export default Topbar;