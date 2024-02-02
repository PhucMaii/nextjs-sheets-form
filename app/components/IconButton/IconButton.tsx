import React, { ReactNode } from 'react';

interface PropTypes {
  backgroundColor: string;
  icon: ReactNode;
  onClick: () => void;
  className?: string;
  isBackgroundBold?: boolean;
}

export default function IconButton({
  backgroundColor,
  icon,
  onClick,
  className,
  isBackgroundBold,
}: PropTypes) {
  return (
    <button
      className={`animation duration-300 inline-block text-${backgroundColor}-500 hover:bg-${backgroundColor}-${
        isBackgroundBold ? '700' : '100'
      } focus:ring-4 focus:outline-none focus:ring-${backgroundColor}-200 rounded-lg text-sm p-1.5 ${className}`}
      onClick={onClick}
    >
      {icon}
    </button>
  );
}
