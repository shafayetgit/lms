import api from "@/redux/api"

export const liveClassApi = api.injectEndpoints({
  endpoints: builder => ({
    createLiveClass: builder.mutation({
      query: body => ({
        url: "/api/v1/live-classes/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["LIVE_CLASSES"],
    }),
    readLiveClasses: builder.query({
      query: params => ({
        url: "/api/v1/live-classes/",
        method: "GET",
        params,
      }),
      providesTags: ["LIVE_CLASSES"],
    }),
    readLiveClass: builder.query({
      query: id => `/api/v1/live-classes/${id}`,
      providesTags: ["LIVE_CLASSES"],
    }),
    updateLiveClass: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/v1/live-classes/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["LIVE_CLASSES"],
    }),
    deleteLiveClass: builder.mutation({
      query: id => ({
        url: `/api/v1/live-classes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["LIVE_CLASSES"],
    }),
  }),
})

export const {
  useCreateLiveClassMutation,
  useReadLiveClassesQuery,
  useLazyReadLiveClassesQuery,
  useReadLiveClassQuery,
  useUpdateLiveClassMutation,
  useDeleteLiveClassMutation,
} = liveClassApi
