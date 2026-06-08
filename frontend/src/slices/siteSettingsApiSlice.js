import { apiSlice } from './apiSlice';
import { SITE_SETTINGS_URL, UPLOAD_URL } from '../constants';

export const siteSettingsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSiteSettings: builder.query({
      query: () => ({
        url: SITE_SETTINGS_URL,
      }),
      providesTags: ['SiteSettings'],
      keepUnusedDataFor: 5,
    }),
    updateSiteSettings: builder.mutation({
      query: (data) => ({
        url: SITE_SETTINGS_URL,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['SiteSettings'],
    }),
    uploadSiteImage: builder.mutation({
      query: (data) => ({
        url: UPLOAD_URL,
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetSiteSettingsQuery,
  useUpdateSiteSettingsMutation,
  useUploadSiteImageMutation,
} = siteSettingsApiSlice;
