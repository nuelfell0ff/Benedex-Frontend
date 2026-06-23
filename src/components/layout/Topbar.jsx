import { useEffect, useState, useRef } from "react";
import { FiBell, FiChevronDown, FiSearch } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";

import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";

// Master list of all layout link targets across all profiles
const ALL_DASHBOARD_PAGES = [
  // Student Scope
  { label: "Dashboard Home", path: "/student", role: "student" },
  { label: "My Courses", path: "/student/courses", role: "student" },
  { label: "Assignments", path: "/student/assignments", role: "student" },
  { label: "Live Classes", path: "/student/live-classes", role: "student" },
  { label: "Messages", path: "/student/messages", role: "student" },
  { label: "Notifications", path: "/student/notifications", role: "student" },
  
  // Instructor Scope
  { label: "Dashboard Home", path: "/instructor", role: "instructor" },
  { label: "Courses", path: "/instructor/courses", role: "instructor" },
  { label: "Assignments", path: "/instructor/assignments", role: "instructor" },
  { label: "Students", path: "/instructor/students", role: "instructor" },
  { label: "Live Classes", path: "/instructor/live-classes", role: "instructor" },
  { label: "Notifications", path: "/instructor/notifications", role: "instructor" },
  { label: "Messages", path: "/instructor/messages", role: "instructor" },
  { label: "Grade Submissions", path: "/instructor/grade-submissions", role: "instructor" },

  // Admin Scope
  { label: "Dashboard Home", path: "/admin", role: "admin" },
  { label: "Users Management", path: "/admin/users", role: "admin" },
  { label: "Courses Management", path: "/admin/courses", role: "admin" },
  { label: "Payments & Invoices", path: "/admin/payments", role: "admin" },
  { label: "Analytics Overview", path: "/admin/analytics", role: "admin" },
  { label: "System Settings", path: "/admin/settings", role: "admin" }
];

function Topbar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [notificationCount, setNotificationCount] = useState(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Normalize active user role securely
  const currentRole = user?.role?.toLowerCase() || "student";

  useEffect(() => {
    let isMounted = true;
    const fetchNotifications = async () => {
      try {
        // Dynamic endpoint path adjustment based on active route spaces
        const endpoint = currentRole === "student" ? "/dashboard/student" : `/dashboard/${currentRole}`;
        const res = await API.get(endpoint);
        const count = res.data?.unreadActivityCount || 0;

        if (isMounted) setNotificationCount(count);
      } catch (error) {
        console.log("Notification load bypass:", error);
      }
    };

    fetchNotifications();

    const handleActivitiesUpdated = () => { fetchNotifications(); };
    window.addEventListener(`${currentRole}-activities-updated`, handleActivitiesUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener(`${currentRole}-activities-updated`, handleActivitiesUpdated);
    };
  }, [location.pathname, currentRole]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync Search queries & filter parameters natively
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // 1. STAGE ROLE VALIDATION: Filter navigation routes matching ONLY the active profile
    const allowedPages = ALL_DASHBOARD_PAGES.filter(page => page.role === currentRole);
    
    const filteredPages = allowedPages
      .filter(page => page.label.toLowerCase().includes(query.toLowerCase()))
      .map(page => ({
        title: page.label,
        path: page.path,
        type: "Navigation"
      }));

    if (query.trim().length < 2) {
      setResults(filteredPages);
      return;
    }

    setIsLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        // 2. Query dynamic backend records
        const response = await API.get(`/search?q=${query}`);
        
        // Combine matched navigation sub-links with backend collection data
        setResults([...filteredPages, ...response.data]);
      } catch (error) {
        console.error("Omnibox tracking sync error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, currentRole]);

  const handleSelectResult = (path) => {
    setQuery("");
    setIsOpen(false);
    navigate(path);
  };

  const initials = (user?.fullName || "User")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="student-topbar">
      <div className="search-container-wrapper" ref={dropdownRef} style={{ position: "relative", width: "100%", maxWidth: "400px" }}>
        <label className="student-search" htmlFor="student-search-input">
          <FiSearch aria-hidden="true" />
          <input
            id="student-search-input"
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            placeholder={`Search ${currentRole} pages, courses...`}
            autoComplete="off"
          />
          {isLoading && <span className="search-spinner-text">...</span>}
        </label>

        {isOpen && results.length > 0 && (
          <div className="search-results-dropdown">
            {results.map((item, index) => (
              <div
                key={index}
                className="search-result-item"
                onClick={() => handleSelectResult(item.path)}
              >
                <div className="search-item-info">
                  <span className="search-item-title">{item.title}</span>
                  <span className="search-item-type-tag">{item.type}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="student-top-actions">
        <Link className="student-icon-button student-notification-button" to={`/${currentRole}/notifications`} aria-label="Notifications">
          <FiBell />
          {notificationCount > 0 ? (
            <span className="student-notification-badge">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          ) : null}
        </Link>

        <div className="student-user-chip">
          <span className="student-user-avatar">{initials}</span>
          <div className="student-user-copy">
            <strong>{user?.fullName || "User Account"}</strong>
            <span style={{ textTransform: "capitalize" }}>{currentRole}</span>
          </div>
          <FiChevronDown className="student-user-chevron" />
        </div>
      </div>
    </header>
  );
}

export default Topbar;