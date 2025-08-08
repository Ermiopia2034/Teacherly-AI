'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import { 
  selectUserPreferences,
  selectSettingsUpdating,
  updateUserPreferencesThunk 
} from '@/lib/features/settings/settingsSlice';
import Button from '@/components/ui/Button/Button';
import LabeledSelect from '@/components/ui/LabeledSelect/LabeledSelect';
import Card from '@/components/ui/Card/Card';
import { 
  UserPreferences,
  ThemePreference,
  LanguagePreference,
  getThemeOptions,
  getLanguageOptions,
  getTimezoneOptions 
} from '@/lib/api/settings';
import styles from './PreferencesForm.module.css';
import { useToast } from '@/providers/ToastProvider';

export function PreferencesForm() {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const preferences = useSelector(selectUserPreferences);
  const isUpdating = useSelector(selectSettingsUpdating);

  const [formData, setFormData] = useState<Partial<UserPreferences>>({
    theme: 'LIGHT' as ThemePreference,
    language: 'ENGLISH' as LanguagePreference,
    email_notifications: true,
    grade_notifications: true,
    report_notifications: true,
    system_notifications: true,
    timezone: 'UTC',
    date_format: 'YYYY-MM-DD',
    time_format: '24h'
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (preferences) {
      setFormData({
        theme: preferences.theme,
        language: preferences.language,
        email_notifications: preferences.email_notifications,
        grade_notifications: preferences.grade_notifications,
        report_notifications: preferences.report_notifications,
        system_notifications: preferences.system_notifications,
        timezone: preferences.timezone,
        date_format: preferences.date_format,
        time_format: preferences.time_format
      });
    }
  }, [preferences]);

  useEffect(() => {
    // Check if form has changes
    if (!preferences) return;
    
    const hasFormChanges = 
      formData.theme !== preferences.theme ||
      formData.language !== preferences.language ||
      formData.email_notifications !== preferences.email_notifications ||
      formData.grade_notifications !== preferences.grade_notifications ||
      formData.report_notifications !== preferences.report_notifications ||
      formData.system_notifications !== preferences.system_notifications ||
      formData.timezone !== preferences.timezone ||
      formData.date_format !== preferences.date_format ||
      formData.time_format !== preferences.time_format;
    
    setHasChanges(hasFormChanges);
  }, [formData, preferences]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!hasChanges) {
      showToast({ variant: 'info', title: 'No changes', description: 'There are no updates to save.' });
      return;
    }

    try {
      await dispatch(updateUserPreferencesThunk(formData)).unwrap();
      showToast({ variant: 'success', title: 'Preferences updated', description: 'Your preferences have been saved.' });
    } catch (error) {
      console.error('Failed to update preferences:', error);
      showToast({ variant: 'error', title: 'Update failed', description: String(error) });
    }
  };

  const handleReset = () => {
    if (preferences) {
      setFormData({
        theme: preferences.theme,
        language: preferences.language,
        email_notifications: preferences.email_notifications,
        grade_notifications: preferences.grade_notifications,
        report_notifications: preferences.report_notifications,
        system_notifications: preferences.system_notifications,
        timezone: preferences.timezone,
        date_format: preferences.date_format,
        time_format: preferences.time_format
      });
    }
  };

  const themeOptions = getThemeOptions();
  const languageOptions = getLanguageOptions();
  const timezoneOptions = getTimezoneOptions();

  const dateFormatOptions = [
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-01-15)' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (01/15/2024)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (15/01/2024)' },
    { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY (15-01-2024)' },
  ];

  const timeFormatOptions = [
    { value: '24h', label: '24 Hour (14:30)' },
    { value: '12h', label: '12 Hour (2:30 PM)' },
  ];

  return (
    <Card className={styles.formCard}>
      <div className={styles.formHeader}>
        <h3>Update Preferences</h3>
        <p>Customize your experience and notification settings</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Appearance Section */}
        <div className={styles.section}>
          <h4>Appearance</h4>
          
          <LabeledSelect
            label="Theme"
            id="theme"
            name="theme"
            value={formData.theme || 'LIGHT'}
            onChange={handleSelectChange}
            options={themeOptions}
          />
        </div>

        {/* Language & Region Section */}
        <div className={styles.section}>
          <h4>Language & Region</h4>
          
          <LabeledSelect
            label="Language"
            id="language"
            name="language"
            value={formData.language || 'ENGLISH'}
            onChange={handleSelectChange}
            options={languageOptions}
          />

          <LabeledSelect
            label="Timezone"
            id="timezone"
            name="timezone"
            value={formData.timezone || 'UTC'}
            onChange={handleSelectChange}
            options={timezoneOptions}
          />

          <LabeledSelect
            label="Date Format"
            id="date_format"
            name="date_format"
            value={formData.date_format || 'YYYY-MM-DD'}
            onChange={handleSelectChange}
            options={dateFormatOptions}
          />

          <LabeledSelect
            label="Time Format"
            id="time_format"
            name="time_format"
            value={formData.time_format || '24h'}
            onChange={handleSelectChange}
            options={timeFormatOptions}
          />
        </div>

        {/* Notifications Section */}
        <div className={styles.section}>
          <h4>Notifications</h4>
          
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="email_notifications"
                checked={formData.email_notifications || false}
                onChange={handleCheckboxChange}
              />
              <span className={styles.checkboxText}>Email Notifications</span>
              <span className={styles.checkboxDescription}>
                Receive important updates via email
              </span>
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="grade_notifications"
                checked={formData.grade_notifications || false}
                onChange={handleCheckboxChange}
              />
              <span className={styles.checkboxText}>Grade Notifications</span>
              <span className={styles.checkboxDescription}>
                Get notified when grades are updated
              </span>
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="report_notifications"
                checked={formData.report_notifications || false}
                onChange={handleCheckboxChange}
              />
              <span className={styles.checkboxText}>Report Notifications</span>
              <span className={styles.checkboxDescription}>
                Receive notifications about generated reports
              </span>
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="system_notifications"
                checked={formData.system_notifications || false}
                onChange={handleCheckboxChange}
              />
              <span className={styles.checkboxText}>System Notifications</span>
              <span className={styles.checkboxDescription}>
                Get notified about system updates and maintenance
              </span>
            </label>
          </div>
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
            {isUpdating ? 'Updating...' : 'Update Preferences'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default PreferencesForm;