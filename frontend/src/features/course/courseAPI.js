import api from "@/redux/api"

const PREFIX = "api/v1/courses"

const courseAPI = api.injectEndpoints({
  endpoints: builder => ({
    createCourse: builder.mutation({
      query: body => ({
        url: `${PREFIX}`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["COURSES"],
    }),

    readCourses: builder.query({
      query: ({ size, page, term, badge, level, is_active }) => {
        const params = new URLSearchParams()

        if (term) params.set("term", term)
        if (badge) params.set("badge", badge)
        if (level) params.set("level", level)
        if (is_active !== undefined) params.set("is_active", is_active)
        if (page !== undefined) params.set("page", page)
        if (size !== undefined) params.set("size", size)

        const queryString = params.toString()
        return queryString ? `${PREFIX}/?${queryString}` : PREFIX
      },
      providesTags: ["COURSES"],
    }),

    readCourse: builder.query({
      query: ({ id } = {}) => `${PREFIX}/${id}`,
    }),

    readCourseMeta: builder.query({
      query: () => `${PREFIX}/meta`,
    }),

    updateCourse: builder.mutation({
      query: ({ id, body } = {}) => ({
        url: `${PREFIX}/${id}`,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ["COURSES"],
    }),
    
    deleteCourse: builder.mutation({
      query: ({ id } = {}) => ({
        url: `${PREFIX}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["COURSES"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useCreateCourseMutation,
  useReadCoursesQuery,
  useLazyReadCoursesQuery,
  useReadCourseQuery,
  useReadCourseMetaQuery,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
} = courseAPI
export default courseAPI
