import { NavLink } from "react-router-dom";

function Sidebar({ links }) {
  return (
    <aside className="student-sidebar">
      <div className="student-sidebar-brand">
        <span className="student-sidebar-mark" aria-hidden="true">
          {links[0]?.icon ?? null}
        </span>
        <div className="student-sidebar-brand-copy">
          <strong>Benedex Digital</strong>
          <span>Premium Learning</span>
        </div>
      </div>

      <nav className="student-sidebar-nav" aria-label="Student navigation">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === "/student"}
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
    </aside>

  );

}

export default Sidebar;