# Teacherly AI Frontend - Development Guidelines

This document outlines the frontend's current architecture, focusing on authentication, interaction with the backend API, and state management, providing guidelines for future development.

## Current Status (As of May 12, 2025)

-   **Framework:** Next.js (App Router)
-   **Language:** TypeScript
-   **Styling:** CSS Modules (e.g., `auth.module.css`), global CSS (`globals.css`).
-   **API Client:** Axios
-   **State Management (Auth):** React Context API (`AuthContext`)

## Backend Connection

-   **API Base URL:** Defined in [`src/lib/auth.ts`](./src/lib/auth.ts). It uses the `NEXT_PUBLIC_API_URL` environment variable, falling back to `http://localhost:8000/api`.
    -   **Guideline:** Ensure `NEXT_PUBLIC_API_URL` is set correctly in your environment (e.g., `.env.local` for development) to point to the running backend API URL.
-   **API Client:** A pre-configured Axios instance (`apiClient`) is created in [`src/lib/auth.ts`](./src/lib/auth.ts).
    -   **`withCredentials: true`:** This crucial setting ensures that the browser sends the HttpOnly `access_token` cookie (set by the backend during login) with subsequent requests to the backend API. This is necessary for maintaining the authenticated session.
    -   **Guideline:** Always use this `apiClient` instance for making requests to the backend API to ensure credentials are handled correctly. Avoid using the global `axios` directly for backend calls.

## Authentication Flow & State Management

1.  **Core API Functions:** Located in [`src/lib/auth.ts`](./src/lib/auth.ts):
    -   `signup(credentials)`: Sends registration data to `/auth/register`.
    -   `login(credentials)`: Sends `username` (using email) and `password` as form data to `/auth/login`. The backend responds with user data and sets the `access_token` HttpOnly cookie.
    -   `logout()`: Calls `/auth/logout` on the backend, which should invalidate the cookie.
    -   `fetchCurrentUser()`: Calls `/auth/users/me` on the backend. Uses the cookie sent automatically by the browser (due to `withCredentials: true`) for authentication. Returns user data if authenticated, `null` if not (handles 401 errors).
2.  **Authentication Context:** [`src/context/AuthContext.tsx`](./src/context/AuthContext.tsx) provides global state and functions related to authentication:
    -   **State:** Typically holds the current `user` object and loading/error states.
    -   **Functions:** Wraps the API calls from `auth.ts` (e.g., `login`, `logout`, `signup`). Handles updating the user state upon successful login/logout or fetching user data. Manages loading indicators.
    -   **Initialization:** Likely calls `fetchCurrentUser` on initial load to check if a valid session cookie exists and populate the user state.
    -   **Provider:** The `AuthProvider` wraps the application (likely in [`src/app/layout.tsx`](./src/app/layout.tsx)) to make the context available throughout the component tree.
    -   **Guideline:** Use the `useAuth()` hook (exported from `AuthContext.tsx`) to access user state and authentication functions (like `login`, `logout`) within components. Avoid calling API functions directly from components; use the context methods.
3.  **UI Components:**
    -   [`src/app/auth/page.tsx`](./src/app/auth/page.tsx): Contains the login/signup form UI. Uses the `useAuth` hook to call the `login` or `signup` context functions on form submission.
    -   **Redirects:** Navigation after login/logout is likely handled within the `AuthContext` functions (e.g., using `useRouter` from `next/navigation` after a successful login) or potentially via route protection logic in layouts.
4.  **Route Protection:** Authenticated routes (like the dashboard) might be protected by checking the user state from `AuthContext` within their layout ([`src/app/dashboard/layout.tsx`](./src/app/dashboard/layout.tsx)) or page components, redirecting unauthenticated users to the login page.

## Key Files Summary

-   [`src/lib/auth.ts`](./src/lib/auth.ts): Axios instance configuration and raw API call functions.
-   [`src/context/AuthContext.tsx`](./src/context/AuthContext.tsx): Global state management for authentication, wrapping API calls.
-   [`src/app/layout.tsx`](./src/app/layout.tsx): Root layout, likely includes the `AuthProvider`.
-   [`src/app/auth/page.tsx`](./src/app/auth/page.tsx): Login/Signup UI.
-   [`src/app/dashboard/layout.tsx`](./src/app/dashboard/layout.tsx): Layout for authenticated routes, potentially includes auth checks.

## Development Guidelines

-   **API Interaction:** Use the `apiClient` from [`src/lib/auth.ts`](./src/lib/auth.ts) for all backend communication. Define new API functions within `src/lib/` (e.g., `src/lib/content.ts` for content-related endpoints).
-   **Authentication State:** Rely on `AuthContext` for accessing the current user's data and performing login/logout actions.
-   **Environment:** Ensure `NEXT_PUBLIC_API_URL` is configured in `.env.local` (and other environment files as needed) pointing to the correct backend URL. Remember to add `.env*.local` to `.gitignore`.
-   **Error Handling:** Implement user-friendly error handling for API request failures (e.g., displaying messages from backend responses or generic error alerts). The `AuthContext` is a good place to centralize some of this for auth actions.
-   **Dependencies:** Add new frontend dependencies using `npm install` or `yarn add`. Keep dependencies up-to-date where feasible.

Adhering to these patterns will help maintain consistency and ensure that authentication and backend communication work reliably as new features are added.