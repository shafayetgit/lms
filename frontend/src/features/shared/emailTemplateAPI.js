import api from "@/redux/api"

const PREFIX = "api/v1/email-templates"

const emailTemplateAPI = api.injectEndpoints({
  endpoints: builder => ({
    listEmailTemplates: builder.query({
      query: params => ({ url: `${PREFIX}/`, params }),
      providesTags: ["EMAIL_TEMPLATES"],
    }),

    createEmailTemplate: builder.mutation({
      query: body => ({ url: `${PREFIX}/`, method: "POST", body }),
      invalidatesTags: ["EMAIL_TEMPLATES"],
    }),

    getEmailTemplate: builder.query({
      query: ({ id }) => `${PREFIX}/${id}`,
      providesTags: (result, error, { id }) => [{ type: "EMAIL_TEMPLATES", id }],
    }),

    updateEmailTemplate: builder.mutation({
      query: ({ id, body }) => ({
        url: `${PREFIX}/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        "EMAIL_TEMPLATES",
        { type: "EMAIL_TEMPLATES", id },
      ],
    }),

    deleteEmailTemplate: builder.mutation({
      query: ({ id }) => ({ url: `${PREFIX}/${id}`, method: "DELETE" }),
      invalidatesTags: ["EMAIL_TEMPLATES"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useListEmailTemplatesQuery,
  useLazyListEmailTemplatesQuery,
  useCreateEmailTemplateMutation,
  useGetEmailTemplateQuery,
  useUpdateEmailTemplateMutation,
  useDeleteEmailTemplateMutation,
} = emailTemplateAPI

export default emailTemplateAPI
