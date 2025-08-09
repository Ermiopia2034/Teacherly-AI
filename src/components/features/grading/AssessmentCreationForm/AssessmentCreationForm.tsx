"use client";

import React, { useState, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/lib/store";
import {
  createAssessmentThunk,
  selectGradingCreating,
  selectGradingError,
  clearError,
} from "@/lib/features/grading/gradingSlice";
import Button from "@/components/ui/Button/Button";
import LabeledInput from "@/components/ui/LabeledInput/LabeledInput";
import LabeledTextarea from "@/components/ui/LabeledTextarea/LabeledTextarea";
import FileUpload from "@/components/ui/FileUpload/FileUpload";
import Card from "@/components/ui/Card/Card";
import { AssessmentCreatePayload } from "@/lib/api/grading";
import styles from "./AssessmentCreationForm.module.css";
import { useToast } from "@/providers/ToastProvider";

interface AssessmentCreationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AssessmentCreationForm({
  onSuccess,
  onCancel,
}: AssessmentCreationFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const isCreating = useSelector(selectGradingCreating);
  const error = useSelector(selectGradingError);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    max_score: 100,
    answer_key: "",
  });

  const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAnswerKeyUpload = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setAnswerKeyFile(file);

      // Read file content for text files
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setFormData((prev) => ({ ...prev, answer_key: content }));
        };
        reader.readAsText(file);
      } else {
        // For other file types, just use the filename as placeholder
        setFormData((prev) => ({
          ...prev,
          answer_key: `Answer key file: ${file.name}`,
        }));
      }

      // Clear validation error
      if (validationErrors.answer_key) {
        setValidationErrors((prev) => ({ ...prev, answer_key: "" }));
      }
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = "Assessment title is required";
    }

    if (formData.title.trim().length > 200) {
      errors.title = "Title must be 200 characters or less";
    }

    if (formData.description.length > 1000) {
      errors.description = "Description must be 1000 characters or less";
    }

    if (formData.max_score <= 0) {
      errors.max_score = "Maximum score must be greater than 0";
    }

    if (formData.max_score > 1000) {
      errors.max_score = 'Maximum score cannot exceed 1000';
    }

    if (!formData.answer_key.trim() && !answerKeyFile) {
      errors.answer_key = "Answer key is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast({
        variant: "error",
        title: "Validation error",
        description: "Please correct the highlighted fields.",
      });
      return;
    }

    try {
      const payload: AssessmentCreatePayload = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        max_score: formData.max_score,
        answer_key: formData.answer_key.trim(),
      };

      await dispatch(createAssessmentThunk(payload)).unwrap();

      // Reset form
      setFormData({
        title: "",
        description: "",
        max_score: 100,
        answer_key: "",
      });
      setAnswerKeyFile(null);
      setValidationErrors({});
      showToast({
        variant: "success",
        title: "Assessment created",
        description: "The assessment has been created successfully.",
      });

      onSuccess?.();
    } catch (error) {
      console.error("Failed to create assessment:", error);
      showToast({
        variant: "error",
        title: "Creation failed",
        description: String(error),
      });
    }
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      title: "",
      description: "",
      max_score: 100,
      answer_key: "",
    });
    setAnswerKeyFile(null);
    setValidationErrors({});
    dispatch(clearError());
    onCancel?.();
  };

  return (
    <Card className={styles.container}>
      <div className={styles.header}>
        <h3>Create New Assessment</h3>
        <p>Set up an assessment for automated grading with OCR</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Basic Information */}
        <div className={styles.section}>
          <h4>Assessment Information</h4>

          <LabeledInput
            label="Assessment Title"
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter assessment title..."
            required
          />
          {validationErrors.title && (
            <div className={styles.fieldError}>{validationErrors.title}</div>
          )}

          <LabeledTextarea
            label="Description (Optional)"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter assessment description..."
            rows={3}
          />
          {validationErrors.description && (
            <div className={styles.fieldError}>
              {validationErrors.description}
            </div>
          )}

          <LabeledInput
            label="Maximum Score"
            id="max_score"
            name="max_score"
            type="number"
            value={formData.max_score}
            onChange={handleInputChange}
            min={1}
            max={1000}
            required
          />
          {validationErrors.max_score && (
            <div className={styles.fieldError}>
              {validationErrors.max_score}
            </div>
          )}
        </div>

        {/* Answer Key */}
        <div className={styles.section}>
          <h4>Answer Key</h4>
          <p className={styles.sectionDescription}>
            Upload an answer key or manually enter the correct answers
          </p>

          <div className={styles.answerKeySection}>
            <FileUpload
              onFileSelect={handleAnswerKeyUpload}
              accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png"
              multiple={false}
              maxSize={5}
              className={styles.answerKeyUpload}
            >
              <div className={styles.uploadPrompt}>
                <div className={styles.uploadIcon}>
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10,9 9,9 8,9" />
                  </svg>
                </div>
                <p>Upload Answer Key</p>
                <span>Supports: PDF, DOC, TXT, Images</span>
              </div>
            </FileUpload>

            {answerKeyFile && (
              <div className={styles.fileInfo}>
                <div className={styles.fileName}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                  </svg>
                  {answerKeyFile.name}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAnswerKeyFile(null);
                    setFormData((prev) => ({ ...prev, answer_key: "" }));
                  }}
                >
                  Remove
                </Button>
              </div>
            )}

            <div className={styles.orDivider}>
              <span>OR</span>
            </div>

            <LabeledTextarea
              label="Answer Key Text"
              id="answer_key"
              name="answer_key"
              value={formData.answer_key}
              onChange={handleInputChange}
              placeholder="Enter the correct answers manually..."
              rows={6}
            />
          </div>

          {validationErrors.answer_key && (
            <div className={styles.fieldError}>
              {validationErrors.answer_key}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className={styles.errorMessage}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <p>{error}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => dispatch(clearError())}
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Form Actions */}
        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating} isLoading={isCreating}>
            {isCreating ? "Creating..." : "Create Assessment"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default AssessmentCreationForm;
