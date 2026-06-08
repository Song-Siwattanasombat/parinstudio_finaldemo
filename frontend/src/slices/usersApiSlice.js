import {USERS_URL} from '../constants';
import { apiSlice } from './apiSlice';

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/auth`,  
        method: 'POST',
        body:data,       
      }),     
    }),  
    googleLogin: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/google`,
        method: 'POST',
        body: data,
      }),
    }),

    register: builder.mutation ({
      query: (data) => ({
        url: `${USERS_URL}`,
        method: 'POST',
        body: data,  
      }),
    }),
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/forgot-password`,
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ token, password }) => ({
        url: `${USERS_URL}/reset-password/${token}`,
        method: 'PUT',
        body: { password },
      }),
    }),

    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: 'POST', 
      }), 
    }),
    profile:builder.mutation ({
      query: (data) => ({
        url: `${USERS_URL}/profile`,
        method: 'PUT',
        body: data, 
      }),
      invalidatesTags: ['Users'],
    }),
    getProfile: builder.query({
      query: () => ({
        url: `${USERS_URL}/profile`,
      }),
      keepUnusedDataFor: 5,
    }),
    getUsers: builder.query({
      query : () => ({
        url: USERS_URL
      }),
      providesTags: ['Users'],
      keepUnusedDataFor:5
    }),
       deleteUser: builder.mutation({
      query : (userId) => ({
        url: `${USERS_URL}/${userId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Users'],
    }),
    getUserDetails: builder.query({
      query : (userId) => ({
        url: `${USERS_URL}/${userId}`
      }),
      keepUnusedDataFor:5
    }),
    updateUser: builder.mutation({
      query : (data) => ({
        url: `${USERS_URL}/${data.userId}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['Users'],
    }),
  }),
});

export const { 

  useLoginMutation, 
  useGoogleLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,
  useRegisterMutation,
  useProfileMutation,
  useLazyGetProfileQuery,
  useGetUsersQuery,
  useDeleteUserMutation, 
  useGetUserDetailsQuery,
  useUpdateUserMutation, 
  
 } = usersApiSlice; 
