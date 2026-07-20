import api from "@/redux/api"

const PREFIX = "api/v1/users"

const userAPI = api.injectEndpoints({
  endpoints: builder => ({
    getUsers: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams()
        if (params.page !== undefined) queryParams.set("page", params.page)
        if (params.size !== undefined) queryParams.set("size", params.size)
        if (params.limit !== undefined) queryParams.set("limit", params.limit)
        if (params.skip !== undefined) queryParams.set("skip", params.skip)
        if (params.term) queryParams.set("term", params.term)

        const str = queryParams.toString()
        return str ? `${PREFIX}/?${str}` : `${PREFIX}/`
      },
      providesTags: ["USERS"],
    }),
    getUser: builder.query({
      query: publicId => ({
        url: `${PREFIX}/${publicId}`,
      }),
      providesTags: (result, error, publicId) => [{ type: "USERS", id: publicId }],
    }),
    createUser: builder.mutation({
      query: body => ({
        url: `${PREFIX}/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["USERS"],
    }),
    updateUser: builder.mutation({
      query: ({ publicId, id, ...body }) => ({
        url: `${PREFIX}/${publicId || id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { publicId, id }) => [
        "USERS",
        { type: "USERS", id: publicId || id },
        "ME",
      ],
    }),
    deleteUser: builder.mutation({
      query: publicId => ({
        url: `${PREFIX}/${publicId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["USERS"],
    }),
    getInvitations: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams()
        if (params.page !== undefined) queryParams.set("page", params.page)
        if (params.limit !== undefined) queryParams.set("limit", params.limit)
        if (params.skip !== undefined) queryParams.set("skip", params.skip)
        if (params.term) queryParams.set("term", params.term)

        const str = queryParams.toString()
        return str ? `api/v1/invitations/?${str}` : "api/v1/invitations/"
      },
      providesTags: ["INVITATIONS"],
    }),
    createInvitations: builder.mutation({
      query: body => ({
        url: "api/v1/invitations",
        method: "POST",
        body,
      }),
      invalidatesTags: ["INVITATIONS"],
    }),
    deleteInvitation: builder.mutation({
      query: publicId => ({
        url: `api/v1/invitations/${publicId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["INVITATIONS"],
    }),
    getUserRoles: builder.query({
      query: () => `${PREFIX}/roles`,
      providesTags: ["ROLES"],
    }),
    getMe: builder.query({
      query: () => `${PREFIX}/me`,
      providesTags: ["ME"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetInvitationsQuery,
  useCreateInvitationsMutation,
  useDeleteInvitationMutation,
  useGetUserRolesQuery,
  useGetMeQuery,
} = userAPI

export default userAPI
