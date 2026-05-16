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
  ],
  endpoints: () => ({}),
});

export default api;
