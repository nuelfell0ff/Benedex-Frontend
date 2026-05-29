import { Outlet } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

function InstructorLayout() {

  const links = [

    {
      label: "Dashboard",
      path: "/instructor"
    },

    {
      label: "Courses",
      path: "/instructor/courses"
    },

    {
      label: "Assignments",
      path: "/instructor/assignments"
    },

    {
      label: "Students",
      path: "/instructor/students"
    },

    {
      label: "Live Classes",
      path: "/instructor/live-classes"
    },

    {
      label: "Notifications",
      path: "/instructor/notifications"
    },

    {
      label: "Messages",
      path: "/instructor/messages"
    },

    {
      label: "Grade Submissions",
      path: "/instructor/grade-submissions"
    },

  ];

  return (

    <div>

      <Sidebar links={links} />

      <div>

        <Topbar />

        <Outlet />

      </div>

    </div>

  );

}

export default InstructorLayout;