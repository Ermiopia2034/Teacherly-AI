import React from 'react';
import styles from './LabeledSelect.module.css';

interface SelectOption {
  value: string | number;
  label: string;
}

interface LabeledSelectProps {
  label: string;
  id: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  required?: boolean;
  className?: string; // For the wrapper div
  labelClassName?: string;
  selectClassName?: string;
  disabled?: boolean;
}

const LabeledSelect: React.FC<LabeledSelectProps> = ({
  label,
  id,
  name,
  value,
  onChange,
  options,
  required = false,
  className = '',
  labelClassName = '',
  selectClassName = '',
  disabled = false,
}) => {
  return (
    <div className={`${styles.formGroup} ${className}`}>
      <label htmlFor={id} className={`${styles.formLabel} ${labelClassName}`}>
        {label}
        {required && <span className={styles.requiredIndicator}>*</span>}
      </label>
      <div className={styles.selectWrapper}>
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`${styles.formSelect} ${selectClassName}`}
          disabled={disabled}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className={styles.selectArrow}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </div>
    </div>
  );
};

export default LabeledSelect;