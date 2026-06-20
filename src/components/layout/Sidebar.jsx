import { NavLink } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

function Sidebar({ links }) {
  const { logout } = useAuth();

  return (
    <aside className="student-sidebar">
      <Link to="/" className="bx-nav-brand-group">
        <div className="bx-nav-logo-box">
        </div>
        <span className="bx-nav-brand-text student-sidebar-brand-copy">Benedex</span>
      </Link>

      <nav className="student-sidebar-nav" aria-label="Student navigation">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === "/student" || link.path === "/instructor" || link.path === "/admin"}
            className={({ isActive }) =>
              `student-sidebar-link${isActive ? " is-active" : ""}`
            }
          >
            <span className="student-sidebar-icon" aria-hidden="true">
              {link.icon}
            </span>
            <span className="student-sidebar-label">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="student-sidebar-footer">
        <button
          type="button"
          className="student-sidebar-logout"
          onClick={logout}
          aria-label="Sign out"
        >
          <span className="student-sidebar-icon" aria-hidden="true">
            <FiLogOut />
          </span>
          <span className="student-sidebar-label">Logout</span>
        </button>
      </div>
    </aside>

  );

}

export default Sidebar;