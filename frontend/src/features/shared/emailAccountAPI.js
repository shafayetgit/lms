import api from "@/redux/api"

const PREFIX = "api/v1/email-accounts"

const emailAccountAPI = api.injectEndpoints({
  endpoints: builder => ({
    listEmailAccounts: builder.query({
      query: params => ({ url: `${PREFIX}/`, params }),
      providesTags: ["EMAIL_ACCOUNTS"],
    }),

    getDefaultOutgoingAccount: builder.query({
      query: () => `${PREFIX}/default-outgoing`,
      providesTags: ["EMAIL_ACCOUNTS"],
    }),

    createEmailAccount: builder.mutation({
      query: body => ({ url: `${PREFIX}/`, method: "POST", body }),
      invalidatesTags: ["EMAIL_ACCOUNTS"],
    }),

    getEmailAccount: builder.query({
      query: ({ id }) => `${PREFIX}/${id}`,
      providesTags: (result, error, { id }) => [{ type: "EMAIL_ACCOUNTS", id }],
    }),

    updateEmailAccount: builder.mutation({
      query: ({ id, body }) => ({
        url: `${PREFIX}/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        "EMAIL_ACCOUNTS",
        { type: "EMAIL_ACCOUNTS", id },
      ],
    }),

    deleteEmailAccount: builder.mutation({
      query: ({ id }) => ({ url: `${PREFIX}/${id}`, method: "DELETE" }),
      invalidatesTags: ["EMAIL_ACCOUNTS"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useListEmailAccountsQuery,
  useGetDefaultOutgoingAccountQuery,
  useCreateEmailAccountMutation,
  useGetEmailAccountQuery,
  useUpdateEmailAccountMutation,
  useDeleteEmailAccountMutation,
} = emailAccountAPI

export default emailAccountAPI
