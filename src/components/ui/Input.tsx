'use client';

import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className="form-group">
                {label && <label className="form-label">{label}</label>}
                <input ref={ref} className={`form-input ${className}`} {...props} />
                {error && <span className="form-error">{error}</span>}
            </div>
        );
    }
);

Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className="form-group">
                {label && <label className="form-label">{label}</label>}
                <textarea ref={ref} className={`form-input form-textarea ${className}`} {...props} />
                {error && <span className="form-error">{error}</span>}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, className = '', ...props }, ref) => {
        return (
            <div className="form-group">
                {label && <label className="form-label">{label}</label>}
                <select ref={ref} className={`form-input form-select ${className}`} {...props}>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && <span className="form-error">{error}</span>}
            </div>
        );
    }
);

Select.displayName = 'Select';
