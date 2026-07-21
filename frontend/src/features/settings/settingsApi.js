import api from "@/redux/api"

export const settingsApi = api.injectEndpoints({
  endpoints: builder => ({
    readSettings: builder.query({
      query: () => ({
        url: "/api/v1/settings/",
        method: "GET",
      }),
      providesTags: ["SETTINGS"],
    }),
    updateSettings: builder.mutation({
      query: body => ({
        url: `/api/v1/settings/`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["SETTINGS"],
    }),
    flushCache: builder.mutation({
      query: () => ({
        url: "/api/v1/settings/cache",
        method: "DELETE",
      }),
    }),
  }),
})

export const {
  useReadSettingsQuery,
  useLazyReadSettingsQuery,
  useUpdateSettingsMutation,
  useFlushCacheMutation,
} = settingsApi
