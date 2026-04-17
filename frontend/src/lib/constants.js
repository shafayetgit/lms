export const LOGO =
  process.env.NEXT_PUBLIC_LOGO || "/images/logo/coderiven-dark.png";
export const LOGO_WIDTH = Number(process.env.NEXT_PUBLIC_LOGO_WIDTH) || 50;
export const LOGO_HEIGHT = Number(process.env.NEXT_PUBLIC_LOGO_HEIGHT) || 69;

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "LMS";

// Default
export const CATEGORY_DEFAULT_IMAGE =
  "https://res.cloudinary.com/deu2mmdzj/image/upload/f_auto,q_auto/start-up-business-meeting_bbw3sj";

// Routes
const ADMIN_PREFIX = "/admin";
export const PAGES = {
  PORTAL: {
    SIGNIN: { path: "/auth/sign-in", label: "SignIn" },
    HOME: { path: "/", label: "Home" },
    COURSES: { path: "/courses", label: "Courses" },
  },

  STUDENT: {
    DASHBOARD: { path: "/student/dashboard", label: "Dashboard" },
  },

  ADMIN: {
    DASHBOARD: { path: ADMIN_PREFIX, label: "Dashboard" },
    CATEGORY: { path: `${ADMIN_PREFIX}/categories`, label: "Categories" },
  },
};
