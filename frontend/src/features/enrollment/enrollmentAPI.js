import api from "@/redux/api"

const PREFIX = "api/v1/enrollments"

const enrollmentAPI = api.injectEndpoints({
  endpoints: builder => ({
    createEnrollment: builder.mutation({
      query: body => ({
        url: `${PREFIX}/`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["ENROLLMENTS"],
    }),

    readEnrollments: builder.query({
      query: ({ size, page, course_id, user_id, status } = {}) => {
        const params = new URLSearchParams()

        if (course_id) params.set("course_id", course_id)
        if (user_id) params.set("user_id", user_id)
        if (status) params.set("status", status)
        if (page !== undefined) params.set("page", page)
        if (size !== undefined) params.set("size", size)

        const queryString = params.toString()
        return queryString ? `${PREFIX}/?${queryString}` : `${PREFIX}/`
      },
      providesTags: ["ENROLLMENTS"],
    }),

    readEnrollment: builder.query({
      query: ({ id } = {}) => `${PREFIX}/${id}`,
    }),

    updateEnrollment: builder.mutation({
      query: ({ id, body } = {}) => ({
        url: `${PREFIX}/${id}`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: ["ENROLLMENTS"],
    }),

    deleteEnrollment: builder.mutation({
      query: ({ id } = {}) => ({
        url: `${PREFIX}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ENROLLMENTS"],
    }),
    readEnrollmentMeta: builder.query({
      query: () => `${PREFIX}/meta`,
    }),

    readEnrolledStudents: builder.query({
      query: ({ coursePublicId } = {}) => `${PREFIX}/students/${coursePublicId}`,
      providesTags: ["ENROLLMENTS"],
    }),
    readMyEnrollments: builder.query({
      query: ({ page, size } = {}) => {
        const params = new URLSearchParams()
        if (page !== undefined) params.set("page", page)
        if (size !== undefined) params.set("size", size)
        const queryString = params.toString()
        return queryString ? `${PREFIX}/my?${queryString}` : `${PREFIX}/my`
      },
      providesTags: ["ENROLLMENTS"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useCreateEnrollmentMutation,
  useReadEnrollmentsQuery,
  useLazyReadEnrollmentsQuery,
  useReadEnrollmentQuery,
  useReadEnrollmentMetaQuery,
  useUpdateEnrollmentMutation,
  useDeleteEnrollmentMutation,
  useReadEnrolledStudentsQuery,
  useReadMyEnrollmentsQuery,
} = enrollmentAPI
export default enrollmentAPI
