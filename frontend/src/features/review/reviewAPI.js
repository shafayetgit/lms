import api from "@/redux/api"

const PREFIX = "api/v1/reviews"

const reviewAPI = api.injectEndpoints({
  endpoints: builder => ({
    createReview: builder.mutation({
      query: body => ({
        url: `${PREFIX}/`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["REVIEWS"],
    }),

    readReviews: builder.query({
      query: ({ size, page, course_id, student_id, is_active } = {}) => {
        const params = new URLSearchParams()

        if (course_id) params.set("course_id", course_id)
        if (student_id) params.set("student_id", student_id)
        if (is_active !== undefined) params.set("is_active", is_active)
        if (page !== undefined) params.set("page", page)
        if (size !== undefined) params.set("size", size)

        const queryString = params.toString()
        return queryString ? `${PREFIX}/?${queryString}` : `${PREFIX}/`
      },
      providesTags: ["REVIEWS"],
    }),

    readReview: builder.query({
      query: ({ id } = {}) => `${PREFIX}/${id}`,
    }),

    updateReview: builder.mutation({
      query: ({ id, body } = {}) => ({
        url: `${PREFIX}/${id}`,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ["REVIEWS"],
    }),

    deleteReview: builder.mutation({
      query: ({ id } = {}) => ({
        url: `${PREFIX}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["REVIEWS"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useCreateReviewMutation,
  useReadReviewsQuery,
  useLazyReadReviewsQuery,
  useReadReviewQuery,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewAPI
export default reviewAPI
