import React, { MouseEvent, ReactNode } from 'react';
import LoadingComponent from './LoadingComponent/LoadingComponent';

interface PropTypes {
  className?: string;
  color: string;
  disabled?: boolean;
  isLoading?: boolean;
  loadingButton?: boolean;
  label: string | ReactNode;
  onClick?: (e: MouseEvent) => void;
  width: string;
  justify?: string; // justify the label
  type?: 'button' | 'submit' | 'reset' | undefined;
}

export default function Button({
  className,
  color,
  disabled,
  isLoading,
  label,
  loadingButton,
  onClick,
  width,
  justify,
  type,
}: PropTypes) {
  const style = `
        flex justify-${
          justify ? justify : 'center'
        } items-center gap-4 w-${width} bg-${color}-600 ${
          !disabled && `hover:bg-${color}-700`
        }
        animation duration-300 shadow-md hover:shadow-xl
        ${
          (disabled || isLoading) && `opacity-70`
        } text-white font-bold py-2 px-4 rounded 
        focus:outline-none focus:shadow-outline ${className}
    `;
  return (
    <button
      disabled={disabled || isLoading}
      className={style}
      onClick={onClick}
      type={type}
    >
      {loadingButton &&
        (isLoading ? (
          <LoadingComponent />
        ) : (
          <svg
            width="25"
            height="25"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#FFFFFF"
              d="M10 2c-4.42 0-8 3.58-8 8s3.58 8 8 8s8-3.58 8-8s-3.58-8-8-8zm-.615 12.66h-1.34l-3.24-4.54l1.341-1.25l2.569 2.4l5.141-5.931l1.34.94l-5.811 8.381z"
            />
          </svg>
        ))}
      {label}
    </button>
  );
}
