const { baseQuery } = require("@/redux/baseQuery")
const { createApi } = require("@reduxjs/toolkit/query/react")

const PREFIX = "accounts/profile"

const profileApiSlice = createApi({
  reducerPath: "accounts.profile.api",
  baseQuery: baseQuery,
  tagTypes: ["Address"],
  endpoints: builder => ({
    // Address list
    addressList: builder.query({
      query: () => `${PREFIX}/address-list`,
      providesTags: ["Address"],
    }),
    // Address create
    addressCreate: builder.mutation({
      query: data => ({
        url: `${PREFIX}/address-create`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Address"],
    }),
    // Address update
    addressUpdate: builder.mutation({
      query: ({ address_id, ...data }) => ({
        url: `${PREFIX}/address-update/${address_id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Address"],
    }),
    // Address delete
    addressDelete: builder.mutation({
      query: address_id => ({
        url: `${PREFIX}/address-delete/${address_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Address"],
    }),
  }),
})

export const { useAddressListQuery, useAddressCreateMutation, useAddressUpdateMutation, useAddressDeleteMutation } =
  profileApiSlice
export default profileApiSlice
