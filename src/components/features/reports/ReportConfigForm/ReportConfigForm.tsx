'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import { generateReportThunk, selectReportsGenerating, selectReportsError } from '@/lib/features/reports/reportsSlice';
import { fetchStudentsThunk, selectStudents } from '@/lib/features/students/studentsSlice';
import Button from '@/components/ui/Button/Button';
import LabeledInput from '@/components/ui/LabeledInput/LabeledInput';
import LabeledSelect from '@/components/ui/LabeledSelect/LabeledSelect';
import Card from '@/components/ui/Card/Card';
import { ReportType, ReportFormat, getAvailableReportTypes, getAvailableFormats, getSemesters, Semester } from '@/lib/api/reports';
import styles from './ReportConfigForm.module.css';
import { useToast } from '@/providers/ToastProvider';

interface ReportConfigFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReportConfigForm({ onSuccess, onCancel }: ReportConfigFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const isGenerating = useSelector(selectReportsGenerating);
  const error = useSelector(selectReportsError);
  const students = useSelector(selectStudents);

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [formData, setFormData] = useState({
    report_type: ReportType.SINGLE_STUDENT,
    semester_id: undefined as number | undefined,
    student_ids: [] as number[],
    format: ReportFormat.EXCEL,
    recipient_email: ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
  const [selectAllStudents, setSelectAllStudents] = useState(false);

  useEffect(() => {
    // Fetch students and semesters for selection
    dispatch(fetchStudentsThunk({}));
    fetchSemesters();
  }, [dispatch]);

  const fetchSemesters = async () => {
    try {
      const semesterList = await getSemesters();
      setSemesters(semesterList);
      // Set default semester to current semester if available
      const currentSemester = semesterList.find(s => s.is_current);
      if (currentSemester) {
        setFormData(prev => ({
          ...prev,
          semester_id: currentSemester.id
        }));
      }
    } catch (error) {
      console.error('Failed to fetch semesters:', error);
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


  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Semester is always required
    if (!formData.semester_id) {
      errors.semester_id = 'Semester selection is required';
    }
    
    // Single student report must have exactly one student selected
    if (formData.report_type === ReportType.SINGLE_STUDENT) {
      if (formData.student_ids.length !== 1) {
        errors.student_ids = 'Please select exactly one student for single student reports';
      }
    }
    
    // School administrative report requires recipient email
    if (formData.report_type === ReportType.SCHOOL_ADMINISTRATIVE) {
      if (!formData.recipient_email || !formData.recipient_email.trim()) {
        errors.recipient_email = 'Recipient email is required for school administrative reports';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.recipient_email.trim())) {
        errors.recipient_email = 'Please enter a valid email address';
      }
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

    try {
      const reportRequest = {
        report_type: formData.report_type,
        semester_id: formData.semester_id!,
        format: formData.format,
        // If no students selected for administrative reports, include all by omitting student_ids
        student_ids: formData.report_type === ReportType.SINGLE_STUDENT
          ? formData.student_ids
          : (formData.student_ids.length === 0 ? undefined : formData.student_ids),
        // Only include recipient_email for school administrative reports
        recipient_email: formData.report_type === ReportType.SCHOOL_ADMINISTRATIVE
          ? formData.recipient_email.trim() : undefined,
      };

      await dispatch(generateReportThunk(reportRequest)).unwrap();
      showToast({
        variant: 'success',
        title: 'Report generated',
        description: 'The report has been generated and sent to the recipient.'
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      showToast({ variant: 'error', title: 'Generation failed', description: String(error) });
    }
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      report_type: ReportType.SINGLE_STUDENT,
      semester_id: undefined,
      student_ids: [],
      format: ReportFormat.EXCEL,
      recipient_email: ''
    });
    setSelectedStudents(new Set());
    setSelectAllStudents(false);
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

  const semesterOptions = semesters.map(semester => ({
    value: semester.id.toString(),
    label: `${semester.name} (${semester.status})`
  }));

  return (
    <Card className={styles.formCard}>
      <div className={styles.formHeader}>
        <h3>Generate Report</h3>
        <p>Generate simplified reports: Single Student (sent to parent) or Administrative (sent to specified email)</p>
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

        {/* Semester Selection - Always Required */}
        <div className={styles.dateSection}>
          <h4>Semester Selection</h4>
          <p className={styles.sectionDescription}>
            Select the semester to get all available grades, attendance, and feedback data for the selected students.
          </p>
          <LabeledSelect
            label="Semester"
            id="semester_id"
            name="semester_id"
            value={formData.semester_id?.toString() || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              semester_id: e.target.value ? parseInt(e.target.value) : undefined
            }))}
            options={[
              { value: '', label: 'Select a semester...' },
              ...semesterOptions
            ]}
            required
          />
          {validationErrors.semester_id && (
            <div className={styles.fieldError}>{validationErrors.semester_id}</div>
          )}
        </div>

        {/* Recipient Email for School Administrative Reports */}
        {formData.report_type === ReportType.SCHOOL_ADMINISTRATIVE && (
          <div className={styles.emailSection}>
            <h4>Recipient Information</h4>
            <LabeledInput
              label="Recipient Email"
              id="recipient_email"
              name="recipient_email"
              type="email"
              value={formData.recipient_email}
              onChange={handleInputChange}
              placeholder="Enter administrator email address"
              required
            />
            {validationErrors.recipient_email && (
              <div className={styles.fieldError}>{validationErrors.recipient_email}</div>
            )}
          </div>
        )}

        {/* Student Selection */}
        <div className={styles.selectionSection}>
          <h4>Student Selection</h4>
          <p className={styles.sectionDescription}>
            {formData.report_type === ReportType.SINGLE_STUDENT ? (
              <>
                Select exactly one student for this report. The report will be automatically sent to the parent&apos;s email address on file.
                {validationErrors.student_ids && (
                  <span className={styles.fieldError}> {validationErrors.student_ids}</span>
                )}
              </>
            ) : formData.report_type === ReportType.SCHOOL_ADMINISTRATIVE ? (
              'Select specific students or leave empty to include all students in the administrative report.'
            ) : (
              'Select specific students or leave empty to include all students'
            )}
          </p>
          
          {formData.report_type !== ReportType.SINGLE_STUDENT && (
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
          )}

          <div className={styles.selectionGrid}>
            {students.map(student => (
              <label key={student.id} className={styles.checkboxLabel}>
                <input
                  type={formData.report_type === ReportType.SINGLE_STUDENT ? 'radio' : 'checkbox'}
                  name={formData.report_type === ReportType.SINGLE_STUDENT ? 'single_student' : undefined}
                  checked={selectedStudents.has(student.id)}
                  onChange={(e) => {
                    if (formData.report_type === ReportType.SINGLE_STUDENT) {
                      // For single student, clear all others and select only this one
                      setSelectedStudents(new Set([student.id]));
                      setFormData(prev => ({
                        ...prev,
                        student_ids: [student.id]
                      }));
                    } else {
                      handleStudentSelection(student.id, e.target.checked);
                    }
                  }}
                />
                {student.full_name} ({student.grade_level})
                {student.parent_email && formData.report_type === ReportType.SINGLE_STUDENT && (
                  <span className={styles.parentEmail}> - {student.parent_email}</span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Report Format */}
        <div className={styles.optionsSection}>
          <h4>Report Format</h4>
          <p className={styles.sectionDescription}>
            All reports include comprehensive data: grades, attendance, and individual assessment feedback.
          </p>
          
          <LabeledSelect
            label="Format"
            id="format"
            name="format"
            value={formData.format}
            onChange={handleInputChange}
            options={formatOptions}
            required
          />
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