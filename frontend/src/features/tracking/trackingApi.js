import api from "@/redux/api"

export const trackingApi = api.injectEndpoints({
  endpoints: builder => ({
    upsertNote: builder.mutation({
      query: body => ({
        url: "/api/v1/tracking/notes",
        method: "POST",
        body,
      }),
      invalidatesTags: ["TRACKING"],
    }),
    readNote: builder.query({
      query: lesson_id => `/api/v1/tracking/notes/${lesson_id}`,
      providesTags: ["TRACKING"],
    }),
    updateWatchDuration: builder.mutation({
      query: body => ({
        url: "/api/v1/tracking/video",
        method: "POST",
        body,
      }),
      invalidatesTags: ["TRACKING"],
    }),
    registerInterest: builder.mutation({
      query: body => ({
        url: "/api/v1/tracking/interest",
        method: "POST",
        body,
      }),
      invalidatesTags: ["TRACKING"],
    }),
    updateRelatedCourses: builder.mutation({
      query: ({ course_id, body }) => ({
        url: `/api/v1/tracking/related-courses/${course_id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["TRACKING"],
    }),
  }),
})

export const {
  useUpsertNoteMutation,
  useReadNoteQuery,
  useLazyReadNoteQuery,
  useUpdateWatchDurationMutation,
  useRegisterInterestMutation,
  useUpdateRelatedCoursesMutation,
} = trackingApi
