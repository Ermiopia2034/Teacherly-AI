import React from 'react';
import styles from './LabeledInput.module.css';

interface LabeledInputProps {
  label: string;
  id: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  className?: string; // For the wrapper div
  labelClassName?: string;
  inputClassName?: string;
  min?: string | number;
  max?: string | number;
  autoComplete?: string;
}

const LabeledInput: React.FC<LabeledInputProps> = ({
  label,
  id,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  className = '',
  labelClassName = '',
  inputClassName = '',
  min,
  max,
  autoComplete,
}) => {
  return (
    <div className={`${styles.formGroup} ${className}`}>
      <label htmlFor={id} className={`${styles.formLabel} ${labelClassName}`}>
        {label}
        {required && <span className={styles.requiredIndicator}>*</span>}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`${styles.formInput} ${inputClassName}`}
        min={min}
        max={max}
        autoComplete={autoComplete}
      />
    </div>
  );
};

export default LabeledInput;