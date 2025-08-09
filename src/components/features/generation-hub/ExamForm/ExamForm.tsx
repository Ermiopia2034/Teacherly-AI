"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./ExamForm.module.css";
import LabeledInput from "@/components/ui/LabeledInput/LabeledInput";
import LabeledSelect from "@/components/ui/LabeledSelect/LabeledSelect";
import LabeledTextarea from "@/components/ui/LabeledTextarea/LabeledTextarea";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/lib/store";
import {
  submitExamGenerationThunk,
  selectGenerationIsSubmitting,
  selectGenerationSubmitError,
  selectShowSuccessMessage,
  selectLastSubmissionResponse,
  resetGenerationState,
  clearSuccessMessage,
} from "@/lib/features/generation/generationSlice";
import {
  fetchCurrentSemesterThunk,
  selectCurrentSemester,
  selectSemestersLoading,
} from "@/lib/features/academic/semestersSlice";
import {
  fetchSubjects,
  fetchGrades,
  fetchChapters,
  fetchTopics,
} from "@/lib/api/curriculum";
import MarkAllocationProgress from "@/components/features/academic/MarkAllocationProgress/MarkAllocationProgress";
import { useToast } from "@/providers/ToastProvider";

export default function ExamForm() {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const { showToast } = useToast();
  const isSubmitting = useSelector(selectGenerationIsSubmitting);
  const submitError = useSelector(selectGenerationSubmitError);
  const showSuccessMessage = useSelector(selectShowSuccessMessage);
  const submissionResponse = useSelector(selectLastSubmissionResponse);
  const currentSemester = useSelector(selectCurrentSemester);
  const semestersLoading = useSelector(selectSemestersLoading);

  const [formData, setFormData] = useState({
    subject: "",
    grade: "",
    unit: "",
    topics: [] as string[],
    examType: "quiz",
    difficulty: "medium",
    questionCount: "",
    marks: "",
    additionalInfo: "",
  });

  const [markValidation, setMarkValidation] = useState({
    isValid: true,
    remainingMarks: 0,
  });

  const [subjects, setSubjects] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const hasStartedRedirectRef = useRef(false);

  useEffect(() => {
    // Fetch current semester when component mounts
    dispatch(fetchCurrentSemesterThunk());
  }, [dispatch]);

  // Handle success message and delayed redirect
  useEffect(() => {
    if (
      showSuccessMessage &&
      submissionResponse &&
      !hasStartedRedirectRef.current
    ) {
      hasStartedRedirectRef.current = true;
      showToast({
        variant: "success",
        title: "Exam generation started",
        description:
          "Your exam is being generated in the background. You will find it in My Contents once it’s ready.",
      });
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
        router.push("/dashboard/my-contents");
      }, 3000); // Show success message for 3 seconds

      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage, submissionResponse, dispatch, router, showToast]);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const subjectData = await fetchSubjects();
        setSubjects(subjectData);
      } catch {
        setError("Failed to load subjects.");
      }
    };
    loadSubjects();
  }, []);

  useEffect(() => {
    if (formData.subject) {
      const loadGrades = async () => {
        try {
          const gradeData = await fetchGrades(formData.subject);
          setGrades(gradeData);
        } catch {
          setError("Failed to load grades.");
        }
      };
      loadGrades();
    }
  }, [formData.subject]);

  useEffect(() => {
    if (formData.subject && formData.grade) {
      const loadChapters = async () => {
        try {
          const chapterData = await fetchChapters(
            formData.subject,
            formData.grade,
          );
          setChapters(chapterData);
        } catch {
          setError("Failed to load chapters.");
        }
      };
      loadChapters();
    }
  }, [formData.subject, formData.grade]);

  useEffect(() => {
    if (formData.subject && formData.grade && formData.unit) {
      const loadTopics = async () => {
        try {
          const topicData = await fetchTopics(
            formData.subject,
            formData.grade,
            formData.unit,
          );
          setTopics(topicData);
        } catch {
          setError("Failed to load topics.");
        }
      };
      loadTopics();
    }
  }, [formData.subject, formData.grade, formData.unit]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newState = { ...prev, [name]: value };
      if (name === "subject") {
        newState.grade = "";
        newState.unit = "";
        newState.topics = [];
        setGrades([]);
        setChapters([]);
        setTopics([]);
      }
      if (name === "grade") {
        newState.unit = "";
        newState.topics = [];
        setChapters([]);
        setTopics([]);
      }
      if (name === "unit") {
        newState.topics = [];
        setTopics([]);
      }
      return newState;
    });
  };

  const handleTopicChange = (topicValue: string, isChecked: boolean) => {
    setFormData((prev) => {
      const newTopics = isChecked
        ? [...prev.topics, topicValue]
        : prev.topics.filter((topic) => topic !== topicValue);
      return { ...prev, topics: newTopics };
    });
  };

  const handleMarkValidationChange = useCallback(
    (isValid: boolean, remainingMarks: number) => {
      setMarkValidation({ isValid, remainingMarks });
    },
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Check if all basic fields are filled
    if (!areBasicFieldsFilled) {
      const errors: Record<string, string> = {};
      if (!formData.subject) errors.subject = "Subject is required";
      if (!formData.grade) errors.grade = "Grade level is required";
      if (!formData.unit) errors.unit = "Unit is required";
      if (formData.topics.length === 0)
        errors.topics = "Select at least one topic";
      if (!formData.examType) errors.examType = "Exam type is required";
      if (!formData.difficulty) errors.difficulty = "Difficulty is required";
      setFieldErrors(errors);
      setError("Please fix the highlighted fields.");
      showToast({
        variant: "error",
        title: "Validation error",
        description: "Please complete the required fields.",
      });
      return;
    }

    // Check if marks and question count are filled
    if (!formData.questionCount || !formData.marks) {
      const errors: Record<string, string> = {};
      if (!formData.questionCount)
        errors.questionCount = "Number of questions is required";
      if (!formData.marks) errors.marks = "Total marks is required";
      setFieldErrors(errors);
      setError("Please fix the highlighted fields.");
      showToast({
        variant: "error",
        title: "Validation error",
        description: "Enter the number of questions and total marks.",
      });
      return;
    }

    // Check mark validation before submitting
    if (!markValidation.isValid) {
      setFieldErrors((prev) => ({
        ...prev,
        marks: "Allocated marks exceed the semester limit",
      }));
      setError(
        "The allocated marks exceed the semester limit. Please adjust the marks.",
      );
      showToast({
        variant: "warning",
        title: "Marks exceed limit",
        description: "Adjust total marks to fit semester allocation.",
      });
      return;
    }

    // Check if semester is available
    if (!currentSemester) {
      setError("No current semester found. Please set up a semester first.");
      showToast({
        variant: "error",
        title: "Semester not set",
        description:
          "Please configure the current semester in Academic Structure.",
      });
      return;
    }

    dispatch(resetGenerationState());
    hasStartedRedirectRef.current = false;

    try {
      // Include semester context and marks in the form data
      const examPayload = {
        ...formData,
        semester_id: currentSemester.id,
        marks: Number(formData.marks),
      };

      await dispatch(submitExamGenerationThunk(examPayload)).unwrap();
      // Success message and redirect will be handled by useEffect
    } catch (rejectedValue) {
      setError(rejectedValue as string);
      showToast({
        variant: "error",
        title: "Generation failed",
        description: String(rejectedValue),
      });
    }
  };

  // Check if all required fields (except marks/questions) are filled
  const areBasicFieldsFilled =
    formData.subject &&
    formData.grade &&
    formData.unit &&
    formData.topics.length > 0 &&
    formData.examType &&
    formData.difficulty;

  const toOptions = (items: string[]) =>
    items.map((item) => ({ value: item, label: item }));

  const examTypeOptions = [
    { value: "quiz", label: "Quiz" },
    { value: "midterm", label: "Mid Exam" },
    { value: "final", label: "Final Exam" },
  ];

  const difficultyOptions = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
  ];

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardTitle}>Exam Generator</h2>
          <p className={styles.cardSubtitle}>
            Fill in the details to generate your exam
          </p>
        </div>
      </div>
      <div className={styles.cardContent}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <LabeledSelect
            label="Subject"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            options={toOptions(subjects)}
            placeholder="Select a subject"
            required
          />
          {fieldErrors.subject && (
            <div className={styles.errorText}>{fieldErrors.subject}</div>
          )}
          <LabeledSelect
            label="Grade Level"
            id="grade"
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            options={toOptions(grades)}
            placeholder="Select a grade level"
            required
            disabled={!formData.subject}
          />
          {fieldErrors.grade && (
            <div className={styles.errorText}>{fieldErrors.grade}</div>
          )}
          <LabeledSelect
            label="Unit"
            id="unit"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            options={toOptions(chapters)}
            placeholder="Select a unit"
            required
            disabled={!formData.grade}
          />
          {fieldErrors.unit && (
            <div className={styles.errorText}>{fieldErrors.unit}</div>
          )}
          <div className={styles.formGroup}>
            <label className={styles.label}>Topics *</label>
            <div className={styles.checkboxGroup}>
              {topics.length > 0 ? (
                topics.map((topic) => (
                  <label key={topic} className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      value={topic}
                      checked={formData.topics.includes(topic)}
                      onChange={(e) =>
                        handleTopicChange(topic, e.target.checked)
                      }
                      disabled={!formData.unit}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkboxLabel}>{topic}</span>
                  </label>
                ))
              ) : (
                <p className={styles.placeholderText}>
                  {!formData.unit
                    ? "Select a unit first"
                    : "No topics available"}
                </p>
              )}
            </div>
          </div>
          {fieldErrors.topics && (
            <div className={styles.errorText}>{fieldErrors.topics}</div>
          )}
          <LabeledSelect
            label="Exam Type"
            id="examType"
            name="examType"
            value={formData.examType}
            onChange={handleChange}
            options={examTypeOptions}
            required
          />
          {fieldErrors.examType && (
            <div className={styles.errorText}>{fieldErrors.examType}</div>
          )}

          <LabeledSelect
            label="Difficulty Level"
            id="difficulty"
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            options={difficultyOptions}
            required
          />
          {fieldErrors.difficulty && (
            <div className={styles.errorText}>{fieldErrors.difficulty}</div>
          )}

          <LabeledInput
            label="Number of Questions"
            id="questionCount"
            name="questionCount"
            type="number"
            value={formData.questionCount}
            onChange={handleChange}
            min="1"
            max="50"
            required
            disabled={!areBasicFieldsFilled}
            placeholder={
              areBasicFieldsFilled
                ? "Enter number of questions"
                : "Fill required fields first"
            }
          />
          {fieldErrors.questionCount && (
            <div className={styles.errorText}>{fieldErrors.questionCount}</div>
          )}

          <LabeledInput
            label="Total Marks"
            id="marks"
            name="marks"
            type="number"
            value={formData.marks}
            onChange={handleChange}
            min="1"
            max="100"
            required
            disabled={!areBasicFieldsFilled}
            placeholder={
              areBasicFieldsFilled
                ? "Enter total marks"
                : "Fill required fields first"
            }
          />
          {fieldErrors.marks && (
            <div className={styles.errorText}>{fieldErrors.marks}</div>
          )}

          {/* Mark Allocation Progress */}
          {currentSemester && areBasicFieldsFilled && formData.marks && (
            <div className={styles.markAllocationSection}>
              <MarkAllocationProgress
                showValidation={true}
                validationMarks={Number(formData.marks)}
                contentType={formData.examType}
                onValidationChange={handleMarkValidationChange}
                className={styles.markAllocationProgress}
              />
            </div>
          )}

          {!currentSemester && !semestersLoading && (
            <div className={styles.warningMessage}>
              <p>
                ⚠️ No current semester found. Marks allocation tracking is
                disabled. Please set up a semester in the academic management
                section.
              </p>
            </div>
          )}

          <LabeledTextarea
            label="Additional Information"
            id="additionalInfo"
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleChange}
            placeholder="Any specific requirements or details you want to include..."
            rows={4}
          />

          {/* Removed inline success confirmation; toast handles this now */}

          {(error || submitError) && (
            <div className={styles.errorText}>
              Error: {error || submitError}
            </div>
          )}

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={
                isSubmitting ||
                !areBasicFieldsFilled ||
                !formData.questionCount ||
                !formData.marks
              }
            >
              {isSubmitting ? "Submitting..." : "Generate and Save"}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <Link
              href="/dashboard/generation-hub"
              className={styles.cancelButton}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
