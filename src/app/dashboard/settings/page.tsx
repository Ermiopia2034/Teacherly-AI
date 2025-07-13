'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { AppDispatch } from '@/lib/store';
import { fetchUserPreferencesThunk, selectUserPreferences, selectSettingsLoading } from '@/lib/features/settings/settingsSlice';
import { selectUser } from '@/lib/features/auth/authSlice';
import Card from '@/components/ui/Card/Card';
import styles from './settings.module.css';

const settingSections = [
  {
    id: 'profile',
    title: 'Profile Settings',
    description: 'Update your personal information, email, and profile details',
    icon: '👤',
    href: '/dashboard/settings/profile',
  },
  {
    id: 'security',
    title: 'Security Settings',
    description: 'Manage your password, two-factor authentication, and account security',
    icon: '🔒',
    href: '/dashboard/settings/security',
  },
  {
    id: 'preferences',
    title: 'Preferences',
    description: 'Customize your app experience with theme, language, and notification settings',
    icon: '⚙️',
    href: '/dashboard/settings/preferences',
  },
];

export default function SettingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);
  const preferences = useSelector(selectUserPreferences);
  const isLoading = useSelector(selectSettingsLoading);

  useEffect(() => {
    // Fetch user preferences when the page loads
    dispatch(fetchUserPreferencesThunk());
  }, [dispatch]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Settings</h1>
        <p>Manage your account settings and preferences</p>
        {user && (
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.full_name || user.email}</span>
            <span className={styles.userRole}>{user.role}</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className={styles.loading}>Loading your settings...</div>
      ) : (
        <div className={styles.settingsGrid}>
          {settingSections.map((section) => (
            <Link key={section.id} href={section.href} className={styles.settingLink}>
              <Card className={styles.settingCard}>
                <div className={styles.settingIcon}>{section.icon}</div>
                <div className={styles.settingContent}>
                  <h3 className={styles.settingTitle}>{section.title}</h3>
                  <p className={styles.settingDescription}>{section.description}</p>
                </div>
                <div className={styles.settingArrow}>→</div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {preferences && (
        <div className={styles.quickInfo}>
          <h2>Quick Overview</h2>
          <div className={styles.quickInfoGrid}>
            <div className={styles.quickInfoItem}>
              <span className={styles.quickInfoLabel}>Theme:</span>
              <span className={styles.quickInfoValue}>{preferences.theme.toLowerCase()}</span>
            </div>
            <div className={styles.quickInfoItem}>
              <span className={styles.quickInfoLabel}>Language:</span>
              <span className={styles.quickInfoValue}>{preferences.language.toLowerCase()}</span>
            </div>
            <div className={styles.quickInfoItem}>
              <span className={styles.quickInfoLabel}>2FA:</span>
              <span className={`${styles.quickInfoValue} ${preferences.two_factor_enabled ? styles.enabled : styles.disabled}`}>
                {preferences.two_factor_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className={styles.quickInfoItem}>
              <span className={styles.quickInfoLabel}>Notifications:</span>
              <span className={styles.quickInfoValue}>
                {preferences.email_notifications ? 'On' : 'Off'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}