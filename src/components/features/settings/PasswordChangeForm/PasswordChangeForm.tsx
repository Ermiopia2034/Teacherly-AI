'use client';

import { useState, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import { 
  changePasswordThunk,
  selectSettingsUpdating 
} from '@/lib/features/settings/settingsSlice';
import Button from '@/components/ui/Button/Button';
import LabeledInput from '@/components/ui/LabeledInput/LabeledInput';
import Card from '@/components/ui/Card/Card';
import styles from './PasswordChangeForm.module.css';

export function PasswordChangeForm() {
  const dispatch = useDispatch<AppDispatch>();
  const isUpdating = useSelector(selectSettingsUpdating);

  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate current password
    if (!formData.current_password) {
      errors.current_password = 'Current password is required';
    }

    // Validate new password
    if (!formData.new_password) {
      errors.new_password = 'New password is required';
    } else {
      if (formData.new_password.length < 8) {
        errors.new_password = 'Password must be at least 8 characters long';
      } else if (!/(?=.*[a-z])/.test(formData.new_password)) {
        errors.new_password = 'Password must contain at least one lowercase letter';
      } else if (!/(?=.*[A-Z])/.test(formData.new_password)) {
        errors.new_password = 'Password must contain at least one uppercase letter';
      } else if (!/(?=.*\d)/.test(formData.new_password)) {
        errors.new_password = 'Password must contain at least one number';
      } else if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(formData.new_password)) {
        errors.new_password = 'Password must contain at least one special character';
      }
    }

    // Validate confirm password
    if (!formData.confirm_password) {
      errors.confirm_password = 'Please confirm your new password';
    } else if (formData.new_password !== formData.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }

    // Check if new password is different from current
    if (formData.current_password && formData.new_password && 
        formData.current_password === formData.new_password) {
      errors.new_password = 'New password must be different from current password';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(changePasswordThunk(formData)).unwrap();
      
      // Reset form on success
      setFormData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setValidationErrors({});
      setShowPasswords({
        current: false,
        new: false,
        confirm: false
      });
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  const handleReset = () => {
    setFormData({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
    setValidationErrors({});
    setShowPasswords({
      current: false,
      new: false,
      confirm: false
    });
  };

  return (
    <Card className={styles.formCard}>
      <div className={styles.formHeader}>
        <h3>Change Password</h3>
        <p>Update your password to keep your account secure</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.passwordField}>
          <LabeledInput
            label="Current Password"
            id="current_password"
            name="current_password"
            type={showPasswords.current ? "text" : "password"}
            value={formData.current_password}
            onChange={handleInputChange}
            placeholder="Enter your current password"
            required
          />
          <button
            type="button"
            className={styles.togglePassword}
            onClick={() => togglePasswordVisibility('current')}
          >
            {showPasswords.current ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {validationErrors.current_password && (
          <div className={styles.fieldError}>{validationErrors.current_password}</div>
        )}

        <div className={styles.passwordField}>
          <LabeledInput
            label="New Password"
            id="new_password"
            name="new_password"
            type={showPasswords.new ? "text" : "password"}
            value={formData.new_password}
            onChange={handleInputChange}
            placeholder="Enter your new password"
            required
          />
          <button
            type="button"
            className={styles.togglePassword}
            onClick={() => togglePasswordVisibility('new')}
          >
            {showPasswords.new ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {validationErrors.new_password && (
          <div className={styles.fieldError}>{validationErrors.new_password}</div>
        )}

        <div className={styles.passwordField}>
          <LabeledInput
            label="Confirm New Password"
            id="confirm_password"
            name="confirm_password"
            type={showPasswords.confirm ? "text" : "password"}
            value={formData.confirm_password}
            onChange={handleInputChange}
            placeholder="Confirm your new password"
            required
          />
          <button
            type="button"
            className={styles.togglePassword}
            onClick={() => togglePasswordVisibility('confirm')}
          >
            {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {validationErrors.confirm_password && (
          <div className={styles.fieldError}>{validationErrors.confirm_password}</div>
        )}

        <div className={styles.passwordRequirements}>
          <h4>Password Requirements:</h4>
          <ul>
            <li className={formData.new_password.length >= 8 ? styles.valid : ''}>
              At least 8 characters long
            </li>
            <li className={/(?=.*[a-z])/.test(formData.new_password) ? styles.valid : ''}>
              Contains lowercase letter
            </li>
            <li className={/(?=.*[A-Z])/.test(formData.new_password) ? styles.valid : ''}>
              Contains uppercase letter
            </li>
            <li className={/(?=.*\d)/.test(formData.new_password) ? styles.valid : ''}>
              Contains number
            </li>
            <li className={/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(formData.new_password) ? styles.valid : ''}>
              Contains special character
            </li>
          </ul>
        </div>

        <div className={styles.buttonGroup}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
            disabled={isUpdating}
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={isUpdating}
          >
            {isUpdating ? 'Changing...' : 'Change Password'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default PasswordChangeForm;