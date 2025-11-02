import React from "react";
import { useField } from "formik";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "name"> {
  label?: string;
  error?: string;
  name?: string; // Required when used with Formik
}

export function Input({ 
  label, 
  error,
  name,
  className = "", 
  ...props 
}: InputProps) {
  // Always call useField hook (React hooks rules - must be unconditional)
  // Pass a dummy name if name is not provided to satisfy the hook
  const [field, meta] = useField(name || "");
  
  // Determine which error to show and which props to use
  const isFormikMode = !!name;
  const formikError = meta.touched && meta.error ? meta.error : undefined;
  const displayError = isFormikMode ? formikError : error;
  const inputProps = isFormikMode ? { ...field, ...props } : { ...props, name };

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={props.id || name}
          className="block text-sm font-medium mb-1 text-foreground"
        >
          {label}
        </label>
      )}
      <input
        id={props.id || name}
        className={`w-full px-3 py-2 border rounded-md bg-background text-foreground ${
          displayError
            ? "border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            : "border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-foreground"
        } ${className}`}
        {...inputProps}
      />
      {displayError && (
        <p className="mt-1 text-sm text-red-500">{displayError}</p>
      )}
    </div>
  );
}
