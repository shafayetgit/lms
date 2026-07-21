import api from "@/redux/api"

export const certificateApi = api.injectEndpoints({
  endpoints: builder => ({
    createCertificate: builder.mutation({
      query: body => ({
        url: "/api/v1/certificates/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CERTIFICATES"],
    }),
    readCertificates: builder.query({
      query: params => ({
        url: "/api/v1/certificates/",
        method: "GET",
        params,
      }),
      providesTags: ["CERTIFICATES"],
    }),
    readCertificate: builder.query({
      query: id => `/api/v1/certificates/${id}`,
      providesTags: ["CERTIFICATES"],
    }),
    updateCertificate: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/v1/certificates/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["CERTIFICATES"],
    }),
    deleteCertificate: builder.mutation({
      query: id => ({
        url: `/api/v1/certificates/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CERTIFICATES"],
    }),

    requestCertificate: builder.mutation({
      query: body => ({
        url: "/api/v1/certificates/request",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CERTIFICATES"],
    }),
    readCertificateRequests: builder.query({
      query: params => ({
        url: "/api/v1/certificates/requests",
        method: "GET",
        params,
      }),
      providesTags: ["CERTIFICATES"],
    }),
    readCertificateRequest: builder.query({
      query: id => `/api/v1/certificates/requests/${id}`,
      providesTags: ["CERTIFICATES"],
    }),
    updateCertificateRequest: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/v1/certificates/requests/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["CERTIFICATES"],
    }),

    createEvaluation: builder.mutation({
      query: body => ({
        url: "/api/v1/certificates/evaluations",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CERTIFICATES"],
    }),
    readEvaluations: builder.query({
      query: params => ({
        url: "/api/v1/certificates/evaluations",
        method: "GET",
        params,
      }),
      providesTags: ["CERTIFICATES"],
    }),
    readEvaluation: builder.query({
      query: id => `/api/v1/certificates/evaluations/${id}`,
      providesTags: ["CERTIFICATES"],
    }),
    gradeEvaluation: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/v1/certificates/evaluations/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["CERTIFICATES"],
    }),
  }),
})

export const {
  useCreateCertificateMutation,
  useReadCertificatesQuery,
  useLazyReadCertificatesQuery,
  useReadCertificateQuery,
  useUpdateCertificateMutation,
  useDeleteCertificateMutation,

  useRequestCertificateMutation,
  useReadCertificateRequestsQuery,
  useLazyReadCertificateRequestsQuery,
  useReadCertificateRequestQuery,
  useLazyReadCertificateRequestQuery,
  useUpdateCertificateRequestMutation,

  useCreateEvaluationMutation,
  useReadEvaluationsQuery,
  useLazyReadEvaluationsQuery,
  useReadEvaluationQuery,
  useGradeEvaluationMutation,
} = certificateApi
