import api from "@/redux/api"

const featureFlagAPI = api.injectEndpoints({
  endpoints: builder => ({
    getFeatureFlags: builder.query({
      query: params => ({
        url: "api/v1/feature-flags",
        params,
      }),
      providesTags: ["FEATURE_FLAGS"],
    }),
    createFeatureFlag: builder.mutation({
      query: body => ({
        url: "api/v1/feature-flags",
        method: "POST",
        body,
      }),
      invalidatesTags: ["FEATURE_FLAGS"],
    }),
    updateFeatureFlag: builder.mutation({
      query: ({ publicId, ...body }) => ({
        url: `api/v1/feature-flags/${publicId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["FEATURE_FLAGS", "USERS"],
    }),
    deleteFeatureFlag: builder.mutation({
      query: publicId => ({
        url: `api/v1/feature-flags/${publicId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FEATURE_FLAGS", "USERS"],
    }),
    getFeatureFlag: builder.query({
      query: publicId => ({
        url: `api/v1/feature-flags/${publicId}`,
      }),
      providesTags: (result, error, publicId) => [{ type: "FEATURE_FLAGS", id: publicId }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetFeatureFlagsQuery,
  useGetFeatureFlagQuery,
  useCreateFeatureFlagMutation,
  useUpdateFeatureFlagMutation,
  useDeleteFeatureFlagMutation,
} = featureFlagAPI

export default featureFlagAPI
