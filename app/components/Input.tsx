import React, { ChangeEvent } from 'react';

interface PropTypes<T> {
  className?: string;
  disabled?: boolean;
  label?: string;
  onChange: (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  placeholder: string;
  type?: string;
  value: T;
  error?: any;
  onBlur?: any;
  name?: string;
  helperText?: any;
  multiline?: boolean;
}

export default function Input<T>({
  className,
  disabled,
  label,
  onChange,
  placeholder,
  type,
  value,
  error,
  onBlur,
  name,
  helperText,
  multiline = false,
}: PropTypes<T>) {
  return (
    <div className={`${className ? className : `mb-6`}`}>
      {label && (
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor={label}
        >
          {label}
        </label>
      )}
      {!multiline ? (
        <input
          disabled={disabled}
          className={`${disabled && 'opacity-50'} appearance-none ${
            error ? 'border-2' : 'border-solid border-slate-800'
          } rounded w-full py-2 px-3 text-gray-700 mb-3 ${className} leading-tight focus:outline-none focus:shadow-outline`}
          id={label}
          type={type}
          placeholder={placeholder}
          value={value as string | number}
          onChange={onChange}
          onError={error ? error : null}
          onBlur={onBlur ? onBlur : null}
          name={name ? name : undefined}
        />
      ) : (
        <textarea
          disabled={disabled}
          className={`${disabled && 'opacity-50'} appearance-none ${
            error ? 'border-2' : 'border-solid border-slate-800'
          } rounded w-full py-2 px-3 text-gray-700 mb-3 ${className} leading-tight focus:outline-none focus:shadow-outline`}
          id={label}
          placeholder={placeholder}
          value={value as string}
          onChange={onChange}
          onError={error ? error : null}
          onBlur={onBlur ? onBlur : null}
          name={name ? name : undefined}
        />
      )}
      {helperText && <h6 className="text-red-500 text-md">{helperText}</h6>}
    </div>
  );
}
