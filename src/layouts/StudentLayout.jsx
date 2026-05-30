import { useMemo } from "react";

import { Outlet } from "react-router-dom";

import {
  FiBell,
  FiBookOpen,
  FiGrid,
  FiMessageSquare,
  FiPlayCircle,
  FiClipboard,
} from "react-icons/fi";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

function StudentLayout() {

  const links = useMemo(
    () => [
      {
        label: "Dashboard",
        path: "/student",
        icon: <FiGrid />,
      },
      {
        label: "My Courses",
        path: "/student/courses",
        icon: <FiBookOpen />,
      },
      {
        label: "Assignments",
        path: "/student/assignments",
        icon: <FiClipboard />,
      },
      {
        label: "Live Classes",
        path: "/student/live-classes",
        icon: <FiPlayCircle />,
      },
      {
        label: "Messages",
        path: "/student/messages",
        icon: <FiMessageSquare />,
      },
      {
        label: "Notifications",
        path: "/student/notifications",
        icon: <FiBell />,
      },
    ],
    []
  );

  return (
    <div className="student-shell">
      <Sidebar links={links} />

      <div className="student-main">
        <Topbar />

        <main className="student-content">
          <Outlet />
        </main>
      </div>
    </div>

  );

}

export default StudentLayout;