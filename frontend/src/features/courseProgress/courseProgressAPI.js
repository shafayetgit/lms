import api from "@/redux/api"

const PREFIX = "api/v1/lesson-progress"

const courseProgressAPI = api.injectEndpoints({
  endpoints: builder => ({
    readMyLessonProgress: builder.query({
      query: ({ lessonId }) => `${PREFIX}/my/lesson/${lessonId}`,
      providesTags: ["LESSON_PROGRESS"],
    }),
    readMyProgress: builder.query({
      query: () => `${PREFIX}/my`,
      providesTags: ["LESSON_PROGRESS"],
    }),
    updateMyLessonProgress: builder.mutation({
      query: ({ lessonId, body }) => ({
        url: `${PREFIX}/my/lesson/${lessonId}`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: ["LESSON_PROGRESS", "ENROLLMENTS"],
    }),
    completeMyLesson: builder.mutation({
      query: ({ lessonId }) => ({
        url: `${PREFIX}/my/lesson/${lessonId}/complete`,
        method: "POST",
      }),
      invalidatesTags: ["LESSON_PROGRESS", "ENROLLMENTS"],
    }),
  }),
  overrideExisting: true,
})

export const {
  useReadMyLessonProgressQuery,
  useReadMyProgressQuery,
  useLazyReadMyProgressQuery,
  useUpdateMyLessonProgressMutation,
  useCompleteMyLessonMutation,
} = courseProgressAPI
export default courseProgressAPI
