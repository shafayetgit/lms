import api from "@/redux/api";

export const paymentGatewayApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listGatewayConfigs: builder.query({
      query: () => ({ url: "/api/v1/payment-gateways/", method: "GET" }),
      providesTags: ["PAYMENT_GATEWAYS"],
    }),
    createGatewayConfig: builder.mutation({
      query: (body) => ({ url: "/api/v1/payment-gateways/", method: "POST", body }),
      invalidatesTags: ["PAYMENT_GATEWAYS"],
    }),
    updateGatewayConfig: builder.mutation({
      query: ({ gateway, body }) => ({
        url: `/api/v1/payment-gateways/${gateway}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["PAYMENT_GATEWAYS"],
    }),
    deleteGatewayConfig: builder.mutation({
      query: (gateway) => ({
        url: `/api/v1/payment-gateways/${gateway}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PAYMENT_GATEWAYS"],
    }),
    initiateCheckout: builder.mutation({
      query: (payment_public_id) => ({
        url: `/api/v1/payment-gateways/initiate/${payment_public_id}`,
        method: "POST",
      }),
    }),
    createPaymentIntent: builder.mutation({
      query: (payment_public_id) => ({
        url: `/api/v1/payment-gateways/payment-intent/${payment_public_id}`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useListGatewayConfigsQuery,
  useCreateGatewayConfigMutation,
  useUpdateGatewayConfigMutation,
  useDeleteGatewayConfigMutation,
  useInitiateCheckoutMutation,
  useCreatePaymentIntentMutation,
} = paymentGatewayApi;
