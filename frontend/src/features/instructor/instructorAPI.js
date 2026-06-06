import api from "@/redux/api"

const PREFIX = "api/v1/instructors"

const instructorAPI = api.injectEndpoints({
  endpoints: builder => ({
    createInstructor: builder.mutation({
      query: body => ({
        url: `${PREFIX}/`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["INSTRUCTORS"],
    }),

    readInstructors: builder.query({
      query: ({ size, page, term, specialization, department, is_active } = {}) => {
        const params = new URLSearchParams()

        if (term) params.set("term", term)
        if (specialization) params.set("specialization", specialization)
        if (department) params.set("department", department)
        if (is_active !== undefined) params.set("is_active", is_active)
        if (page !== undefined) params.set("page", page)
        if (size !== undefined) params.set("size", size)

        const queryString = params.toString()
        return queryString ? `${PREFIX}/?${queryString}` : `${PREFIX}/`
      },
      providesTags: ["INSTRUCTORS"],
    }),

    readInstructor: builder.query({
      query: ({ id } = {}) => `${PREFIX}/${id}`,
    }),

    updateInstructor: builder.mutation({
      query: ({ id, body } = {}) => ({
        url: `${PREFIX}/${id}`,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ["INSTRUCTORS"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useCreateInstructorMutation,
  useReadInstructorsQuery,
  useLazyReadInstructorsQuery,
  useReadInstructorQuery,
  useUpdateInstructorMutation,
} = instructorAPI
export default instructorAPI
