import api from "@/redux/api"

const PREFIX = "api/v1/batches"

const batchAPI = api.injectEndpoints({
  endpoints: builder => ({
    createBatch: builder.mutation({
      query: body => ({ url: `${PREFIX}/`, method: "POST", body }),
      invalidatesTags: ["BATCHES"],
    }),
    readBatchMeta: builder.query({
      query: () => `${PREFIX}/meta`,
    }),
    readBatches: builder.query({
      query: ({ published_only, page = 1, size = 10 } = {}) => {
        const params = new URLSearchParams()
        if (published_only) params.append("published_only", published_only)
        if (page) params.append("page", page)
        if (size) params.append("size", size)
        const queryString = params.toString()
        return queryString ? `${PREFIX}/?${queryString}` : `${PREFIX}/`
      },
      providesTags: ["BATCHES"],
    }),
    readBatch: builder.query({
      query: ({ id } = {}) => `${PREFIX}/${id}`,
      providesTags: ["BATCHES"],
    }),
    updateBatch: builder.mutation({
      query: ({ id, body } = {}) => ({ url: `${PREFIX}/${id}`, method: "PUT", body }),
      invalidatesTags: ["BATCHES"],
    }),
    deleteBatch: builder.mutation({
      query: ({ id } = {}) => ({ url: `${PREFIX}/${id}`, method: "DELETE" }),
      invalidatesTags: ["BATCHES"],
    }),
    enrollInBatch: builder.mutation({
      query: ({ id } = {}) => ({ url: `${PREFIX}/${id}/enroll`, method: "POST" }),
      invalidatesTags: ["BATCHES", "ENROLLMENTS"],
    }),
    createBatchTimetable: builder.mutation({
      query: ({ id, body } = {}) => ({
        url: `${PREFIX}/${id}/timetables`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["BATCHES"],
    }),
    updateBatchTimetable: builder.mutation({
      query: ({ batchId, timetableId, body } = {}) => ({
        url: `${PREFIX}/${batchId}/timetables/${timetableId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["BATCHES"],
    }),
    deleteBatchTimetable: builder.mutation({
      query: ({ batchId, timetableId } = {}) => ({
        url: `${PREFIX}/${batchId}/timetables/${timetableId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BATCHES"],
    }),
    readBatchEnrollments: builder.query({
      query: ({ id, page = 1, size = 10 } = {}) => {
        const params = new URLSearchParams()
        if (page) params.append("page", page)
        if (size) params.append("size", size)
        const queryString = params.toString()
        return queryString
          ? `${PREFIX}/${id}/enrollments?${queryString}`
          : `${PREFIX}/${id}/enrollments`
      },
      providesTags: ["BATCH_ENROLLMENTS"],
    }),
    createBatchEnrollment: builder.mutation({
      query: ({ batchId, body } = {}) => ({
        url: `${PREFIX}/${batchId}/enrollments`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["BATCH_ENROLLMENTS", "BATCHES"],
    }),
    deleteBatchEnrollment: builder.mutation({
      query: ({ batchId, enrollmentId } = {}) => ({
        url: `${PREFIX}/${batchId}/enrollments/${enrollmentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BATCH_ENROLLMENTS", "BATCHES"],
    }),
  }),
  overrideExisting: true,
})

export const {
  useCreateBatchMutation,
  useReadBatchMetaQuery,
  useLazyReadBatchMetaQuery,
  useReadBatchesQuery,
  useLazyReadBatchesQuery,
  useReadBatchQuery,
  useUpdateBatchMutation,
  useDeleteBatchMutation,
  useEnrollInBatchMutation,
  useCreateBatchTimetableMutation,
  useUpdateBatchTimetableMutation,
  useDeleteBatchTimetableMutation,
  useReadBatchEnrollmentsQuery,
  useLazyReadBatchEnrollmentsQuery,
  useCreateBatchEnrollmentMutation,
  useDeleteBatchEnrollmentMutation,
} = batchAPI

export default batchAPI
