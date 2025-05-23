"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../auth.module.css";
import forgotStyles from "./forgot-password.module.css";
import { requestPasswordReset } from "../../../lib/api/auth"; // Import the API function

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); // Clear previous errors

    try {
      // The origin parameter will be automatically added by the requestPasswordReset function
      await requestPasswordReset({ email });
      // On success, show the confirmation message
      setIsSubmitted(true);
    } catch (err: unknown) {
      console.error("Password reset request failed:", err);
      let message = "An unexpected error occurred. Please try again."; // Default message

      // Type-safe check for nested error details (e.g., from Axios)
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const response = (err as { response?: unknown }).response;
        if (typeof response === 'object' && response !== null && 'data' in response) {
          const data = (response as { data?: unknown }).data;
          if (typeof data === 'object' && data !== null && 'detail' in data && typeof data.detail === 'string') {
            message = data.detail; // Use the specific detail message
          } else if (err instanceof Error) {
            message = err.message; // Fallback to standard error message
          }
        } else if (err instanceof Error) {
          message = err.message; // Fallback if response exists but no data
        }
      } else if (err instanceof Error) {
        message = err.message; // Handle standard Error objects
      } else if (typeof err === 'string') {
        message = err; // Handle simple string errors
      }

      setError(message);
      setIsSubmitted(false); // Stay on the form if there's an error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBackground}>
        <div className={styles.glowEffect}></div>
      </div>

      <Link href="/" className={styles.logo}>
        Teacherly
      </Link>

      <div className={styles.formContainer}>
        <div className={styles.formCard}>
          {!isSubmitted ? (
            <>
              <h1 className={styles.title}>Reset Password</h1>
              <p className={styles.subtitle}>
                Enter your email address and we&apos;ll send you a link to reset your password
              </p>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label htmlFor="email">Email Address</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </span>
                    <input
                      type="email"
                      id="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading} // Disable input while loading
                      aria-invalid={error ? "true" : "false"} // Indicate error state for accessibility
                    />
                  </div>
                </div>

                {/* Error Message Display */}
                {error && (
                  <div className={styles.errorMessage} role="alert">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.errorIcon}>
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {error}
                  </div>
                )}

                <button type="submit" className={styles.submitButton} disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Link"}
                  {!isLoading && ( // Only show icon when not loading
                    <span className={styles.buttonIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </span>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className={forgotStyles.successMessage}>
              <div className={forgotStyles.successIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h2>Check Your Email</h2>
              <p>We&apos;ve sent a password reset link to <strong>{email}</strong></p>
              <p className={forgotStyles.note}>
                If you don&apos;t see the email, check your spam folder or make sure you entered the correct email address.
              </p>
            </div>
          )}

          <div className={styles.toggleMode}>
            <p>
              <Link href="/auth" className={forgotStyles.backLink}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
