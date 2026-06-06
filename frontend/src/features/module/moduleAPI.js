import api from "@/redux/api"

const PREFIX = "api/v1/modules"

const moduleAPI = api.injectEndpoints({
  endpoints: builder => ({
    createModule: builder.mutation({
      query: body => ({
        url: `${PREFIX}/`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["MODULES"],
    }),

    readModulesByCourse: builder.query({
      query: ({ courseId }) => `${PREFIX}/course/${courseId}`,
      providesTags: ["MODULES"],
    }),

    readModule: builder.query({
      query: ({ id } = {}) => `${PREFIX}/${id}`,
    }),

    updateModule: builder.mutation({
      query: ({ id, body } = {}) => ({
        url: `${PREFIX}/${id}`,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ["MODULES"],
    }),
    
    deleteModule: builder.mutation({
      query: ({ id } = {}) => ({
        url: `${PREFIX}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MODULES"],
    }),

    reorderModules: builder.mutation({
      query: ({ courseId, body } = {}) => ({
        url: `${PREFIX}/course/${courseId}/reorder`,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ["MODULES"],
    }),
  }),
  overrideExisting: true,
})

export const {
  useCreateModuleMutation,
  useReadModulesByCourseQuery,
  useLazyReadModulesByCourseQuery,
  useReadModuleQuery,
  useUpdateModuleMutation,
  useDeleteModuleMutation,
  useReorderModulesMutation,
} = moduleAPI
export default moduleAPI
