import api from "@/redux/api"

export const discussionApi = api.injectEndpoints({
  endpoints: builder => ({
    getCourseDiscussions: builder.query({
      query: course_id => `/api/v1/discussions/course/${course_id}`,
      providesTags: ["DISCUSSIONS"],
    }),
    createDiscussion: builder.mutation({
      query: body => ({
        url: "/api/v1/discussions/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["DISCUSSIONS"],
    }),
    deleteDiscussion: builder.mutation({
      query: id => ({
        url: `/api/v1/discussions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["DISCUSSIONS"],
    }),
    getDiscussionComments: builder.query({
      query: discussion_id => `/api/v1/comments/discussion/${discussion_id}`,
      providesTags: ["COMMENTS"],
    }),
    createComment: builder.mutation({
      query: body => ({
        url: "/api/v1/comments/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["COMMENTS"],
    }),
    deleteComment: builder.mutation({
      query: id => ({
        url: `/api/v1/comments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["COMMENTS"],
    }),
  }),
})

export const {
  useGetCourseDiscussionsQuery,
  useCreateDiscussionMutation,
  useDeleteDiscussionMutation,
  useGetDiscussionCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
} = discussionApi
