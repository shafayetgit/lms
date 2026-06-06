import api from "@/redux/api"

const PREFIX = "api/v1/quiz-attempts"

const quizAttemptAPI = api.injectEndpoints({
  endpoints: builder => ({
    readQuizAttempts: builder.query({
      query: ({ size, page, quiz_id, user_id } = {}) => {
        const params = new URLSearchParams()

        if (quiz_id) params.set("quiz_id", quiz_id)
        if (user_id) params.set("user_id", user_id)
        if (page !== undefined) params.set("page", page)
        if (size !== undefined) params.set("size", size)

        const queryString = params.toString()
        return queryString ? `${PREFIX}/?${queryString}` : `${PREFIX}/`
      },
      providesTags: ["QUIZ_ATTEMPTS"],
    }),

    readQuizAttempt: builder.query({
      query: ({ id } = {}) => `${PREFIX}/${id}`,
      providesTags: ["QUIZ_ATTEMPTS"],
    }),
    
    // We can add mutations like update attempt score or delete if needed in the future
  }),
  overrideExisting: false,
})

export const {
  useReadQuizAttemptsQuery,
  useLazyReadQuizAttemptsQuery,
  useReadQuizAttemptQuery,
} = quizAttemptAPI
export default quizAttemptAPI
