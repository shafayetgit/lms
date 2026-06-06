import api from "@/redux/api"

const PREFIX = "api/v1/lessons"

const lessonAPI = api.injectEndpoints({
  endpoints: builder => ({
    createLesson: builder.mutation({
      query: body => ({
        url: `${PREFIX}/`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["LESSONS"],
    }),

    readLessonsByModule: builder.query({
      query: ({ moduleId }) => `${PREFIX}/module/${moduleId}`,
      providesTags: ["LESSONS"],
    }),

    readLesson: builder.query({
      query: ({ id } = {}) => `${PREFIX}/${id}`,
    }),

    updateLesson: builder.mutation({
      query: ({ id, body } = {}) => ({
        url: `${PREFIX}/${id}`,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ["LESSONS"],
    }),
    
    deleteLesson: builder.mutation({
      query: ({ id } = {}) => ({
        url: `${PREFIX}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["LESSONS"],
    }),

    reorderLessons: builder.mutation({
      query: ({ moduleId, body } = {}) => ({
        url: `${PREFIX}/module/${moduleId}/reorder`,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ["LESSONS"],
    }),
  }),
  overrideExisting: true,
})

export const {
  useCreateLessonMutation,
  useReadLessonsByModuleQuery,
  useLazyReadLessonsByModuleQuery,
  useReadLessonQuery,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
  useReorderLessonsMutation,
} = lessonAPI
export default lessonAPI
