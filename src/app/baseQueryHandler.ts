import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../app/store';
import { logout } from '../features/auth/authSlice'; // Import your logout action
import { BASE_URL1 } from '@/config';

// Create a custom fetch base query with consistent headers
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: BASE_URL1,
  prepareHeaders: (headers, { getState }) => {
    // Add auth token if available
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    // Add language from localStorage if available
    headers.set('accept', '*/*');
    return headers;
  },
});

// Wrapper for handling 401 errors
export const customBaseQuery = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQueryWithAuth(args, api, extraOptions);
  
  // If we get a 401 Unauthorized response, dispatch logout action
  if (result.error && result.error.status === 401) {
    // Dispatch logout action
    api.dispatch(logout());
    
    // Optional: You can redirect to login page here if not using React Router
    // window.location.href = '/login';
  }
  
  return result;
};