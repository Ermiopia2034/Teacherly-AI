import axios from 'axios';

// Define the base URL for your API. Adjust if your backend runs elsewhere.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create an Axios instance for API calls
// We use `withCredentials: true` so that cookies (like HttpOnly auth token) are sent
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, 
});

// Ensure backend-provided human-readable errors (response.data.detail) surface in UI
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      const detail = (error?.response?.data && typeof error.response.data.detail === 'string')
        ? error.response.data.detail
        : undefined;
      if (detail) {
        error.message = detail;
      }
    } catch {
      // no-op: fall back to default axios error message
    }
    return Promise.reject(error);
  }
);

export default apiClient;