'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import {
  fetchAttendanceThunk,
  updateAttendanceThunk,
  deleteAttendanceThunk,
  selectAttendance,
  selectAttendanceLoading,
  selectAttendanceError,
  clearError
} from '@/lib/features/attendance/attendanceSlice';
import { fetchStudentsThunk, selectStudents } from '@/lib/features/students/studentsSlice';
import Button from '@/components/ui/Button/Button';
import Card from '@/components/ui/Card/Card';
import LabeledSelect from '@/components/ui/LabeledSelect/LabeledSelect';
import LabeledInput from '@/components/ui/LabeledInput/LabeledInput';
import { Attendance, AttendanceUpdatePayload } from '@/lib/api/attendance';
import styles from './AttendanceList.module.css';

export function AttendanceList() {
  const dispatch = useDispatch<AppDispatch>();
  const attendance = useSelector(selectAttendance);
  const isLoading = useSelector(selectAttendanceLoading);
  const error = useSelector(selectAttendanceError);
  const students = useSelector(selectStudents);

  const [filters, setFilters] = useState({
    student_id: 0,
    status: '',
    start_date: '',
    end_date: ''
  });

  const [editingRecord, setEditingRecord] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<{
    status: 'present' | 'absent' | 'late' | 'excused';
    notes: string;
  }>({
    status: 'present',
    notes: ''
  });

  useEffect(() => {
    dispatch(fetchStudentsThunk({}));
    dispatch(fetchAttendanceThunk({}));
  }, [dispatch]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ 
      ...prev, 
      [name]: name === 'student_id' ? Number(value) : value 
    }));
  };

  const handleEdit = (record: Attendance) => {
    setEditingRecord(record.id);
    setEditFormData({
      status: record.status,
      notes: record.notes || ''
    });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (recordId: number) => {
    try {
      const updatePayload: AttendanceUpdatePayload = {};
      
      // Find the original record to compare changes
      const originalRecord = attendance.find(r => r.id === recordId);
      if (!originalRecord) return;

      if (editFormData.status !== originalRecord.status) {
        updatePayload.status = editFormData.status;
      }
      if (editFormData.notes !== (originalRecord.notes || '')) {
        updatePayload.notes = editFormData.notes.trim() || undefined;
      }

      if (Object.keys(updatePayload).length > 0) {
        await dispatch(updateAttendanceThunk({
          attendanceId: recordId,
          payload: updatePayload
        })).unwrap();
      }

      setEditingRecord(null);
      dispatch(fetchAttendanceThunk({}));
    } catch (error) {
      console.error('Failed to update attendance:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingRecord(null);
    setEditFormData({ status: 'present', notes: '' });
  };

  const handleDelete = async (recordId: number) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        await dispatch(deleteAttendanceThunk(recordId)).unwrap();
        dispatch(fetchAttendanceThunk({}));
      } catch (error) {
        console.error('Failed to delete attendance:', error);
      }
    }
  };

  const getFilteredAttendance = () => {
    return attendance.filter(record => {
      if (filters.student_id && record.student_id !== filters.student_id) {
        return false;
      }
      if (filters.status && record.status !== filters.status) {
        return false;
      }
      if (filters.start_date && record.attendance_date < filters.start_date) {
        return false;
      }
      if (filters.end_date && record.attendance_date > filters.end_date) {
        return false;
      }
      return true;
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'present': return styles.statusPresent;
      case 'absent': return styles.statusAbsent;
      case 'late': return styles.statusLate;
      case 'excused': return styles.statusExcused;
      default: return '';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const studentOptions = [
    { value: 0, label: 'All Students' },
    ...students.map(student => ({
      value: student.id,
      label: student.full_name
    }))
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'present', label: 'Present' },
    { value: 'absent', label: 'Absent' },
    { value: 'late', label: 'Late' },
    { value: 'excused', label: 'Excused' }
  ];

  const editStatusOptions = [
    { value: 'present', label: 'Present' },
    { value: 'absent', label: 'Absent' },
    { value: 'late', label: 'Late' },
    { value: 'excused', label: 'Excused' }
  ];

  const filteredAttendance = getFilteredAttendance();

  if (isLoading && attendance.length === 0) {
    return (
      <Card className={styles.listCard}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading attendance records...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={styles.listCard}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h3>Attendance Records</h3>
          <p>View and manage all attendance records</p>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersSection}>
        <h4>Filter Records</h4>
        <div className={styles.filters}>
          <LabeledSelect
            label="Student"
            id="student_filter"
            name="student_id"
            value={filters.student_id}
            onChange={handleFilterChange}
            options={studentOptions}
          />
          
          <LabeledSelect
            label="Status"
            id="status_filter"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            options={statusOptions}
          />
          
          <LabeledInput
            label="Start Date"
            id="start_date_filter"
            name="start_date"
            type="date"
            value={filters.start_date}
            onChange={handleFilterChange}
          />
          
          <LabeledInput
            label="End Date"
            id="end_date_filter"
            name="end_date"
            type="date"
            value={filters.end_date}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className={styles.errorMessage}>
          <p>Error: {error}</p>
          <Button 
            variant="secondary" 
            onClick={() => dispatch(clearError())}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Attendance List */}
      <div className={styles.attendanceSection}>
        {filteredAttendance.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <svg 
                width="64" 
                height="64" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5"
              >
                <path d="M9 12l2 2 4-4"/>
                <circle cx="12" cy="12" r="10"/>
              </svg>
            </div>
            <h3>No attendance records found</h3>
            <p>No records match your current filters.</p>
          </div>
        ) : (
          <div className={styles.attendanceTable}>
            <div className={styles.tableHeader}>
              <div className={styles.headerCell}>Date</div>
              <div className={styles.headerCell}>Student</div>
              <div className={styles.headerCell}>Status</div>
              <div className={styles.headerCell}>Notes</div>
              <div className={styles.headerCell}>Actions</div>
            </div>
            
            <div className={styles.tableBody}>
              {filteredAttendance.map((record) => (
                <div key={record.id} className={styles.tableRow}>
                  <div className={styles.tableCell}>
                    {formatDate(record.attendance_date)}
                  </div>
                  
                  <div className={styles.tableCell}>
                    <div className={styles.studentInfo}>
                      <span className={styles.studentName}>
                        {record.student_name || 'Unknown Student'}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.tableCell}>
                    {editingRecord === record.id ? (
                      <LabeledSelect
                        label=""
                        id={`edit_status_${record.id}`}
                        name="status"
                        value={editFormData.status}
                        onChange={handleEditInputChange}
                        options={editStatusOptions}
                        className={styles.editInput}
                      />
                    ) : (
                      <span className={`${styles.statusBadge} ${getStatusBadgeClass(record.status)}`}>
                        {getStatusLabel(record.status)}
                      </span>
                    )}
                  </div>
                  
                  <div className={styles.tableCell}>
                    {editingRecord === record.id ? (
                      <LabeledInput
                        label=""
                        id={`edit_notes_${record.id}`}
                        name="notes"
                        type="text"
                        value={editFormData.notes}
                        onChange={handleEditInputChange}
                        placeholder="Enter notes"
                        className={styles.editInput}
                      />
                    ) : (
                      <span className={styles.notes}>
                        {record.notes || '-'}
                      </span>
                    )}
                  </div>
                  
                  <div className={styles.tableCell}>
                    {editingRecord === record.id ? (
                      <div className={styles.editActions}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(record.id)}
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <div className={styles.actions}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(record)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(record.id)}
                          className={styles.deleteButton}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loading overlay for refresh operations */}
      {isLoading && attendance.length > 0 && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}
    </Card>
  );
}

export default AttendanceList;