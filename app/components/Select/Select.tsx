import { ObjectEnumValue } from '@prisma/client/runtime/library';
import React from 'react';

interface ValueType {
  label: string;
  value: string;
}

interface PropTypes {
  description: string;
  disabled?: boolean;
  label: string;
  onChange: (e: any) => void;
  values: ValueType[];
  value: string;
}

export default function Select({
  description,
  label,
  values,
  value,
  onChange,
  disabled,
}: PropTypes) {
  return (
    <div className="mb-6">
      <label
        className="block text-gray-700 text-sm font-bold mb-2"
        htmlFor={label}
      >
        {label}
      </label>
      <select
        disabled={disabled}
        className={`${
          disabled && 'opacity-50'
        } shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outlin`}
        value={value}
        onChange={onChange}
      >
        <option value="">--{description}--</option>
        {values &&
          values.map((value, index) => {
            return (
              <option key={index} value={value.value}>
                {value.label}
              </option>
            );
          })}
      </select>
    </div>
  );
}
