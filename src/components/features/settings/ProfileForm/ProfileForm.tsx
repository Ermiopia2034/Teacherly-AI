'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import { selectUser, updateUserProfile } from '@/lib/features/auth/authSlice';
import { 
  updateProfileThunk,
  selectSettingsUpdating,
  selectSettingsError,
  selectSettingsSuccess 
} from '@/lib/features/settings/settingsSlice';
import Button from '@/components/ui/Button/Button';
import LabeledInput from '@/components/ui/LabeledInput/LabeledInput';
import Card from '@/components/ui/Card/Card';
import styles from './ProfileForm.module.css';
import { useToast } from '@/providers/ToastProvider';

export function ProfileForm() {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const user = useSelector(selectUser);
  const isUpdating = useSelector(selectSettingsUpdating);
  const error = useSelector(selectSettingsError);
  const successMessage = useSelector(selectSettingsSuccess);

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  useEffect(() => {
    // Check if form has changes
    const originalData = {
      full_name: user?.full_name || '',
      email: user?.email || ''
    };
    
    const hasFormChanges = 
      formData.full_name !== originalData.full_name ||
      formData.email !== originalData.email;
    
    setHasChanges(hasFormChanges);
  }, [formData, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Validate full name (optional but if provided, should not be empty)
    if (formData.full_name && formData.full_name.trim().length < 2) {
      errors.full_name = 'Full name must be at least 2 characters long';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast({ variant: 'error', title: 'Validation error', description: 'Please correct the highlighted fields.' });
      return;
    }

    if (!hasChanges) {
      showToast({ variant: 'info', title: 'No changes', description: 'There are no changes to save.' });
      return;
    }

    try {
      // Prepare update data (only include changed fields)
      const updateData: { full_name?: string; email?: string } = {};
      
      if (formData.full_name !== (user?.full_name || '')) {
        updateData.full_name = formData.full_name || undefined;
      }
      
      if (formData.email !== (user?.email || '')) {
        updateData.email = formData.email;
      }

      const result = await dispatch(updateProfileThunk(updateData)).unwrap();
      
      // Update auth state with new user data
      dispatch(updateUserProfile({
        email: result.email,
        full_name: result.full_name
      }));
      
      setValidationErrors({});
      showToast({ variant: 'success', title: 'Profile updated', description: 'Your profile has been updated successfully.' });
    } catch (error) {
      console.error('Failed to update profile:', error);
      showToast({ variant: 'error', title: 'Update failed', description: String(error) });
    }
  };

  const handleReset = () => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || ''
      });
    }
    setValidationErrors({});
  };

  return (
    <Card className={styles.formCard}>
      <div className={styles.formHeader}>
        <h3>Update Profile Information</h3>
        <p>Change your name and email address</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <LabeledInput
          label="Full Name"
          id="full_name"
          name="full_name"
          type="text"
          value={formData.full_name}
          onChange={handleInputChange}
          placeholder="Enter your full name"
        />
        {validationErrors.full_name && (
          <div className={styles.fieldError}>{validationErrors.full_name}</div>
        )}

        <LabeledInput
          label="Email Address"
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your email address"
          required
        />
        {validationErrors.email && (
          <div className={styles.fieldError}>{validationErrors.email}</div>
        )}

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        {successMessage && (
          <div className={styles.successMessage}>
            {successMessage}
          </div>
        )}

        <div className={styles.formNote}>
          <p><strong>Note:</strong> Changing your email address may require verification and could affect your login credentials.</p>
        </div>

        <div className={styles.buttonGroup}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
            disabled={isUpdating || !hasChanges}
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={isUpdating || !hasChanges}
          >
            {isUpdating ? 'Updating...' : 'Update Profile'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default ProfileForm;