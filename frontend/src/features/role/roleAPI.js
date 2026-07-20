import api from "@/redux/api"

const roleAPI = api.injectEndpoints({
  endpoints: builder => ({
    getRoles: builder.query({
      query: params => ({
        url: "api/v1/roles",
        params,
      }),
      providesTags: ["ROLES"],
    }),
    createRole: builder.mutation({
      query: body => ({
        url: "api/v1/roles",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ROLES"],
    }),
    updateRole: builder.mutation({
      query: ({ publicId, ...body }) => ({
        url: `api/v1/roles/${publicId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["ROLES"],
    }),
    deleteRole: builder.mutation({
      query: publicId => ({
        url: `api/v1/roles/${publicId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ROLES"],
    }),
    getRole: builder.query({
      query: publicId => ({
        url: `api/v1/roles/${publicId}`,
      }),
      providesTags: (result, error, publicId) => [{ type: "ROLES", id: publicId }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetRolesQuery,
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = roleAPI

export default roleAPI
