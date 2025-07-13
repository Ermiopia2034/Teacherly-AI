'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { AppDispatch } from '@/lib/store';
import { selectUser } from '@/lib/features/auth/authSlice';
import {
  selectSettingsError,
  selectSettingsSuccess,
  clearSettingsError,
  clearSuccessMessage
} from '@/lib/features/settings/settingsSlice';
import ProfileForm from '@/components/features/settings/ProfileForm';
import Card from '@/components/ui/Card/Card';
import styles from './profile.module.css';

export default function ProfileSettingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);
  const error = useSelector(selectSettingsError);
  const successMessage = useSelector(selectSettingsSuccess);

  useEffect(() => {
    // Clear any existing messages when component mounts
    dispatch(clearSettingsError());
    dispatch(clearSuccessMessage());
  }, [dispatch]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/dashboard/settings" className={styles.backLink}>
          ← Back to Settings
        </Link>
        <h1>Profile Settings</h1>
        <p>Update your personal information and profile details</p>
      </div>

      <div className={styles.content}>
        <div className={styles.leftColumn}>
          <Card className={styles.currentInfoCard}>
            <h3>Current Information</h3>
            {user && (
              <div className={styles.currentInfo}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Email:</span>
                  <span className={styles.infoValue}>{user.email}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Full Name:</span>
                  <span className={styles.infoValue}>{user.full_name || 'Not set'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Role:</span>
                  <span className={styles.infoValue}>{user.role}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Account Status:</span>
                  <span className={`${styles.infoValue} ${user.is_active ? styles.active : styles.inactive}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Member Since:</span>
                  <span className={styles.infoValue}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </Card>

          <Card className={styles.tipsCard}>
            <h3>Profile Tips</h3>
            <ul className={styles.tipsList}>
              <li>Use your real name to help students and colleagues identify you</li>
              <li>Keep your email up to date for important notifications</li>
              <li>Changes to your email may require verification</li>
              <li>Your profile information is visible to your students</li>
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

          <ProfileForm />
        </div>
      </div>
    </div>
  );
}