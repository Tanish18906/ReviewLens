import React from 'react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  rightElement?: React.ReactNode;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helperText, id, required, className = '', rightElement, ...props }, ref) => {
    const inputId = id || props.name || label.toLowerCase().replace(/\s+/g, '-');
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const describedBy = [
      error ? errorId : null,
      helperText ? helperId : null,
    ].filter(Boolean).join(' ') || undefined;

    return (
      <div className="space-y-1.5 w-full">
        <label htmlFor={inputId} className="block text-[13px] font-semibold text-ink">
          {label} {required && <span className="text-error ml-0.5" aria-hidden="true">*</span>}
        </label>

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            required={required}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={`w-full h-[44px] px-3.5 text-[15px] bg-surface border rounded-control text-ink placeholder-muted/60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:border-transparent ${
              error
                ? 'border-error bg-error-subtle/30 text-error focus-visible:ring-error'
                : 'border-border hover:border-muted/50 focus-visible:border-brand'
            } ${rightElement ? 'pr-11' : ''} ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {rightElement}
            </div>
          )}
        </div>

        {error ? (
          <p id={errorId} role="alert" className="text-[12px] text-error flex items-center gap-1 font-medium mt-1">
            <span aria-hidden="true">⚠</span> {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-[12px] text-muted mt-1">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
