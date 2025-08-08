"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import styles from "./auth.module.css";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/lib/store";
import {
  requestOTP,
  signupUser,
  clearAuthError,
  clearOTPState,
  selectUser,
  selectIsAuthLoading,
  selectAuthError,
  selectOTPStep,
} from "@/lib/features/auth/authSlice";
import OTPVerification from "@/components/features/auth/OTPVerification";

// Component that uses useSearchParamss
function AuthContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  const [isLogin, setIsLogin] = useState(mode !== "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);

  // Initialize loading state to false for client-side rendering to prevent hydration mismatch
  const isLoading = useSelector(selectIsAuthLoading);

  const authError = useSelector(selectAuthError);
  const otpStep = useSelector(selectOTPStep);
  const [localError, setLocalError] = useState<string | null>(null); // For UI feedback, separate from Redux error for more control

  // Mark component as client-side loaded after initial render

  // Set initial mode based on URL parameter
  useEffect(() => {
    if (mode === "signup") {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
    // Clear OTP state when mode changes
    dispatch(clearOTPState());
  }, [mode, dispatch]);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Toggle between login and signup
  const toggleMode = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setLocalError(null); // Clear error on mode toggle
      dispatch(clearAuthError()); // Clear Redux error state as well
      dispatch(clearOTPState()); // Clear OTP state on mode toggle
      setIsAnimating(false);
    }, 300);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    dispatch(clearAuthError());

    let resultAction;
    if (isLogin) {
      resultAction = await dispatch(requestOTP({ email, password }));
    } else {
      resultAction = await dispatch(
        signupUser({ email, password, full_name: name }),
      );
    }

    if (
      requestOTP.rejected.match(resultAction) ||
      signupUser.rejected.match(resultAction)
    ) {
      setLocalError(
        (resultAction.payload as string) || "An unexpected error occurred.",
      );
    }
    // Successful OTP request will change otpStep to 'sent' for both login and signup flows
  };

  // Handle going back from OTP verification
  const handleBackFromOTP = () => {
    dispatch(clearOTPState());
    setEmail("");
    setPassword("");
    setLocalError(null);
  };

  // Show OTP verification if we're in the OTP step
  if (otpStep === "sent" || otpStep === "verifying") {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authBackground}>
          <div className={styles.glowEffect}></div>
        </div>

        <div className={styles.headerNav}>
          <Link href="/" className={styles.logo}>
            Teacherly
          </Link>
        </div>
        <Link href="/dashboard" className={styles.dashboardButton}>
          Go to Dashboard
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
        </Link>

        <div className={styles.formContainer}>
          <OTPVerification onBack={handleBackFromOTP} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBackground}>
        <div className={styles.glowEffect}></div>
      </div>

      <div className={styles.headerNav}>
        <Link href="/" className={styles.logo}>
          Teacherly
        </Link>
      </div>
      <Link href="/dashboard" className={styles.dashboardButton}>
        Go to Dashboard
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
      </Link>

      <div className={styles.formContainer}>
        <div
          className={`${styles.formCard} ${isAnimating ? styles.animating : ""}`}
        >
          <h1 className={styles.title}>
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className={styles.subtitle}>
            {isLogin
              ? "Enter your credentials to access your account"
              : "Fill in the form to create your account"}
          </p>

          {(authError || localError) && (
            <p className={styles.errorMessage}>{localError || authError}</p>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            {!isLogin && (
              <div className={styles.inputGroup}>
                <label htmlFor="name">Full Name</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </span>
                  <input
                    type="text"
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="email">Email Address</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
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
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.labelRow}>
                <label htmlFor="password">Password</label>
                {isLogin && (
                  <Link
                    href="/auth/forgot-password"
                    className={styles.forgotPassword}
                  >
                    Forgot Password?
                  </Link>
                )}
              </div>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="3"
                      y="11"
                      width="18"
                      height="11"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading
                ? "Processing..."
                : isLogin
                  ? "Sign In"
                  : "Create Account"}
              <span className={styles.buttonIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </span>
            </button>
          </form>

          <div className={styles.divider}>
            <span>OR</span>
          </div>

          <div className={styles.socialLogin}>
            <button className={styles.socialButton}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
              <span>Continue with Facebook</span>
            </button>
            <button className={styles.socialButton}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
              <span>Continue with GitHub</span>
            </button>
          </div>

          <div className={styles.toggleMode}>
            <p>
              {isLogin
                ? "Don&apos;t have an account?"
                : "Already have an account?"}
              <button
                type="button"
                onClick={toggleMode}
                className={styles.toggleButton}
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Auth component with Suspense boundary
export default function Auth() {
  return (
    <Suspense
      fallback={
        <div className={styles.authContainer}>
          <div className={styles.formContainer}>Loading...</div>
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
