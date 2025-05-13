import axios from 'axios';

// Define the base URL for your API. Adjust if your backend runs elsewhere.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create an Axios instance for API calls
// We use `withCredentials: true` so that cookies (like HttpOnly auth token) are sent
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, 
});

export default apiClient;