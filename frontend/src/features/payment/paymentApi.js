import api from "@/redux/api"

export const paymentApi = api.injectEndpoints({
  endpoints: builder => ({
    // Coupons
    createCoupon: builder.mutation({
      query: body => ({
        url: "/api/v1/payments/coupons",
        method: "POST",
        body,
      }),
      invalidatesTags: ["COUPONS"],
    }),
    readCoupons: builder.query({
      query: params => ({
        url: "/api/v1/payments/coupons",
        method: "GET",
        params,
      }),
      providesTags: ["COUPONS"],
    }),
    readCoupon: builder.query({
      query: id => `/api/v1/payments/coupons/${id}`,
      providesTags: ["COUPONS"],
    }),
    updateCoupon: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/v1/payments/coupons/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["COUPONS"],
    }),
    deleteCoupon: builder.mutation({
      query: id => ({
        url: `/api/v1/payments/coupons/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["COUPONS"],
    }),
    validateCoupon: builder.mutation({
      query: body => ({
        url: "/api/v1/payments/coupons/validate",
        method: "POST",
        body,
      }),
    }),

    // Payments
    createPayment: builder.mutation({
      query: body => ({
        url: "/api/v1/payments/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PAYMENTS"],
    }),
    readPayments: builder.query({
      query: params => ({
        url: "/api/v1/payments/",
        method: "GET",
        params,
      }),
      providesTags: ["PAYMENTS"],
    }),
    readPayment: builder.query({
      query: id => `/api/v1/payments/${id}`,
      providesTags: ["PAYMENTS"],
    }),
    updatePaymentStatus: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/v1/payments/${id}/status`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["PAYMENTS"],
    }),
    getCheckoutLink: builder.mutation({
      query: body => ({
        url: "/api/v1/payments/checkout-link",
        method: "POST",
        body,
      }),
    }),
    readPaymentByPublicId: builder.query({
      query: public_id => `/api/v1/payments/public/${public_id}`,
      providesTags: ["PAYMENTS"],
    }),
  }),
})

export const {
  useCreateCouponMutation,
  useReadCouponsQuery,
  useLazyReadCouponsQuery,
  useReadCouponQuery,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useValidateCouponMutation,

  useCreatePaymentMutation,
  useReadPaymentsQuery,
  useLazyReadPaymentsQuery,
  useReadPaymentQuery,
  useUpdatePaymentStatusMutation,
  useGetCheckoutLinkMutation,
  useReadPaymentByPublicIdQuery,
} = paymentApi
