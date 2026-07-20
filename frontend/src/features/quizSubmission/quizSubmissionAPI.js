import api from "@/redux/api"

const PREFIX = "api/v1/quiz-submissions"

const quizSubmissionAPI = api.injectEndpoints({
  endpoints: builder => ({
    readQuizSubmissions: builder.query({
      query: ({ size, page, quiz_id, user_id } = {}) => {
        const params = new URLSearchParams()
        if (quiz_id) params.set("quiz_id", quiz_id)
        if (user_id) params.set("user_id", user_id)
        if (page !== undefined) params.set("page", page)
        if (size !== undefined) params.set("size", size)
        const queryString = params.toString()
        return queryString ? `${PREFIX}/?${queryString}` : `${PREFIX}/`
      },
      providesTags: ["QUIZ_SUBMISSIONS"],
    }),
    readQuizSubmission: builder.query({
      query: ({ id } = {}) => `${PREFIX}/${id}`,
      providesTags: ["QUIZ_SUBMISSIONS"],
    }),
    readMySubmissions: builder.query({
      query: ({ quiz_id } = {}) => {
        const params = new URLSearchParams()
        if (quiz_id) params.set("quiz_id", quiz_id)
        return `${PREFIX}/my-attempts?${params.toString()}`
      },
      providesTags: ["QUIZ_SUBMISSIONS"],
    }),
    startQuizSubmission: builder.mutation({
      query: body => ({ url: `${PREFIX}/`, method: "POST", body }),
      invalidatesTags: ["QUIZ_SUBMISSIONS"],
    }),
    submitQuiz: builder.mutation({
      query: ({ id, body } = {}) => ({ url: `${PREFIX}/${id}/submit`, method: "POST", body }),
      invalidatesTags: ["QUIZ_SUBMISSIONS"],
    }),
  }),
  overrideExisting: true,
})

export const {
  useReadQuizSubmissionsQuery,
  useLazyReadQuizSubmissionsQuery,
  useReadQuizSubmissionQuery,
  useReadMySubmissionsQuery,
  useStartQuizSubmissionMutation,
  useSubmitQuizMutation,
} = quizSubmissionAPI
export default quizSubmissionAPI
