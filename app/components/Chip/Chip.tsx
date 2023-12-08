import React from 'react';

interface PropTypes {
  content: string;
  handleRemove: (e: any) => void;
}

export default function Chip({ content, handleRemove }: PropTypes) {
  return (
    <div className="relativev mb-4 flex justify-between select-none items-center whitespace-nowrap rounded-lg bg-blue-100 py-1.5 px-3 mt-2 font-sans text-xs font-bold uppercase text-gray-900">
      <span className="">{content}</span>
      <button
        onClick={(e) => handleRemove(e)}
        className="btn bg-red-300 rounded-lg p-1"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
