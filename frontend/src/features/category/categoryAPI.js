import api from "@/redux/api"

const PREFIX = "api/v1/categories"

const categoryAPI = api.injectEndpoints({
  endpoints: builder => ({
    createCategory: builder.mutation({
      query: body => ({
        url: `${PREFIX}`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["CATEGORIES"],
    }),

    readCategories: builder.query({
      query: ({ badge = "", size, page, term }) => {
        const params = new URLSearchParams()

        if (term) params.set("term", term)
        if (badge) params.set("badge", badge)
        if (page !== undefined) params.set("page", page)
        if (size !== undefined) params.set("size", size)

        const queryString = params.toString()
        return queryString ? `${PREFIX}/?${queryString}` : PREFIX
      },
      providesTags: ["CATEGORIES"],
    }),

    readCategory: builder.query({
      query: ({ id } = {}) => `${PREFIX}/${id}`,
    }),

    updateCategory: builder.mutation({
      query: ({ id, body } = {}) => ({
        url: `${PREFIX}/${id}`,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ["CATEGORIES"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useCreateCategoryMutation,
  useReadCategoriesQuery,
  useLazyReadCategoriesQuery,
  useReadCategoryQuery,
  useUpdateCategoryMutation,
} = categoryAPI
export default categoryAPI
