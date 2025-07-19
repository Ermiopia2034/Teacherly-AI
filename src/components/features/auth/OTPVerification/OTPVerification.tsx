"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/lib/store";
import { 
  verifyOTPAndLogin, 
  clearAuthError, 
  selectIsAuthLoading, 
  selectAuthError, 
  selectPendingEmail 
} from "@/lib/features/auth/authSlice";
import styles from "../../../../app/auth/auth.module.css";

interface OTPVerificationProps {
  onBack: () => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({ onBack }) => {
  const [otpCode, setOtpCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(true);
  
  const dispatch = useDispatch<AppDispatch>();
  const isLoading = useSelector(selectIsAuthLoading);
  const authError = useSelector(selectAuthError);
  const pendingEmail = useSelector(selectPendingEmail);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for OTP expiry
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Enable resend after initial load
  useEffect(() => {
    const timer = setTimeout(() => setCanResend(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Format time display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle OTP input change
  const handleOTPChange = (value: string, index: number) => {
    if (value.length > 1) return; // Only allow single character
    if (value && !/^\d$/.test(value)) return; // Only allow digits
    
    const newOTP = otpCode.split('');
    newOTP[index] = value;
    const updatedOTP = newOTP.join('');
    setOtpCode(updatedOTP);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste event
  const handlePaste = (e: React.ClipboardEvent, index: number) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, ''); // Extract only digits
    
    if (pastedData.length === 6) {
      // If exactly 6 digits, fill all fields
      setOtpCode(pastedData);
      // Focus on the last field
      setTimeout(() => {
        inputRefs.current[5]?.focus();
      }, 0);
    } else if (pastedData.length > 0) {
      // If fewer digits, fill from current position
      const newOTP = otpCode.split('');
      const remainingSlots = 6 - index;
      const digitsToFill = pastedData.slice(0, remainingSlots);
      
      for (let i = 0; i < digitsToFill.length; i++) {
        newOTP[index + i] = digitsToFill[i];
      }
      
      setOtpCode(newOTP.join(''));
      
      // Focus on the next empty field or last filled field
      const nextFocusIndex = Math.min(index + digitsToFill.length, 5);
      setTimeout(() => {
        inputRefs.current[nextFocusIndex]?.focus();
      }, 0);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingEmail || otpCode.length !== 6) return;

    dispatch(clearAuthError());
    await dispatch(verifyOTPAndLogin({ email: pendingEmail, otp_code: otpCode }));
  };

  // Handle resend OTP
  const handleResendOTP = () => {
    if (!canResend) return;

    // For security reasons, we don't store the password
    // So we'll take the user back to re-enter credentials
    alert("To resend the code, please go back and re-enter your credentials.");
    onBack();
  };

  if (!pendingEmail) {
    onBack();
    return null;
  }

  return (
    <div className={styles.formCard}>
      <div className={styles.stepIndicator}>
        <div className={styles.step}>
          <div className={`${styles.stepNumber} ${styles.completed}`}>1</div>
          <span>Credentials</span>
        </div>
        <div className={styles.stepLine}></div>
        <div className={styles.step}>
          <div className={`${styles.stepNumber} ${styles.active}`}>2</div>
          <span>Verification</span>
        </div>
      </div>

      <h1 className={styles.title}>Enter Verification Code</h1>
      <p className={styles.subtitle}>
        We&apos;ve sent a 6-digit code to <strong>{pendingEmail}</strong>
      </p>

      {authError && <p className={styles.errorMessage}>{authError}</p>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label>Verification Code</label>
          <div className={styles.otpInputContainer}>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                className={styles.otpInput}
                value={otpCode[index] || ''}
                onChange={(e) => handleOTPChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={(e) => handlePaste(e, index)}
                maxLength={1}
                pattern="[0-9]"
                inputMode="numeric"
                autoComplete="one-time-code"
                disabled={isLoading}
              />
            ))}
          </div>
        </div>

        <div className={styles.otpInfo}>
          <p className={styles.timerText}>
            Code expires in: <strong>{formatTime(timeLeft)}</strong>
          </p>
          {timeLeft <= 0 && (
            <p className={styles.expiredText}>Code has expired. Please request a new one.</p>
          )}
        </div>

        <button 
          type="submit" 
          className={styles.submitButton} 
          disabled={isLoading || otpCode.length !== 6 || timeLeft <= 0}
        >
          {isLoading ? "Verifying..." : "Verify & Sign In"}
          <span className={styles.buttonIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </span>
        </button>
      </form>

      <div className={styles.otpActions}>
        <button
          type="button"
          onClick={handleResendOTP}
          className={styles.resendButton}
          disabled={!canResend}
        >
          Resend Code
        </button>
        
        <button 
          type="button" 
          onClick={onBack}
          className={styles.backButton}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default OTPVerification;