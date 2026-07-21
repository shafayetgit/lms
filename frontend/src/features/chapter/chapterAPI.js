import api from "@/redux/api"

const PREFIX = "api/v1/chapters"

const chapterAPI = api.injectEndpoints({
  endpoints: builder => ({
    createChapter: builder.mutation({
      query: body => ({ url: `${PREFIX}/`, method: "POST", body }),
      invalidatesTags: ["CHAPTERS"],
    }),
    readChaptersByCourse: builder.query({
      query: ({ courseId, is_portal }) => {
        const params = new URLSearchParams()
        if (is_portal !== undefined) params.set("is_portal", is_portal)
        const queryString = params.toString()
        return queryString
          ? `${PREFIX}/course/${courseId}?${queryString}`
          : `${PREFIX}/course/${courseId}`
      },
      providesTags: ["CHAPTERS"],
    }),
    readChapter: builder.query({
      query: ({ id } = {}) => `${PREFIX}/${id}`,
    }),
    updateChapter: builder.mutation({
      query: ({ id, body } = {}) => ({ url: `${PREFIX}/${id}`, method: "PUT", body }),
      invalidatesTags: ["CHAPTERS"],
    }),
    deleteChapter: builder.mutation({
      query: ({ id } = {}) => ({ url: `${PREFIX}/${id}`, method: "DELETE" }),
      invalidatesTags: ["CHAPTERS"],
    }),
    reorderChapters: builder.mutation({
      query: ({ courseId, body } = {}) => ({
        url: `${PREFIX}/course/${courseId}/reorder`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["CHAPTERS"],
    }),
  }),
  overrideExisting: true,
})

export const {
  useCreateChapterMutation,
  useReadChaptersByCourseQuery,
  useLazyReadChaptersByCourseQuery,
  useReadChapterQuery,
  useUpdateChapterMutation,
  useDeleteChapterMutation,
  useReorderChaptersMutation,
} = chapterAPI
export default chapterAPI
