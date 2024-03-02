import React from 'react';
import loaderStyle from './style.module.css'

interface PropTypes {
  color: string;
  width?: string;
  height?: string;
}

export default function LoadingComponent({ color, width }: PropTypes) {
  return (
    <div className="flex justify-center">
      <div
        className={`${loaderStyle.loader} ${width ? `w-${width}` : 'w-12'}
        } text-${color}-500`}
        role="status"
      ></div>
    </div>
  );
}
