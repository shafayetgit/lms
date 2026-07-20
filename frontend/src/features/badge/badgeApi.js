import api from "@/redux/api";

export const badgeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Badges
    createBadge: builder.mutation({
      query: (body) => ({
        url: "/api/v1/badges/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["BADGES"],
    }),
    readBadges: builder.query({
      query: (params) => ({
        url: "/api/v1/badges/",
        method: "GET",
        params,
      }),
      providesTags: ["BADGES"],
    }),
    readBadge: builder.query({
      query: (id) => `/api/v1/badges/${id}`,
      providesTags: ["BADGES"],
    }),
    updateBadge: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/v1/badges/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["BADGES"],
    }),
    deleteBadge: builder.mutation({
      query: (id) => ({
        url: `/api/v1/badges/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BADGES"],
    }),

    // Assignments
    assignBadge: builder.mutation({
      query: (body) => ({
        url: "/api/v1/badges/assign",
        method: "POST",
        body,
      }),
      invalidatesTags: ["BADGES"],
    }),
    readBadgeAssignments: builder.query({
      query: (params) => ({
        url: "/api/v1/badges/assignments",
        method: "GET",
        params,
      }),
      providesTags: ["BADGES"],
    }),
    revokeBadge: builder.mutation({
      query: (id) => ({
        url: `/api/v1/badges/assignments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BADGES"],
    }),
  }),
});

export const {
  useCreateBadgeMutation,
  useReadBadgesQuery,
  useLazyReadBadgesQuery,
  useReadBadgeQuery,
  useUpdateBadgeMutation,
  useDeleteBadgeMutation,

  useAssignBadgeMutation,
  useReadBadgeAssignmentsQuery,
  useLazyReadBadgeAssignmentsQuery,
  useRevokeBadgeMutation,
} = badgeApi;
