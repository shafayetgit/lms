import api from "@/redux/api"

const PREFIX = "api/v1/ai-quizzes"

const aiQuizAPI = api.injectEndpoints({
  endpoints: builder => ({
    generateAIQuiz: builder.mutation({
      query: formData => ({
        url: `${PREFIX}/generate`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["AI_QUIZZES"],
    }),

    getAIGenerationStatus: builder.query({
      query: sourcePublicId => `${PREFIX}/status/${sourcePublicId}`,
      providesTags: (result, error, sourcePublicId) => [{ type: "AI_QUIZZES", id: sourcePublicId }],
    }),

    getAIDraftQuiz: builder.query({
      query: draftPublicId => `${PREFIX}/drafts/${draftPublicId}`,
      providesTags: (result, error, draftPublicId) => [{ type: "AI_QUIZZES", id: draftPublicId }],
    }),

    updateAIDraftQuiz: builder.mutation({
      query: ({ draftPublicId, body }) => ({
        url: `${PREFIX}/drafts/${draftPublicId}`,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: (result, error, { draftPublicId }) => [{ type: "AI_QUIZZES", id: draftPublicId }],
    }),

    confirmAIDraftQuiz: builder.mutation({
      query: ({ draftPublicId, body }) => ({
        url: `${PREFIX}/drafts/${draftPublicId}/confirm`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["QUIZZES", "AI_QUIZZES"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGenerateAIQuizMutation,
  useGetAIGenerationStatusQuery,
  useLazyGetAIGenerationStatusQuery,
  useGetAIDraftQuizQuery,
  useLazyGetAIDraftQuizQuery,
  useUpdateAIDraftQuizMutation,
  useConfirmAIDraftQuizMutation,
} = aiQuizAPI

export default aiQuizAPI
