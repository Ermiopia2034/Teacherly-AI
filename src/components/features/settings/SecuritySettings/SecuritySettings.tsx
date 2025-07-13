'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import { 
  selectUserPreferences,
  selectSettingsUpdating,
  setupTwoFactorThunk 
} from '@/lib/features/settings/settingsSlice';
import Button from '@/components/ui/Button/Button';
import Card from '@/components/ui/Card/Card';
import styles from './SecuritySettings.module.css';

export function SecuritySettings() {
  const dispatch = useDispatch<AppDispatch>();
  const preferences = useSelector(selectUserPreferences);
  const isUpdating = useSelector(selectSettingsUpdating);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<'enable' | 'disable' | null>(null);

  const handle2FAToggle = (enable: boolean) => {
    setPendingAction(enable ? 'enable' : 'disable');
    setShowConfirmDialog(true);
  };

  const confirmAction = async () => {
    if (!pendingAction) return;

    try {
      await dispatch(setupTwoFactorThunk({ 
        enable: pendingAction === 'enable' 
      })).unwrap();
      
      setShowConfirmDialog(false);
      setPendingAction(null);
    } catch (error) {
      console.error('Failed to setup 2FA:', error);
    }
  };

  const cancelAction = () => {
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  return (
    <Card className={styles.securityCard}>
      <div className={styles.cardHeader}>
        <h3>Additional Security</h3>
        <p>Enhance your account security with additional features</p>
      </div>

      <div className={styles.securityOptions}>
        <div className={styles.securityOption}>
          <div className={styles.optionInfo}>
            <h4>Two-Factor Authentication (2FA)</h4>
            <p>
              Add an extra layer of security to your account by requiring a verification code 
              from your phone in addition to your password.
            </p>
            <div className={styles.currentStatus}>
              <span className={`${styles.statusBadge} ${preferences?.two_factor_enabled ? styles.enabled : styles.disabled}`}>
                {preferences?.two_factor_enabled ? '🛡️ Enabled' : '⚠️ Disabled'}
              </span>
            </div>
          </div>
          
          <div className={styles.optionControls}>
            <Button
              variant={preferences?.two_factor_enabled ? "secondary" : "primary"}
              onClick={() => handle2FAToggle(!preferences?.two_factor_enabled)}
              disabled={isUpdating}
            >
              {preferences?.two_factor_enabled ? 'Disable 2FA' : 'Enable 2FA'}
            </Button>
          </div>
        </div>

        <div className={styles.securityOption}>
          <div className={styles.optionInfo}>
            <h4>Session Management</h4>
            <p>
              View and manage your active sessions across different devices and browsers.
            </p>
          </div>
          
          <div className={styles.optionControls}>
            <Button
              variant="secondary"
              disabled
            >
              Coming Soon
            </Button>
          </div>
        </div>

        <div className={styles.securityOption}>
          <div className={styles.optionInfo}>
            <h4>Login History</h4>
            <p>
              Review your recent login activity and check for any suspicious access.
            </p>
          </div>
          
          <div className={styles.optionControls}>
            <Button
              variant="secondary"
              disabled
            >
              Coming Soon
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className={styles.confirmDialog}>
          <div className={styles.dialogOverlay} onClick={cancelAction} />
          <div className={styles.dialogContent}>
            <h4>
              {pendingAction === 'enable' ? 'Enable' : 'Disable'} Two-Factor Authentication
            </h4>
            <p>
              {pendingAction === 'enable' 
                ? 'This feature is currently under development. Enabling 2FA will show as activated but full functionality is not yet available.'
                : 'Are you sure you want to disable two-factor authentication? This will make your account less secure.'
              }
            </p>
            <div className={styles.dialogButtons}>
              <Button variant="secondary" onClick={cancelAction}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={confirmAction}
                disabled={isUpdating}
              >
                {isUpdating ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default SecuritySettings;