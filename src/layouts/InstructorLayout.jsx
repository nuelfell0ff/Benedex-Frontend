import { Outlet } from "react-router-dom";

import { useMemo } from "react";


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

function InstructorLayout() {

  const links = useMemo(
    () => [

      {
        label: "Dashboard",
        path: "/instructor",
        icon: <FiGrid />
      },

      {
        label: "Courses",
        path: "/instructor/courses",
        icon: <FiBookOpen />
      },

      {
        label: "Assignments",
        path: "/instructor/assignments",
        icon: <FiClipboard />
      },

      {
        label: "Students",
        path: "/instructor/students",
        icon: <FiMessageSquare />
      },

      {
        label: "Live Classes",
        path: "/instructor/live-classes",
        icon: <FiPlayCircle />
      },

      {
        label: "Notifications",
        path: "/instructor/notifications",
        icon: <FiBell />
      },

      {
        label: "Messages",
        path: "/instructor/messages",
        icon: <FiMessageSquare />
      },

      {
        label: "Grade Submissions",
        path: "/instructor/grade-submissions",
        icon: <FiClipboard />
      }

    ]
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

export default InstructorLayout;