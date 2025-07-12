'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import { generateReportThunk, selectReportsGenerating, selectReportsError } from '@/lib/features/reports/reportsSlice';
import { fetchStudentsThunk, selectStudents } from '@/lib/features/students/studentsSlice';
import { fetchMyContent } from '@/lib/api/content';
import Button from '@/components/ui/Button/Button';
import LabeledInput from '@/components/ui/LabeledInput/LabeledInput';
import LabeledSelect from '@/components/ui/LabeledSelect/LabeledSelect';
import Card from '@/components/ui/Card/Card';
import { ContentRead } from '@/lib/api/content';
import { ReportType, ReportFormat, getAvailableReportTypes, getAvailableFormats, getDateRangePresets } from '@/lib/api/reports';
import styles from './ReportConfigForm.module.css';

interface ReportConfigFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReportConfigForm({ onSuccess, onCancel }: ReportConfigFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const isGenerating = useSelector(selectReportsGenerating);
  const error = useSelector(selectReportsError);
  const students = useSelector(selectStudents);

  const [contentItems, setContentItems] = useState<ContentRead[]>([]);
  const [formData, setFormData] = useState({
    report_type: ReportType.COMPREHENSIVE,
    start_date: '',
    end_date: '',
    student_ids: [] as number[],
    content_ids: [] as number[],
    format: ReportFormat.EXCEL,
    include_summary: true,
    include_trends: false
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
  const [selectedContent, setSelectedContent] = useState<Set<number>>(new Set());
  const [selectAllStudents, setSelectAllStudents] = useState(false);
  const [selectAllContent, setSelectAllContent] = useState(false);

  useEffect(() => {
    // Fetch students and content for selection
    dispatch(fetchStudentsThunk({}));
    fetchContentItems();
    
    // Set default date range to last 30 days
    const presets = getDateRangePresets();
    const last30Days = presets.find(p => p.label === 'Last 30 Days');
    if (last30Days) {
      const dateRange = last30Days.getValue();
      setFormData(prev => ({
        ...prev,
        start_date: dateRange.start,
        end_date: dateRange.end
      }));
    }
  }, [dispatch]);

  const fetchContentItems = async () => {
    try {
      const content = await fetchMyContent();
      setContentItems(content);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDatePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetLabel = e.target.value;
    if (presetLabel) {
      const presets = getDateRangePresets();
      const preset = presets.find(p => p.label === presetLabel);
      if (preset) {
        const dateRange = preset.getValue();
        setFormData(prev => ({
          ...prev,
          start_date: dateRange.start,
          end_date: dateRange.end
        }));
      }
    }
  };

  const handleStudentSelection = (studentId: number, checked: boolean) => {
    const newSelected = new Set(selectedStudents);
    if (checked) {
      newSelected.add(studentId);
    } else {
      newSelected.delete(studentId);
      setSelectAllStudents(false);
    }
    setSelectedStudents(newSelected);
    setFormData(prev => ({
      ...prev,
      student_ids: Array.from(newSelected)
    }));
  };

  const handleSelectAllStudents = (checked: boolean) => {
    setSelectAllStudents(checked);
    if (checked) {
      const allStudentIds = new Set(students.map(s => s.id));
      setSelectedStudents(allStudentIds);
      setFormData(prev => ({
        ...prev,
        student_ids: Array.from(allStudentIds)
      }));
    } else {
      setSelectedStudents(new Set());
      setFormData(prev => ({
        ...prev,
        student_ids: []
      }));
    }
  };

  const handleContentSelection = (contentId: number, checked: boolean) => {
    const newSelected = new Set(selectedContent);
    if (checked) {
      newSelected.add(contentId);
    } else {
      newSelected.delete(contentId);
      setSelectAllContent(false);
    }
    setSelectedContent(newSelected);
    setFormData(prev => ({
      ...prev,
      content_ids: Array.from(newSelected)
    }));
  };

  const handleSelectAllContent = (checked: boolean) => {
    setSelectAllContent(checked);
    if (checked) {
      const allContentIds = new Set(contentItems.map(c => c.id));
      setSelectedContent(allContentIds);
      setFormData(prev => ({
        ...prev,
        content_ids: Array.from(allContentIds)
      }));
    } else {
      setSelectedContent(new Set());
      setFormData(prev => ({
        ...prev,
        content_ids: []
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.start_date) {
      errors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      errors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      errors.end_date = 'End date must be after start date';
    }

    // Check if date range is not too far in the future
    const today = new Date().toISOString().split('T')[0];
    if (formData.end_date > today) {
      errors.end_date = 'End date cannot be in the future';
    }

    // Validate that at least some students are selected (if not all)
    if (formData.student_ids.length === 0 && students.length > 0) {
      // This is okay - it means all students will be included
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
      const reportRequest = {
        ...formData,
        // If no students selected, include all by omitting student_ids
        student_ids: formData.student_ids.length === 0 ? undefined : formData.student_ids,
        // If no content selected, include all by omitting content_ids
        content_ids: formData.content_ids.length === 0 ? undefined : formData.content_ids,
      };

      await dispatch(generateReportThunk(reportRequest)).unwrap();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      report_type: ReportType.COMPREHENSIVE,
      start_date: '',
      end_date: '',
      student_ids: [],
      content_ids: [],
      format: ReportFormat.EXCEL,
      include_summary: true,
      include_trends: false
    });
    setSelectedStudents(new Set());
    setSelectedContent(new Set());
    setSelectAllStudents(false);
    setSelectAllContent(false);
    setValidationErrors({});
    
    if (onCancel) {
      onCancel();
    }
  };

  const reportTypeOptions = getAvailableReportTypes().map(type => ({
    value: type.value,
    label: type.label
  }));

  const formatOptions = getAvailableFormats().map(format => ({
    value: format.value,
    label: format.label
  }));

  const datePresetOptions = [
    { value: '', label: 'Custom Date Range' },
    ...getDateRangePresets().map(preset => ({
      value: preset.label,
      label: preset.label
    }))
  ];

  return (
    <Card className={styles.formCard}>
      <div className={styles.formHeader}>
        <h3>Generate Report</h3>
        <p>Configure and generate comprehensive student reports</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Report Type */}
        <LabeledSelect
          label="Report Type"
          id="report_type"
          name="report_type"
          value={formData.report_type}
          onChange={handleInputChange}
          options={reportTypeOptions}
          required
        />

        {/* Date Range */}
        <div className={styles.dateSection}>
          <h4>Date Range</h4>
          
          <LabeledSelect
            label="Quick Select"
            id="date_preset"
            name="date_preset"
            value=""
            onChange={handleDatePresetChange}
            options={datePresetOptions}
          />

          <div className={styles.dateGroup}>
            <LabeledInput
              label="Start Date"
              id="start_date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleInputChange}
              required
            />
            
            <LabeledInput
              label="End Date"
              id="end_date"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleInputChange}
              required
            />
          </div>
          {validationErrors.start_date && (
            <div className={styles.fieldError}>{validationErrors.start_date}</div>
          )}
          {validationErrors.end_date && (
            <div className={styles.fieldError}>{validationErrors.end_date}</div>
          )}
        </div>

        {/* Student Selection */}
        <div className={styles.selectionSection}>
          <h4>Student Selection</h4>
          <p className={styles.sectionDescription}>
            Select specific students or leave empty to include all students
          </p>
          
          <div className={styles.selectAllOption}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectAllStudents}
                onChange={(e) => handleSelectAllStudents(e.target.checked)}
              />
              Select All Students ({students.length})
            </label>
          </div>

          <div className={styles.selectionGrid}>
            {students.map(student => (
              <label key={student.id} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedStudents.has(student.id)}
                  onChange={(e) => handleStudentSelection(student.id, e.target.checked)}
                />
                {student.full_name} ({student.grade_level})
              </label>
            ))}
          </div>
        </div>

        {/* Content Selection (only for grades reports) */}
        {(formData.report_type === ReportType.GRADES || formData.report_type === ReportType.COMPREHENSIVE) && (
          <div className={styles.selectionSection}>
            <h4>Content Selection</h4>
            <p className={styles.sectionDescription}>
              Select specific assessments or leave empty to include all content
            </p>
            
            <div className={styles.selectAllOption}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectAllContent}
                  onChange={(e) => handleSelectAllContent(e.target.checked)}
                />
                Select All Content ({contentItems.length})
              </label>
            </div>

            <div className={styles.selectionGrid}>
              {contentItems.map(content => (
                <label key={content.id} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectedContent.has(content.id)}
                    onChange={(e) => handleContentSelection(content.id, e.target.checked)}
                  />
                  {content.title} ({content.content_type})
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Report Options */}
        <div className={styles.optionsSection}>
          <h4>Report Options</h4>
          
          <LabeledSelect
            label="Format"
            id="format"
            name="format"
            value={formData.format}
            onChange={handleInputChange}
            options={formatOptions}
            required
          />

          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="include_summary"
                checked={formData.include_summary}
                onChange={handleInputChange}
              />
              Include Summary Statistics
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="include_trends"
                checked={formData.include_trends}
                onChange={handleInputChange}
              />
              Include Trend Analysis
            </label>
          </div>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <div className={styles.buttonGroup}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating Report...' : 'Generate Report'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default ReportConfigForm;