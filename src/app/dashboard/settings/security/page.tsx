'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { AppDispatch } from '@/lib/store';
import {
  selectUserPreferences,
  selectSettingsError,
  selectSettingsSuccess,
  clearSettingsError,
  clearSuccessMessage,
  fetchUserPreferencesThunk
} from '@/lib/features/settings/settingsSlice';
import PasswordChangeForm from '@/components/features/settings/PasswordChangeForm';
import SecuritySettings from '@/components/features/settings/SecuritySettings';
import Card from '@/components/ui/Card/Card';
import styles from './security.module.css';

export default function SecuritySettingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const preferences = useSelector(selectUserPreferences);
  const error = useSelector(selectSettingsError);
  const successMessage = useSelector(selectSettingsSuccess);

  useEffect(() => {
    // Clear any existing messages when component mounts
    dispatch(clearSettingsError());
    dispatch(clearSuccessMessage());
    // Fetch preferences to get 2FA status
    dispatch(fetchUserPreferencesThunk());
  }, [dispatch]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/dashboard/settings" className={styles.backLink}>
          ← Back to Settings
        </Link>
        <h1>Security Settings</h1>
        <p>Manage your password and account security features</p>
      </div>

      <div className={styles.content}>
        <div className={styles.leftColumn}>
          <Card className={styles.securityOverviewCard}>
            <h3>Security Overview</h3>
            <div className={styles.securityStatus}>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Password:</span>
                <span className={styles.statusValue}>
                  <span className={styles.statusIndicator}>🔒</span>
                  Protected
                </span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Two-Factor Authentication:</span>
                <span className={`${styles.statusValue} ${preferences?.two_factor_enabled ? styles.enabled : styles.disabled}`}>
                  <span className={styles.statusIndicator}>
                    {preferences?.two_factor_enabled ? '🛡️' : '⚠️'}
                  </span>
                  {preferences?.two_factor_enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Account Status:</span>
                <span className={`${styles.statusValue} ${styles.enabled}`}>
                  <span className={styles.statusIndicator}>✅</span>
                  Active
                </span>
              </div>
            </div>
          </Card>

          <Card className={styles.securityTipsCard}>
            <h3>Security Best Practices</h3>
            <ul className={styles.tipsList}>
              <li>Use a strong password with at least 8 characters</li>
              <li>Include uppercase, lowercase, numbers, and special characters</li>
              <li>Enable two-factor authentication for extra security</li>
              <li>Change your password regularly</li>
              <li>Never share your login credentials</li>
              <li>Log out when using shared devices</li>
            </ul>
          </Card>
        </div>

        <div className={styles.rightColumn}>
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

          <div className={styles.settingsSections}>
            <PasswordChangeForm />
            <SecuritySettings />
          </div>
        </div>
      </div>
    </div>
  );
}