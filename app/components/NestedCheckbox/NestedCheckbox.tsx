'use client';
import React, { useEffect, useState } from 'react';

interface Checkbox {
  isChoose: boolean;
  name: string;
}

interface PropTypes {
  disabled: boolean;
  checkboxList: Checkbox[];
  handleToggleCheckbox: (index: number) => void;
  toggleAll: boolean;
  handleToggleAll: (toggleAll: boolean) => void;
}

export default function NestedCheckbox({
  disabled,
  checkboxList,
  handleToggleCheckbox,
  toggleAll,
  handleToggleAll,
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
