import { Outlet } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

function StudentLayout() {

  const links = [

    {
      label: "Dashboard",
      path: "/student"
    },

    {
      label: "Courses",
      path: "/student/courses"
    },

    {
      label: "Assignments",
      path: "/student/assignments"
    },

    {
      label: "Live Classes",
      path: "/student/live-classes"
    },

    {
      label: "Messages",
      path: "/student/messages"
    },

    {
      label: "Notifications",
      path: "/student/notifications"
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

export default StudentLayout;