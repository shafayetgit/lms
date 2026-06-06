import api from "@/redux/api"

const PREFIX = "api/v1/quizzes"

const quizAPI = api.injectEndpoints({
  endpoints: builder => ({
    createQuiz: builder.mutation({
      query: body => ({
        url: `${PREFIX}`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["QUIZZES"],
    }),

    readQuizzes: builder.query({
      query: ({ courseId, size, page, term }) => {
        const params = new URLSearchParams()

        if (term) params.set("term", term)
        if (courseId) params.set("course_id", courseId)
        if (page !== undefined) params.set("page", page)
        if (size !== undefined) params.set("size", size)

        const queryString = params.toString()
        return queryString ? `${PREFIX}/?${queryString}` : PREFIX
      },
      providesTags: ["QUIZZES"],
    }),

    readQuiz: builder.query({
      query: ({ id } = {}) => `${PREFIX}/${id}`,
      providesTags: (result, error, { id }) => [{ type: "QUIZZES", id }],
    }),

    updateQuiz: builder.mutation({
      query: ({ id, body } = {}) => ({
        url: `${PREFIX}/${id}`,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) => ["QUIZZES", { type: "QUIZZES", id }],
    }),

    deleteQuiz: builder.mutation({
      query: ({ id } = {}) => ({
        url: `${PREFIX}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["QUIZZES"],
    }),

    addQuestion: builder.mutation({
      query: ({ quizId, body } = {}) => ({
        url: `${PREFIX}/${quizId}/questions`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: (result, error, { quizId }) => [{ type: "QUIZZES", id: quizId }],
    }),

    updateQuestion: builder.mutation({
      query: ({ quizId, questionId, body } = {}) => ({
        url: `${PREFIX}/${quizId}/questions/${questionId}`,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: (result, error, { quizId }) => [{ type: "QUIZZES", id: quizId }],
    }),

    deleteQuestion: builder.mutation({
      query: ({ quizId, questionId } = {}) => ({
        url: `${PREFIX}/${quizId}/questions/${questionId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { quizId }) => [{ type: "QUIZZES", id: quizId }],
    }),

    reorderQuestions: builder.mutation({
      query: ({ quizId, body } = {}) => ({
        url: `${PREFIX}/${quizId}/questions/reorder`,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: (result, error, { quizId }) => [{ type: "QUIZZES", id: quizId }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useCreateQuizMutation,
  useReadQuizzesQuery,
  useLazyReadQuizzesQuery,
  useReadQuizQuery,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
  useAddQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useReorderQuestionsMutation,
} = quizAPI
export default quizAPI
