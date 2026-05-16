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
  },
};



