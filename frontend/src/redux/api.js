import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "@/features/baseQuery";

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQuery,
  tagTypes: [
    "CATEGORIES",
    "COURSES",
    "EBOOKS",
    "USERS",
    "ORDERS",
    "SUPPORT_TICKETS",
    "WISHLIST",
    "MEDIA",
    "INSTRUCTORS",
    "MODULES",
    "LESSONS",
    "QUIZZES",
    "STUDENTS",
    "ENROLLMENTS",
    "REVIEWS",
    "QUIZ_ATTEMPTS",
  ],
  endpoints: () => ({}),
});

export default api;
