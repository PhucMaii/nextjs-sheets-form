'use client';
import React from 'react';

interface Checkbox {
  isChoose: boolean;
  name: string;
}

interface PropTypes {
  checkboxList: Checkbox[];
  disabled: boolean;
  handleToggleAll: (toggleAll: boolean) => void;
  handleToggleCheckbox: (index: number) => void;
  toggleAll: boolean;
}

export default function NestedCheckbox({
  checkboxList,
  disabled,
  handleToggleAll,
  handleToggleCheckbox,
  toggleAll,
}: PropTypes) {
  return (
    <div>
      <div className="flex items-center mb-4">
        <input
          disabled={disabled}
          id="default-checkbox"
          type="checkbox"
          className="w-4 h-4 text-blue-600 bg-white-100 border-black-300 rounded focus:ring-blue-500 focus:ring-2"
          checked={toggleAll}
          onChange={() => handleToggleAll(!toggleAll)}
        />
        <label htmlFor="default-checkbox" className="ms-2 text-sm font-medium">
          All
        </label>
      </div>
      {checkboxList.length > 0 &&
        checkboxList.map((checkbox, index) => {
          return (
            <div key={index} className="flex items-center ml-4 mb-4">
              <input
                disabled={disabled}
                id="default-checkbox"
                type="checkbox"
                className="w-4 h-4 text-blue-600 bg-white-100 border-black-300 rounded focus:ring-blue-500 focus:ring-2"
                checked={checkbox.isChoose}
                onChange={() => handleToggleCheckbox(index)}
              />
              <label
                htmlFor="default-checkbox"
                className="ms-2 text-sm font-medium"
              >
                {checkbox.name}
              </label>
            </div>
          );
        })}
    </div>
  );
}
