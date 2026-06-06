import api from "@/redux/api"

const PREFIX = "api/v1/students"

const studentAPI = api.injectEndpoints({
  endpoints: builder => ({
    createStudent: builder.mutation({
      query: body => ({
        url: `${PREFIX}/`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["STUDENTS"],
    }),

    readStudents: builder.query({
      query: ({ size, page, term, department, is_active } = {}) => {
        const params = new URLSearchParams()

        if (term) params.set("term", term)
        if (department) params.set("department", department)
        if (is_active !== undefined) params.set("is_active", is_active)
        if (page !== undefined) params.set("page", page)
        if (size !== undefined) params.set("size", size)

        const queryString = params.toString()
        return queryString ? `${PREFIX}/?${queryString}` : `${PREFIX}/`
      },
      providesTags: ["STUDENTS"],
    }),

    readStudent: builder.query({
      query: ({ id } = {}) => `${PREFIX}/${id}`,
    }),

    updateStudent: builder.mutation({
      query: ({ id, body } = {}) => ({
        url: `${PREFIX}/${id}`,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ["STUDENTS"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useCreateStudentMutation,
  useReadStudentsQuery,
  useLazyReadStudentsQuery,
  useReadStudentQuery,
  useUpdateStudentMutation,
} = studentAPI
export default studentAPI
