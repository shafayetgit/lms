import api from "@/redux/api"

export const programApi = api.injectEndpoints({
  endpoints: builder => ({
    createProgram: builder.mutation({
      query: body => ({
        url: "/api/v1/programs/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PROGRAMS"],
    }),
    readPrograms: builder.query({
      query: params => ({
        url: "/api/v1/programs/",
        method: "GET",
        params,
      }),
      providesTags: ["PROGRAMS"],
    }),
    readProgram: builder.query({
      query: id => `/api/v1/programs/${id}`,
      providesTags: ["PROGRAMS"],
    }),
    updateProgram: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/v1/programs/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["PROGRAMS"],
    }),
    deleteProgram: builder.mutation({
      query: id => ({
        url: `/api/v1/programs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PROGRAMS"],
    }),
    enrollInProgram: builder.mutation({
      query: id => ({
        url: `/api/v1/programs/${id}/enroll`,
        method: "POST",
      }),
      invalidatesTags: ["PROGRAMS"],
    }),
    readProgramMembers: builder.query({
      query: id => `/api/v1/programs/${id}/members`,
      providesTags: ["PROGRAMS"],
    }),
  }),
})

export const {
  useCreateProgramMutation,
  useReadProgramsQuery,
  useLazyReadProgramsQuery,
  useReadProgramQuery,
  useUpdateProgramMutation,
  useDeleteProgramMutation,
  useEnrollInProgramMutation,
  useReadProgramMembersQuery,
  useLazyReadProgramMembersQuery,
} = programApi
