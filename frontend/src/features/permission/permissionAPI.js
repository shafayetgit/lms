import api from "@/redux/api"

const PREFIX = "api/v1/permissions"

const permissionAPI = api.injectEndpoints({
  endpoints: builder => ({
    getPermissions: builder.query({
      query: params => ({
        url: PREFIX,
        params,
      }),
      providesTags: ["PERMISSIONS"],
    }),
    createPermission: builder.mutation({
      query: body => ({
        url: PREFIX,
        method: "POST",
        body,
      }),
      invalidatesTags: ["PERMISSIONS"],
    }),
    updatePermission: builder.mutation({
      query: ({ publicId, ...body }) => ({
        url: `${PREFIX}/${publicId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["PERMISSIONS"],
    }),
    deletePermission: builder.mutation({
      query: publicId => ({
        url: `${PREFIX}/${publicId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PERMISSIONS"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetPermissionsQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
} = permissionAPI

export default permissionAPI
