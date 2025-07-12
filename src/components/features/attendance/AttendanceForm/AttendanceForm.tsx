'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import { 
  createAttendanceThunk, 
  createBulkAttendanceThunk,
  fetchAttendanceThunk,
  selectAttendanceCreating, 
  selectAttendanceError 
} from '@/lib/features/attendance/attendanceSlice';
import { fetchStudentsThunk, selectStudents } from '@/lib/features/students/studentsSlice';
import Button from '@/components/ui/Button/Button';
import LabeledInput from '@/components/ui/LabeledInput/LabeledInput';
import LabeledSelect from '@/components/ui/LabeledSelect/LabeledSelect';
import Card from '@/components/ui/Card/Card';
import { AttendanceRecord } from '@/lib/api/attendance';
import styles from './AttendanceForm.module.css';

interface AttendanceFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AttendanceForm({ onSuccess, onCancel }: AttendanceFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const isCreating = useSelector(selectAttendanceCreating);
  const error = useSelector(selectAttendanceError);
  const students = useSelector(selectStudents);

  const [mode, setMode] = useState<'single' | 'bulk'>('bulk');
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Single attendance form
  const [singleFormData, setSingleFormData] = useState({
    student_id: 0,
    status: 'present' as 'present' | 'absent' | 'late' | 'excused',
    notes: ''
  });

  // Bulk attendance form
  const [bulkAttendance, setBulkAttendance] = useState<Record<number, AttendanceRecord>>({});

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(fetchStudentsThunk({}));
  }, [dispatch]);

  useEffect(() => {
    // Initialize bulk attendance when students are loaded
    if (students.length > 0 && Object.keys(bulkAttendance).length === 0) {
      const initialBulkData: Record<number, AttendanceRecord> = {};
      students.forEach(student => {
        initialBulkData[student.id] = {
          student_id: student.id,
          status: 'present',
          notes: ''
        };
      });
      setBulkAttendance(initialBulkData);
    }
  }, [students, bulkAttendance]);

  const handleSingleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSingleFormData(prev => ({ 
      ...prev, 
      [name]: name === 'student_id' ? Number(value) : value 
    }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBulkStatusChange = (studentId: number, status: AttendanceRecord['status']) => {
    setBulkAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleBulkNotesChange = (studentId: number, notes: string) => {
    setBulkAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], notes }
    }));
  };

  const validateSingleForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!singleFormData.student_id || singleFormData.student_id === 0) {
      errors.student_id = 'Please select a student';
    }

    if (!attendanceDate) {
      errors.attendance_date = 'Please select a date';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateBulkForm = (): boolean => {
    if (!attendanceDate) {
      setValidationErrors({ attendance_date: 'Please select a date' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (mode === 'single') {
      if (!validateSingleForm()) return;

      try {
        await dispatch(createAttendanceThunk({
          attendance_date: attendanceDate,
          student_id: singleFormData.student_id,
          status: singleFormData.status,
          notes: singleFormData.notes.trim() || undefined
        })).unwrap();

        // Reset form
        setSingleFormData({
          student_id: 0,
          status: 'present',
          notes: ''
        });
        
        setValidationErrors({});
        dispatch(fetchAttendanceThunk({}));
        
        if (onSuccess) onSuccess();
      } catch (error) {
        console.error('Failed to record attendance:', error);
      }
    } else {
      if (!validateBulkForm()) return;

      try {
        const attendanceRecords = Object.values(bulkAttendance);
        
        await dispatch(createBulkAttendanceThunk({
          attendance_date: attendanceDate,
          attendance_records: attendanceRecords
        })).unwrap();

        // Reset bulk form to all present
        const resetBulkData: Record<number, AttendanceRecord> = {};
        students.forEach(student => {
          resetBulkData[student.id] = {
            student_id: student.id,
            status: 'present',
            notes: ''
          };
        });
        setBulkAttendance(resetBulkData);
        
        setValidationErrors({});
        dispatch(fetchAttendanceThunk({}));
        
        if (onSuccess) onSuccess();
      } catch (error) {
        console.error('Failed to record bulk attendance:', error);
      }
    }
  };

  const statusOptions = [
    { value: 'present', label: 'Present' },
    { value: 'absent', label: 'Absent' },
    { value: 'late', label: 'Late' },
    { value: 'excused', label: 'Excused' }
  ];

  const studentOptions = students.map(student => ({
    value: student.id,
    label: student.full_name
  }));

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'present': return styles.statusPresent;
      case 'absent': return styles.statusAbsent;
      case 'late': return styles.statusLate;
      case 'excused': return styles.statusExcused;
      default: return '';
    }
  };

  return (
    <Card className={styles.formCard}>
      <div className={styles.formHeader}>
        <h3>Record Attendance</h3>
        <p>Mark student attendance for {new Date(attendanceDate).toLocaleDateString()}</p>
      </div>

      <div className={styles.modeSelector}>
        <Button
          type="button"
          variant={mode === 'single' ? 'primary' : 'secondary'}
          onClick={() => setMode('single')}
          disabled={isCreating}
        >
          Single Student
        </Button>
        <Button
          type="button"
          variant={mode === 'bulk' ? 'primary' : 'secondary'}
          onClick={() => setMode('bulk')}
          disabled={isCreating}
        >
          All Students
        </Button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <LabeledInput
          label="Date"
          id="attendance_date"
          name="attendance_date"
          type="date"
          value={attendanceDate}
          onChange={(e) => setAttendanceDate(e.target.value)}
          required
        />
        {validationErrors.attendance_date && (
          <div className={styles.fieldError}>{validationErrors.attendance_date}</div>
        )}

        {mode === 'single' ? (
          <div className={styles.singleForm}>
            <LabeledSelect
              label="Student"
              id="student_id"
              name="student_id"
              value={singleFormData.student_id}
              onChange={handleSingleInputChange}
              options={studentOptions}
              placeholder="Select a student"
              required
            />
            {validationErrors.student_id && (
              <div className={styles.fieldError}>{validationErrors.student_id}</div>
            )}

            <LabeledSelect
              label="Status"
              id="status"
              name="status"
              value={singleFormData.status}
              onChange={handleSingleInputChange}
              options={statusOptions}
              required
            />

            <LabeledInput
              label="Notes"
              id="notes"
              name="notes"
              type="text"
              value={singleFormData.notes}
              onChange={handleSingleInputChange}
              placeholder="Enter notes (optional)"
            />
          </div>
        ) : (
          <div className={styles.bulkForm}>
            <div className={styles.bulkHeader}>
              <h4>Mark attendance for all students</h4>
              <div className={styles.bulkActions}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    const allPresent: Record<number, AttendanceRecord> = {};
                    students.forEach(student => {
                      allPresent[student.id] = {
                        student_id: student.id,
                        status: 'present',
                        notes: ''
                      };
                    });
                    setBulkAttendance(allPresent);
                  }}
                  disabled={isCreating}
                >
                  Mark All Present
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    const allAbsent: Record<number, AttendanceRecord> = {};
                    students.forEach(student => {
                      allAbsent[student.id] = {
                        student_id: student.id,
                        status: 'absent',
                        notes: ''
                      };
                    });
                    setBulkAttendance(allAbsent);
                  }}
                  disabled={isCreating}
                >
                  Mark All Absent
                </Button>
              </div>
            </div>

            <div className={styles.studentsList}>
              {students.map(student => (
                <div key={student.id} className={styles.studentRow}>
                  <div className={styles.studentInfo}>
                    <span className={styles.studentName}>{student.full_name}</span>
                    {student.grade_level && (
                      <span className={styles.studentGrade}>Grade {student.grade_level}</span>
                    )}
                  </div>
                  
                  <div className={styles.statusButtons}>
                    {statusOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        className={`${styles.statusButton} ${
                          bulkAttendance[student.id]?.status === option.value 
                            ? `${styles.active} ${getStatusBadgeClass(option.value)}` 
                            : ''
                        }`}
                        onClick={() => handleBulkStatusChange(student.id, option.value as AttendanceRecord['status'])}
                        disabled={isCreating}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Notes (optional)"
                    value={bulkAttendance[student.id]?.notes || ''}
                    onChange={(e) => handleBulkNotesChange(student.id, e.target.value)}
                    className={styles.notesInput}
                    disabled={isCreating}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <div className={styles.buttonGroup}>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isCreating}
          >
            {isCreating ? 'Recording...' : 'Record Attendance'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default AttendanceForm;