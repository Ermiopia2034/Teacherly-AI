# Teacherly AI Frontend - Development Guidelines

This document outlines the frontend's current architecture, focusing on authentication, component structure, interaction with the backend API, and state management, providing guidelines for future development.

## Current Status (As of June 16, 2025)

-   **Framework:** Next.js (App Router)
-   **Language:** TypeScript
-   **Styling:** CSS Modules (e.g., `auth.module.css`, component-specific modules like `PageHeader.module.css`), global CSS (`globals.css`).
-   **Component Structure:** Organized into `ui/` (atomic, presentational components), `features/` (domain-specific components), and `common/` (shared utility components) under `src/components/`.
-   **API Client:** Axios
-   **State Management:** Redux Toolkit (`@reduxjs/toolkit`)
-   **Import Paths:** Standardized to use path aliases (e.g., `@/components/...`).

## Backend Connection

-   **API Base URL:** Defined in API utility files (e.g., [`src/lib/api/client.ts`](./src/lib/api/client.ts) or specific API modules like [`src/lib/api/auth.ts`](./src/lib/api/auth.ts)). It typically uses the `NEXT_PUBLIC_API_URL` environment variable, falling back to `http://localhost:8000/api`.
    -   **Guideline:** Ensure `NEXT_PUBLIC_API_URL` is set correctly in your environment (e.g., `.env.local` for development) to point to the running backend API URL.
-   **API Client:** A pre-configured Axios instance (`apiClient`) is created in [`src/lib/api/client.ts`](./src/lib/api/client.ts).
    -   **`withCredentials: true`:** This crucial setting ensures that the browser sends the HttpOnly `access_token` cookie (set by the backend during login) with subsequent requests to the backend API. This is necessary for maintaining the authenticated session.
    -   **Guideline:** Always use this `apiClient` instance for making requests to the backend API to ensure credentials are handled correctly. Avoid using the global `axios` directly for backend calls.

## Import Path Standardization

To maintain a clean and predictable project structure, all import paths must use the configured path aliases. This avoids long, brittle relative paths (`../../../`) and makes code easier to move and read.

-   **Alias:** The primary alias is `@/`, which maps to the `src/` directory.
-   **Guideline:** **Always** use aliases for imports from anywhere within the `src/` directory.
    -   **Correct:** `import { Button } from '@/components/ui/Button';`
    -   **Correct:** `import { apiClient } from '@/lib/api/client';`
    -   **Incorrect:** `import { Button } from '../../ui/Button';`
-   **Verification:** Use find/replace or search tools to ensure no relative paths that traverse up directories (e.g., `../`) remain in the codebase.

## State Management with Redux Toolkit

The application uses Redux Toolkit for robust and scalable state management.

1.  **Store Configuration:**
    -   The Redux store is configured in [`src/lib/store.ts`](./src/lib/store.ts) using `configureStore`.
    -   This file also exports `RootState` and `AppDispatch` types for use throughout the application.
2.  **Provider Setup:**
    -   The Redux `Provider` component is implemented in a dedicated Client Component [`src/components/ClientProviders.tsx`](./src/components/ClientProviders.tsx), which is then imported in the Server Component [`src/app/layout.tsx`](./src/app/layout.tsx).
    -   This separation ensures that client-side functionality (Redux) is properly isolated from server components, preventing errors during static rendering.
    -   The `AppInitializer` component is a child of `ClientProviders` and handles dispatching the initial `fetchUser` action.
3.  **Slices:**
    -   State is organized into "slices" using `createSlice`. Each slice typically represents a domain of the application state (e.g., authentication, user profile, content generation).
    -   Example: Authentication state is managed in [`src/lib/features/auth/authSlice.ts`](./src/lib/features/auth/authSlice.ts).
    -   Slices define reducers for synchronous state updates and can include `extraReducers` to handle actions dispatched by `createAsyncThunk`.
4.  **Actions & Reducers:**
    -   Synchronous actions and their corresponding reducers are defined within each slice.
5.  **Asynchronous Logic (Thunks):**
    -   `createAsyncThunk` is used for handling asynchronous operations, such as API calls. These thunks typically dispatch pending, fulfilled, or rejected actions, which are then handled by `extraReducers` in the slice to update the state accordingly.
    -   Example: `loginUser`, `fetchUser`, `logoutUser` in `authSlice.ts`.
6.  **Selectors:**
    -   Selectors are functions that extract specific pieces of state from the Redux store. They are defined within their respective slice files (e.g., `selectUser`, `selectIsAuthLoading` in `authSlice.ts`).
    -   Memoized selectors (e.g., using `createSelector` from `reselect`, which is part of Redux Toolkit) can be used for performance optimization if complex computations are involved, though often not necessary for simple state access.
7.  **Component Interaction:**
    -   React components interact with the Redux store using hooks:
        -   `useSelector` to read data from the store.
        -   `useDispatch` to dispatch actions (both synchronous actions from slices and asynchronous thunks).

## Authentication Flow & State Management (Redux Toolkit)

1.  **Core API Functions:** Located in [`src/lib/api/auth.ts`](./src/lib/api/auth.ts):
    -   `signup(credentials)`: Sends registration data to `/auth/register`.
    -   `login(credentials)`: Sends `username` (using email) and `password` as form data to `/auth/login`. The backend responds with user data and sets the `access_token` HttpOnly cookie.
    -   `logout()`: Calls `/auth/logout` on the backend, which should invalidate the cookie.
    -   `fetchCurrentUser()`: Calls `/auth/users/me` on the backend. Uses the cookie sent automatically by the browser (due to `withCredentials: true`) for authentication. Returns user data if authenticated, `null` if not (handles 401 errors).
2.  **Authentication Slice (`authSlice`):** [`src/lib/features/auth/authSlice.ts`](./src/lib/features/auth/authSlice.ts) manages global state and asynchronous actions related to authentication:
    -   **State:** Holds the current `user` object, `isLoading` status, and `error` messages.
    -   **Async Thunks:**
        -   `loginUser`: Wraps the `apiLogin` call.
        -   `signupUser`: Wraps the `apiSignup` call.
        -   `logoutUser`: Wraps the `apiLogout` call.
        -   `fetchUser`: Wraps the `apiFetchCurrentUser` call.
    -   These thunks handle API interactions and update the Redux state based on the outcome (pending, fulfilled, rejected).
3.  **Initialization & User Fetching:**
    -   The `fetchUser` thunk is dispatched from a client component within [`src/app/layout.tsx`](./src/app/layout.tsx) (e.g., an `AppInitializer` component) when the application loads. This checks for an existing session and populates the user state in Redux.
4.  **UI Components & Interaction:**
    -   [`src/app/auth/page.tsx`](./src/app/auth/page.tsx): Contains the login/signup form UI. Uses `useDispatch` to dispatch `loginUser` or `signupUser` thunks and `useSelector` to access `isLoading` and `error` state from the `authSlice`.
    -   **Redirects:** Navigation after login/logout is typically handled within components based on the user state from Redux (e.g., using `useRouter` from `next/navigation` after a successful login, or when `user` state changes).
5.  **Route Protection:** Authenticated routes (like the dashboard) are protected by checking the user state from the `authSlice` (via `useSelector`) within their layout ([`src/app/dashboard/layout.tsx`](./src/app/dashboard/layout.tsx)) or page components. Unauthenticated users are redirected to the login page.
    -   **Guideline:** Use `useSelector` to access `user`, `isLoadingAuth` from the `authSlice` and `useDispatch` to call authentication thunks (like `logoutUser`) within components.

## Component Structure and Reusability

The frontend aims for a clear and maintainable component structure located under [`src/components/`](./src/components/).

-   **Base UI Components (`src/components/ui/`):**
    -   These are atomic, highly reusable, and primarily presentational components. They form the building blocks of the application's look and feel and should be application-agnostic.
    -   Examples: [`Button`](./src/components/ui/Button/Button.tsx), [`Card`](./src/components/ui/Card/Card.tsx), [`Breadcrumb`](./src/components/ui/Breadcrumb/Breadcrumb.tsx), [`LabeledInput`](./src/components/ui/LabeledInput/LabeledInput.tsx), [`LabeledSelect`](./src/components/ui/LabeledSelect/LabeledSelect.tsx), [`LabeledTextarea`](./src/components/ui/LabeledTextarea/LabeledTextarea.tsx), [`PageHeader`](./src/components/ui/PageHeader/PageHeader.tsx).
    -   **Guideline:** When creating a new generic UI element (e.g., a modal, a tooltip), it **must** be placed here. Each component **must** reside in its own directory (e.g., `src/components/ui/Button/`) containing the component file (`Button.tsx`), its CSS module (`Button.module.css`), and an `index.ts` for clean exports.
-   **Feature-Specific Components (`src/components/features/`):**
    -   These components are tied to specific application features or domains. They often compose multiple `ui/` components and may contain more business logic.
    -   They are organized into subdirectories named after the feature they belong to (e.g., `src/components/features/dashboard/`, `src/components/features/generation-hub/`, `src/components/features/auth/`).
    -   Examples: [`DashboardFeatureCard`](./src/components/features/dashboard/DashboardFeatureCard/DashboardFeatureCard.tsx), [`QuickActionCard`](./src/components/features/dashboard/QuickActionCard/QuickActionCard.tsx).
    -   **Guideline:** When building UI for a specific part of the application (e.g., a student list item, a form for generating exams), components should be placed within the relevant feature directory.
-   **Common Components (`src/components/common/`):**
    -   General-purpose utility components that are shared across different features but are not as atomic as `ui/` components. They might have more specific logic but are not tied to a single feature.
    -   Example: `AnimatedElement`, `AnimatedSection`, `FadeInContainer`, `ErrorBoundary`.
    -   **Guideline:** Use this directory for components that don't fit neatly into `ui` or a specific `feature` directory, including structural components, wrappers, and error handling logic.
-   **Styling:**
    -   **Guideline:** Each component **must** have its own CSS Module file (e.g., `MyComponent.module.css`) for scoped styles. This prevents style conflicts and improves maintainability. Import styles as `import styles from './MyComponent.module.css';`.
-   **Reusability:**
    -   **Guideline:** Before creating a new component, check if a similar one already exists in `ui/` or within the relevant `features/` directory that can be reused or extended. Aim to build a robust library of reusable components.

## Server Components vs Client Components

Next.js App Router uses React Server Components by default, which requires careful handling of client-side functionality:

1.  **Server Components:**
    -   Should be used for components that don't need client-side interactivity
    -   Can directly use async/await for data fetching
    -   Cannot use browser APIs, React hooks, or event handlers
    -   The `RootLayout` file (`src/app/layout.tsx`) is kept as a Server Component to allow metadata export
2.  **Client Components:**
    -   Must include the `'use client'` directive at the top of the file
    -   Required for components that use React hooks, event handlers, or browser-only APIs
    -   All components that use Redux hooks (`useSelector`, `useDispatch`) must be Client Components
    -   Client-specific functionality (like Redux providers) should be isolated in dedicated Client Components.
    -   **Guideline:** Strive to keep pages as Server Components by default. If client-side interactivity is needed, extract that logic into a minimal Client Component (e.g., `FadeInContainer`) rather than marking the entire page as `'use client'`.
3.  **Handling Redux in Next.js App Router:**
    -   The Redux store and Provider are wrapped in a dedicated Client Component: [`src/components/ClientProviders.tsx`](./src/components/ClientProviders.tsx).
    -   This component is then used in the Server Component layout (`src/app/layout.tsx`).
    -   This approach prevents errors during static rendering while maintaining proper state management.

## Preventing Hydration Mismatches

Next.js applications can experience "hydration mismatches" when the server-rendered HTML doesn't match what the client renders during hydration. This causes React to tear down and rebuild the DOM, resulting in flickering and potential bugs.

1.  **Common Causes of Hydration Mismatches:**
    -   Dynamic content that differs between server and client (e.g., loading states, timestamps)
    -   Conditional rendering based on browser APIs or environment checks
    -   Redux state that's initialized differently on server vs. client
    -   Random values or Date functions generating different values

2.  **Prevention Pattern:**
    -   Use a "client-side loaded" state pattern for dynamic content:
    ```tsx
    // Example from the Auth component
    const [clientSideLoaded, setClientSideLoaded] = useState(false);
    
    // Set to true after initial client render
    useEffect(() => {
      setClientSideLoaded(true);
    }, []);
    
    // Only show dynamic content after client-side hydration
    return (
      <button disabled={clientSideLoaded && isLoading}>
        {clientSideLoaded && isLoading ? "Processing..." : "Sign In"}
      </button>
    );
    ```
    
3.  **Reusable Hook for Client-Side State:**
    -   Consider using a reusable hook for this pattern:
    ```tsx
    function useClientSideState<T>(serverState: T, clientState: T): T {
      const [isClient, setIsClient] = useState(false);
      
      useEffect(() => {
        setIsClient(true);
      }, []);
      
      return isClient ? clientState : serverState;
    }
    
    // Usage
    const buttonText = useClientSideState(
      "Sign In",                      // Static initial server text
      isLoading ? "Processing..." : "Sign In"  // Dynamic client text
    );
    ```

4.  **Guidelines for Redux with SSR:**
    -   Ensure initial Redux state is consistent between server and client
    -   Be careful with async Redux state in server-rendered components
    -   Consider using `next-redux-wrapper` for better SSR integration
    -   Always delay applying dynamic Redux state until after client-side hydration

5.  **Avoiding Date and Browser API Issues:**
    -   Use static values during initial render for dates and times
    -   Wrap browser API calls in useEffect hooks
    -   Never use `Math.random()` or `Date.now()` directly in rendering code
    -   For locale-sensitive content, use a consistent locale for server and client

By following these patterns, you can prevent hydration errors and ensure a smooth user experience without visual flickering.

## Error Handling & Accessibility

-   **Error Boundaries:** The application is wrapped in a global `ErrorBoundary` in [`src/components/ClientProviders.tsx`](./src/components/ClientProviders.tsx). This component catches runtime errors in the client-side React tree and displays a fallback UI instead of a blank page.
    -   **Guideline:** For more granular error handling, you can wrap specific, complex features in their own `ErrorBoundary` if needed.
-   **Accessibility (a11y):**
    -   **Semantic HTML:** Use appropriate HTML5 tags (`<main>`, `<nav>`, `<header>`, `<footer>`, etc.) instead of generic `<div>`s where possible to improve page structure and screen reader navigation.
    -   **ARIA Labels:** All interactive elements that do not have visible text (e.g., icon-only buttons) **must** have an `aria-label` attribute describing their function. Example: `<button aria-label="Toggle sidebar">...</button>`.

## Key Files Summary (Post Refactor)

-   [`src/lib/api/client.ts`](./src/lib/api/client.ts): Axios instance configuration.
-   [`src/lib/api/auth.ts`](./src/lib/api/auth.ts): Raw API call functions for authentication.
-   [`src/lib/store.ts`](./src/lib/store.ts): Redux store configuration.
-   [`src/lib/features/auth/authSlice.ts`](./src/lib/features/auth/authSlice.ts): Redux slice for authentication state and actions.
-   [`src/app/layout.tsx`](./src/app/layout.tsx): Root layout (Server Component), uses `ClientProviders` to wrap children.
-   [`src/components/ClientProviders.tsx`](./src/components/ClientProviders.tsx): Client Component that wraps the Redux Provider, `AppInitializer`, and the global `ErrorBoundary`.
-   [`src/components/AppInitializer.tsx`](./src/components/AppInitializer.tsx): Client Component that dispatches the initial `fetchUser` action.
-   [`src/components/ui/`](./src/components/ui/): Directory for atomic, reusable UI components (e.g., `Button`, `Card`).
-   [`src/components/features/`](./src/components/features/): Directory for feature-specific components.
-   [`src/components/common/`](./src/components/common/): Directory for shared, non-feature-specific components (e.g., `ErrorBoundary`).

## Development Guidelines (General)

-   **Import Paths:** Strictly use `@/` path aliases for all imports within the `src/` directory.
-   **API Interaction:** Use the `apiClient` from [`src/lib/api/client.ts`](./src/lib/api/client.ts) for all backend communication. Define new API functions within `src/lib/api/` (e.g., `src/lib/api/content.ts` for content-related endpoints).
-   **State Management:**
    -   Use Redux Toolkit for global and feature-specific state.
    -   Create new slices in `src/lib/features/` for new state domains.
    -   Follow established patterns for actions, reducers, thunks, and selectors.
    -   Use `useSelector` and `useDispatch` in components to interact with the store.
-   **Component Creation:** Follow the `ui/`, `features/`, and `common/` structure outlined above. Always use CSS Modules for styling, with each component in its own folder with an `index.ts`.
-   **Environment:** Ensure `NEXT_PUBLIC_API_URL` is configured in `.env.local` (and other environment files as needed) pointing to the correct backend URL. Remember to add `.env*.local` to `.gitignore`.
-   **Error Handling:** Implement user-friendly error handling for API request failures. Thunks should `rejectWithValue` with error messages, which can then be selected and displayed in components.
-   **Dependencies:** Add new frontend dependencies using `npm install` or `yarn add`. Keep dependencies up-to-date where feasible.

Adhering to these patterns will help maintain consistency and ensure that authentication, backend communication, state management, and component architecture work reliably as new features are added.