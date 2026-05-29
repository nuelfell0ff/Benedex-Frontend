import {
  Routes,
  Route,
  Navigate
}
  from "react-router-dom";

import {
  AuthProvider,
  useAuth
}
  from "./context/AuthContext";

import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import StudentLayout from "./layouts/StudentLayout";
import InstructorLayout from "./layouts/InstructorLayout";
import AdminLayout from "./layouts/AdminLayout";

import StudentDashboard from "./pages/student/StudentDashboard";
import StudentCourses from "./pages/student/StudentCourses";
import CourseDetails from "./pages/student/CourseDetails";
import Assignments from "./pages/student/Assignments";
import Notifications from "./pages/student/Notifications";
import LiveClasses from "./pages/student/LiveClasses";
import Messages from "./pages/student/Messages";




import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import InstructorCourses from "./pages/instructor/InstructorCourses";
import GradeSubmissions from "./pages/instructor/GradeSubmissions";
import InstructorLiveClasses from "./pages/instructor/InstructorLiveClasses";
import InstructorNotifications from "./pages/instructor/InstructorNotifications";
import InstructorMessages from "./pages/instructor/InstructorMessages";
import CreateCourse from "./pages/instructor/CreateCourse";
import CreateModule from "./pages/instructor/CreateModule";
import CreateAssignment from "./pages/instructor/CreateAssignment";
import InstructorStudents from "./pages/instructor/InstructorStudents";





import AdminDashboard from "./pages/admin/AdminDashboard";





function HomeRedirect() {

  const { user } = useAuth();


  if (!user) {

    return <Navigate to="/login" />;

  }


  if (user.role === "student") {

    return <Navigate to="/student" />;

  }


  if (user.role === "instructor") {

    return <Navigate to="/instructor" />;

  }


  if (user.role === "admin") {

    return <Navigate to="/admin" />;

  }


  return <Navigate to="/login" />;

}





function App() {

  return (

    <AuthProvider>

      <Routes>

        <Route
          path="/"
          element={<HomeRedirect />}
        />



        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />





        <Route

          path="/student"

          element={

            <ProtectedRoute
              roles={["student"]}
            >

              <StudentLayout />

            </ProtectedRoute>

          }

        >

          <Route
            index
            element={<StudentDashboard />}
          />

          <Route
            path="courses"
            element={<StudentCourses />}
          />

          <Route
            path="courses/:id"
            element={<CourseDetails />}
          />

          <Route
            path="assignments"
            element={<Assignments />}
          />

          <Route
            path="notifications"
            element={<Notifications />}
          />

          <Route
            path="live-classes"
            element={<LiveClasses />}
          />

          <Route
            path="messages"
            element={<Messages />}
          />

        </Route>





        <Route

          path="/instructor"

          element={

            <ProtectedRoute
              roles={["instructor"]}
            >

              <InstructorLayout />

            </ProtectedRoute>

          }

        >

          <Route
            index
            element={<InstructorDashboard />}
          />

          <Route
            path="courses"
            element={<InstructorCourses />}
          />

          <Route
            path="create-course"
            element={<CreateCourse />}
          />

          <Route
            path="create-module/:courseId"
            element={<CreateModule />}
          />

          <Route
            path="create-assignment/:courseId"
            element={<CreateAssignment />}
          />

          <Route
            path="assignments"
            element={<CreateAssignment />}
          />

          <Route
            path="students"
            element={<InstructorStudents />}
          />

          <Route
            path="grade-submissions"
            element={<GradeSubmissions />}
          />

          <Route
            path="live-classes"
            element={<InstructorLiveClasses />}
          />

          <Route
            path="notifications"
            element={<InstructorNotifications />}
          />

          <Route
            path="messages"
            element={<InstructorMessages />}
          />

        </Route>





        <Route

          path="/admin"

          element={

            <ProtectedRoute
              roles={["admin"]}
            >

              <AdminLayout />

            </ProtectedRoute>

          }

        >

          <Route
            index
            element={<AdminDashboard />}
          />

        </Route>





      </Routes>

    </AuthProvider>

  );

}

export default App;