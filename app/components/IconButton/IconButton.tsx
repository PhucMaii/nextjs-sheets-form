import React, { ReactNode } from 'react';

interface PropTypes {
  backgroundColor: string;
  color: string;
  icon: ReactNode;
  onClick: () => void;
  className?: string;
  isBackgroundBold?: boolean;
  width?: string;
  height?: string;
}

export default function IconButton({
  backgroundColor,
  color,
  icon,
  onClick,
  className,
  isBackgroundBold,
  width,
  height,
}: PropTypes) {
  return (
    <button
      className={`inline-block text-${backgroundColor}-500 hover:bg-${backgroundColor}-${
        isBackgroundBold ? '700' : '100'
      } focus:ring-4 focus:outline-none focus:ring-${backgroundColor}-200 rounded-lg text-sm p-1.5 ${className}`}
      onClick={onClick}
    >
      {icon}
    </button>
  );
}
