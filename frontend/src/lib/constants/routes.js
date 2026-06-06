const ADMIN_PREFIX = "/admin";
export const ROUTES = {
  portal: {
    signIn: { path: "/auth/sign-in", label: "SignIn" },
    home: { path: "/", label: "Home" },
    courses: { path: "/courses", label: "Courses" },
  },

  student: {
    dashboard: { path: "/student/dashboard", label: "Dashboard" },
  },

  admin: {
    dashboard: { path: ADMIN_PREFIX, label: "Dashboard" },
    category: { path: `${ADMIN_PREFIX}/categories`, label: "Categories" },
    student: { path: `${ADMIN_PREFIX}/students`, label: "Students" },
    enrollment: { path: `${ADMIN_PREFIX}/enrollments`, label: "Enrollments" },
    instructor: { path: `${ADMIN_PREFIX}/instructors`, label: "Instructors" },
    course: { path: `${ADMIN_PREFIX}/courses`, label: "Courses" },
    quiz: { path: `${ADMIN_PREFIX}/quizzes`, label: "Quizzes" },
  },
};



