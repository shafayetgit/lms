import api from "@/redux/api"

const roleProfileAPI = api.injectEndpoints({
  endpoints: builder => ({
    getRoleProfiles: builder.query({
      query: params => ({
        url: "api/v1/role-profiles",
        params,
      }),
      providesTags: ["ROLE_PROFILES"],
    }),
    getRoleProfile: builder.query({
      query: publicId => `api/v1/role-profiles/${publicId}`,
      providesTags: ["ROLE_PROFILES"],
    }),
    createRoleProfile: builder.mutation({
      query: body => ({
        url: "api/v1/role-profiles",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ROLE_PROFILES", "USERS"],
    }),
    updateRoleProfile: builder.mutation({
      query: ({ publicId, ...body }) => ({
        url: `api/v1/role-profiles/${publicId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["ROLE_PROFILES", "USERS"],
    }),
    deleteRoleProfile: builder.mutation({
      query: publicId => ({
        url: `api/v1/role-profiles/${publicId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ROLE_PROFILES", "USERS"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetRoleProfilesQuery,
  useGetRoleProfileQuery,
  useCreateRoleProfileMutation,
  useUpdateRoleProfileMutation,
  useDeleteRoleProfileMutation,
} = roleProfileAPI

export default roleProfileAPI
