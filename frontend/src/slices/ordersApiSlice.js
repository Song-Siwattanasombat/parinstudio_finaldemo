import { apiSlice } from './apiSlice';
import { ORDERS_URL, PAYMENTS_URL } from '../constants';


export const ordersApiSlice = apiSlice.injectEndpoints ({
  endpoints: (builder) => ({
    createOrder: builder.mutation ({
      query: (order) => ({
        url: ORDERS_URL,
        method: 'POST',
        body: {...order}
      }),
    }),
    getOrderDetails: builder.query({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}`,
      }),
      keepUnusedDataFor: 5
    }),
    getPaymentConfig: builder.query ({
      query: () => ({
        url: PAYMENTS_URL,
      }),
      keepUnusedDataFor: 5,
    }),
    createStripeCheckoutSession: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/stripe-checkout-session`,
        method: 'POST',
      }),
    }),
    confirmStripePayment: builder.mutation({
      query: ({ orderId, sessionId }) => ({
        url: `${ORDERS_URL}/${orderId}/stripe-session`,
        method: 'PUT',
        body: { sessionId },
      }),
    }),
    getMyOrders: builder.query ({
      query: () => ({
        url: `${ORDERS_URL}/mine`,
      }),
      keepUnusedDataFor: 5,
    }),
    getOrders: builder.query ({
      query: () => ({
        url: ORDERS_URL,        
      }),
      providesTags: ['Order'],
      keepUnusedDataFor: 5,
    }),
    deliverOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/deliver`,
        method: 'PUT',
      }),
      invalidatesTags: ['Order'],
    }),
    deleteOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Order'],
    }),
  }),
});

export const { 
  useCreateOrderMutation, 
  useGetOrderDetailsQuery,
  useGetPaymentConfigQuery,
  useCreateStripeCheckoutSessionMutation,
  useConfirmStripePaymentMutation,
  useGetMyOrdersQuery, 
  useGetOrdersQuery,
  useDeliverOrderMutation, 
  useDeleteOrderMutation,
} 
  = ordersApiSlice; 
