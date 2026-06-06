import api from "@/redux/api"

const PREFIX = "api/v1/categories"

const categoryAPI = api.injectEndpoints({
  reducerPath: "categoryAPI",
  endpoints: builder => ({
    create: builder.mutation({
      query: body => ({
        url: `${PREFIX}`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["CATEGORIES"],
    }),

    list: builder.query({
      query: ({ type = "", size, page, term }) => {
        const params = new URLSearchParams()

        if (term) params.set("term", term)
        if (type) params.set("type", type)
        if (page !== undefined) params.set("page", page)
        if (size !== undefined) params.set("size", size)

        const queryString = params.toString()
        return queryString ? `${PREFIX}/?${queryString}` : PREFIX
      },
      providesTags: ["CATEGORIES"],
    }),

    read: builder.query({
      query: ({ id } = {}) => `${PREFIX}/${id}`,
    }),

    update: builder.mutation({
      query: ({ id, body } = {}) => ({
        url: `${PREFIX}/${id}`,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ["CATEGORIES"],
    }),
  }),
  overrideExisting: true,
})

export const {
  useCreateMutation,
  useListQuery,
  useLazyListQuery,
  useReadQuery,
  useUpdateMutation,
} = categoryAPI
export default categoryAPI
