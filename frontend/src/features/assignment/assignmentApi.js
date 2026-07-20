import api from "@/redux/api";

export const assignmentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createAssignment: builder.mutation({
      query: (body) => ({
        url: "/api/v1/assignments/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ASSIGNMENTS"],
    }),
    readAssignments: builder.query({
      query: (params) => ({
        url: "/api/v1/assignments/",
        method: "GET",
        params,
      }),
      providesTags: ["ASSIGNMENTS"],
    }),
    readAssignment: builder.query({
      query: (id) => `/api/v1/assignments/${id}`,
      providesTags: ["ASSIGNMENTS"],
    }),
    updateAssignment: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/v1/assignments/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["ASSIGNMENTS"],
    }),
    deleteAssignment: builder.mutation({
      query: (id) => ({
        url: `/api/v1/assignments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ASSIGNMENTS"],
    }),
    submitAssignment: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/v1/assignments/${id}/submit`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["ASSIGNMENTS"],
    }),
    getSubmissions: builder.query({
      query: ({ id, params }) => ({
        url: `/api/v1/assignments/${id}/submissions`,
        method: "GET",
        params,
      }),
      providesTags: ["ASSIGNMENTS"],
    }),
    gradeSubmission: builder.mutation({
      query: ({ id, sub_id, body }) => ({
        url: `/api/v1/assignments/${id}/submissions/${sub_id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["ASSIGNMENTS"],
    }),
  }),
});

export const {
  useCreateAssignmentMutation,
  useReadAssignmentsQuery,
  useLazyReadAssignmentsQuery,
  useReadAssignmentQuery,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  useSubmitAssignmentMutation,
  useGetSubmissionsQuery,
  useGradeSubmissionMutation,
} = assignmentApi;
