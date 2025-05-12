"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../../auth.module.css"; // Re-use auth styles
import { resetPassword } from "../../../../lib/auth"; // Import the API function

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string | undefined; // Get token from URL

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Redirect if token is missing (though Next.js routing should handle this)
  useEffect(() => {
    if (!token) {
      console.error("Reset token is missing from URL.");
      setError("Invalid or missing reset token.");
      // Optional: Redirect immediately or show error message
      // router.push('/auth');
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!token) {
      setError("Reset token is missing. Cannot proceed.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword({ token, new_password: password });
      setSuccessMessage(result.message || "Password successfully reset! Redirecting to login...");
      // Clear form and disable further submissions on success
      setPassword("");
      setConfirmPassword("");
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push("/auth");
      }, 3000); // 3 second delay
    } catch (err: unknown) {
      console.error("Password reset failed:", err);
      let message = "An error occurred while resetting your password. The link may be invalid or expired.";
      if (err instanceof Error) {
         // Attempt to access nested properties common in API error responses
        // Use type assertion carefully or add more specific checks if needed
        const axiosError = err as any; // Use 'as any' cautiously or define a type/interface
        message = axiosError.response?.data?.detail || err.message || message;
      } else if (typeof err === 'string') {
         message = err;
      }
      setError(message);
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
          <h1 className={styles.title}>Set New Password</h1>

          {!successMessage ? (
            <form onSubmit={handleSubmit} className={styles.form}>
              <p className={styles.subtitle}>
                Enter your new password below.
              </p>

              <div className={styles.inputGroup}>
                <label htmlFor="password">New Password</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>{/* Lock Icon */}</span>
                  <input
                    type="password"
                    id="password"
                    placeholder="Enter new password (min 8 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={isLoading}
                    aria-invalid={error ? "true" : "false"}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>{/* Lock Icon */}</span>
                  <input
                    type="password"
                    id="confirmPassword"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={isLoading}
                    aria-invalid={error ? "true" : "false"}
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

              <button type="submit" className={styles.submitButton} disabled={isLoading || !token}>
                {isLoading ? "Resetting..." : "Reset Password"}
                {!isLoading && (
                   <span className={styles.buttonIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                      </svg>
                   </span>
                  )}
              </button>
            </form>
          ) : (
            <div className={styles.successMessage} role="status"> {/* Using generic successMessage style if available */}
               <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              <h2>Password Reset Successful!</h2>
              <p>{successMessage}</p>
            </div>
          )}

          <div className={styles.toggleMode}>
            <p>
              Remembered your password?{" "}
              <Link href="/auth" className={styles.link}>
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}