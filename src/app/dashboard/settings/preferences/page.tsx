'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { AppDispatch } from '@/lib/store';
import {
  selectUserPreferences,
  selectSettingsLoading,
  selectSettingsError,
  selectSettingsSuccess,
  clearSettingsError,
  clearSuccessMessage,
  fetchUserPreferencesThunk
} from '@/lib/features/settings/settingsSlice';
import PreferencesForm from '@/components/features/settings/PreferencesForm';
import Card from '@/components/ui/Card/Card';
import { getThemeDisplayName, getLanguageDisplayName } from '@/lib/api/settings';
import styles from './preferences.module.css';

export default function PreferencesSettingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const preferences = useSelector(selectUserPreferences);
  const isLoading = useSelector(selectSettingsLoading);
  const error = useSelector(selectSettingsError);
  const successMessage = useSelector(selectSettingsSuccess);

  useEffect(() => {
    // Clear any existing messages when component mounts
    dispatch(clearSettingsError());
    dispatch(clearSuccessMessage());
    // Fetch preferences
    dispatch(fetchUserPreferencesThunk());
  }, [dispatch]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/dashboard/settings" className={styles.backLink}>
          ← Back to Settings
        </Link>
        <h1>Preferences</h1>
        <p>Customize your app experience with personalized settings</p>
      </div>

      <div className={styles.content}>
        <div className={styles.leftColumn}>
          <Card className={styles.currentPrefsCard}>
            <h3>Current Preferences</h3>
            {isLoading ? (
              <div className={styles.loadingState}>Loading preferences...</div>
            ) : preferences ? (
              <div className={styles.currentPrefs}>
                <div className={styles.prefGroup}>
                  <h4>Appearance</h4>
                  <div className={styles.prefItem}>
                    <span className={styles.prefLabel}>Theme:</span>
                    <span className={styles.prefValue}>{getThemeDisplayName(preferences.theme)}</span>
                  </div>
                </div>

                <div className={styles.prefGroup}>
                  <h4>Language & Region</h4>
                  <div className={styles.prefItem}>
                    <span className={styles.prefLabel}>Language:</span>
                    <span className={styles.prefValue}>{getLanguageDisplayName(preferences.language)}</span>
                  </div>
                  <div className={styles.prefItem}>
                    <span className={styles.prefLabel}>Timezone:</span>
                    <span className={styles.prefValue}>{preferences.timezone}</span>
                  </div>
                  <div className={styles.prefItem}>
                    <span className={styles.prefLabel}>Date Format:</span>
                    <span className={styles.prefValue}>{preferences.date_format}</span>
                  </div>
                  <div className={styles.prefItem}>
                    <span className={styles.prefLabel}>Time Format:</span>
                    <span className={styles.prefValue}>{preferences.time_format}</span>
                  </div>
                </div>

                <div className={styles.prefGroup}>
                  <h4>Notifications</h4>
                  <div className={styles.prefItem}>
                    <span className={styles.prefLabel}>Email Notifications:</span>
                    <span className={`${styles.prefValue} ${preferences.email_notifications ? styles.enabled : styles.disabled}`}>
                      {preferences.email_notifications ? 'On' : 'Off'}
                    </span>
                  </div>
                  <div className={styles.prefItem}>
                    <span className={styles.prefLabel}>Grade Notifications:</span>
                    <span className={`${styles.prefValue} ${preferences.grade_notifications ? styles.enabled : styles.disabled}`}>
                      {preferences.grade_notifications ? 'On' : 'Off'}
                    </span>
                  </div>
                  <div className={styles.prefItem}>
                    <span className={styles.prefLabel}>Report Notifications:</span>
                    <span className={`${styles.prefValue} ${preferences.report_notifications ? styles.enabled : styles.disabled}`}>
                      {preferences.report_notifications ? 'On' : 'Off'}
                    </span>
                  </div>
                  <div className={styles.prefItem}>
                    <span className={styles.prefLabel}>System Notifications:</span>
                    <span className={`${styles.prefValue} ${preferences.system_notifications ? styles.enabled : styles.disabled}`}>
                      {preferences.system_notifications ? 'On' : 'Off'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.noPreferences}>No preferences found</div>
            )}
          </Card>

          <Card className={styles.preferenceTipsCard}>
            <h3>Customization Tips</h3>
            <ul className={styles.tipsList}>
              <li>Choose a theme that is comfortable for your eyes during long sessions</li>
              <li>Set your preferred language for the best experience</li>
              <li>Configure your timezone for accurate scheduling</li>
              <li>Enable notifications for important updates</li>
              <li>Customize date and time formats to match your preferences</li>
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

          <PreferencesForm />
        </div>
      </div>
    </div>
  );
}