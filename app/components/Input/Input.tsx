import React, { ChangeEvent } from 'react';

interface PropTypes<T> {
  label: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type: string;
  placeholder: string;
  value: T;
  disabled?: boolean;
}

export default function Input<T>({
  label,
  onChange,
  placeholder,
  type,
  value,
  disabled,
}: PropTypes<T>) {
  return (
    <div className="mb-6">
      <label
        className="block text-gray-700 text-sm font-bold mb-2"
        htmlFor={label}
      >
        {label}
      </label>
      <input
        disabled={disabled}
        className={`${
          disabled && 'opacity-50'
        } shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline`}
        id={label}
        type={type}
        placeholder={placeholder}
        value={value as any}
        onChange={onChange}
      />
    </div>
  );
}