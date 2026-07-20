const ADMIN_PREFIX = "/lms";
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
    dashboard: { path: `${ADMIN_PREFIX}/dashboard`, label: "Dashboard" },
    category: { path: `${ADMIN_PREFIX}/categories`, label: "Categories" },
    course: { path: `${ADMIN_PREFIX}/courses`, label: "Courses" },
    quiz: { path: `${ADMIN_PREFIX}/quizzes`, label: "Quizzes" },
    program: { path: `${ADMIN_PREFIX}/programs`, label: "Programs" },
    batch: { path: `${ADMIN_PREFIX}/batches`, label: "Batches" },
    liveClass: { path: `${ADMIN_PREFIX}/live-classes`, label: "Live Classes" },
    ebook: { path: `${ADMIN_PREFIX}/ebooks`, label: "E-Books" },
    assignment: { path: `${ADMIN_PREFIX}/assignments`, label: "Assignments" },
    evaluation: { path: `${ADMIN_PREFIX}/evaluations`, label: "Evaluation Sessions" },
    certificateRequest: { path: `${ADMIN_PREFIX}/certificate-requests`, label: "Certificate Requests" },
    certificate: { path: `${ADMIN_PREFIX}/certificates`, label: "Certificates" },
    badge: { path: `${ADMIN_PREFIX}/badges`, label: "Badges" },
    enrollment: { path: `${ADMIN_PREFIX}/enrollments`, label: "Enrollments" },
    wishlist: { path: `${ADMIN_PREFIX}/wishlist`, label: "Wishlists" },
    transaction: { path: "/settings/transactions", label: "Transactions" },
    coupon: { path: "/settings/coupons", label: "Coupons" },
    settings: { path: `${ADMIN_PREFIX}/settings`, label: "Settings" },
  },
};



