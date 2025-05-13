import React from 'react';
import styles from './LabeledTextarea.module.css';

interface LabeledTextareaProps {
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  className?: string; // For the wrapper div
  labelClassName?: string;
  textareaClassName?: string;
  disabled?: boolean;
}

const LabeledTextarea: React.FC<LabeledTextareaProps> = ({
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false,
  className = '',
  labelClassName = '',
  textareaClassName = '',
  disabled = false,
}) => {
  return (
    <div className={`${styles.formGroup} ${className}`}>
      <label htmlFor={id} className={`${styles.formLabel} ${labelClassName}`}>
        {label}
        {required && <span className={styles.requiredIndicator}>*</span>}
      </label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className={`${styles.formTextarea} ${textareaClassName}`}
        disabled={disabled}
      />
    </div>
  );
};

export default LabeledTextarea;