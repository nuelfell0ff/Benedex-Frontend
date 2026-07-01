import { Outlet } from "react-router-dom";

import { useMemo } from "react";

import {
  FiBell,
  FiBookOpen,
  FiGrid,
  FiMessageSquare,
  FiPlayCircle,
  FiClipboard,
  FiUsers,
  FiAlertCircle,
  FiActivity,
} from "react-icons/fi";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import { MdPayments } from "react-icons/md";
import { GrAnalytics } from "react-icons/gr";
import { CiSettings } from "react-icons/ci";

function AdminLayout() {

  const links = useMemo(
    () => [

      {
        label: "Dashboard",
        path: "/admin",
        icon: <FiGrid />
      },

      {
        label: "Users",
        path: "/admin/users",
        icon: <FiUsers />
      },

      {
        label: "Courses",
        path: "/admin/courses",
        icon: <FiBookOpen />
      },

      {
        label: "Payments",
        path: "/admin/payments",
        icon: <MdPayments />
      },

      {
        label: "Analytics",
        path: "/admin/analytics",
        icon: <GrAnalytics />
      },

      {
        label: "Support Tickets",
        path: "/admin/tickets",
        icon: <FiAlertCircle />, // or any icon of your choosing
      },

      {
        label: "Notifications",
        path: "/admin/notifications",
        icon: <FiBell />,
      },

      {
        label: "Activity",
        path: "/admin/activity-logs",
        icon: <FiActivity />
      },

      {
        label: "Settings",
        path: "/admin/settings",
        icon: <CiSettings />
      }

    ]
  )

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

export default AdminLayout;