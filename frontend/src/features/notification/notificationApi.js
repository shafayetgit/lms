import api from "@/redux/api";

export const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    readNotifications: builder.query({
      query: (params) => ({
        url: "/api/v1/notifications/",
        method: "GET",
        params,
      }),
      providesTags: ["NOTIFICATIONS"],
    }),
    markNotificationAsRead: builder.mutation({
      query: (publicId) => ({
        url: `/api/v1/notifications/${publicId}/read`,
        method: "PUT",
      }),
      invalidatesTags: ["NOTIFICATIONS"],
    }),
    markAllNotificationsAsRead: builder.mutation({
      query: () => ({
        url: "/api/v1/notifications/read-all",
        method: "PUT",
      }),
      invalidatesTags: ["NOTIFICATIONS"],
    }),
  }),
});

export const {
  useReadNotificationsQuery,
  useLazyReadNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} = notificationApi;
