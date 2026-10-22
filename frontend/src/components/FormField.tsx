import React from 'react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  rightElement?: React.ReactNode;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, id, required, className = '', rightElement, ...props }, ref) => {
    const inputId = id || props.name || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5 w-full">
        <div className="flex items-center justify-between">
          <label htmlFor={inputId} className="block text-[13px] font-semibold text-ink">
            {label} {required && <span className="text-error" aria-hidden="true">*</span>}
          </label>
        </div>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={`w-full h-[44px] px-3.5 text-[15px] bg-surface border rounded-control text-ink placeholder-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:border-transparent ${
              error ? 'border-error bg-red-50/20' : 'border-border hover:border-muted/50'
            } ${rightElement ? 'pr-12' : ''} ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-[12px] text-error flex items-center gap-1 font-medium mt-1">
            <span aria-hidden="true">⚠</span> {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
