import React from 'react';
import loaderStyle from './style.module.css';

export default function LoadingComponent() {
  return (
    <div className="flex justify-center flex-col items-center">
      {/* <div
        className={`${loaderStyle.loader} ${width ? `w-${width}` : 'w-12'}
        } text-${color}-500`}
        role="status"
      ></div> */}
      <div className={loaderStyle.loader}>
        <img alt="Supreme Sprouts Logo" src="/supremesproutsIcon.png" />
      </div>
      <div className={loaderStyle.text}></div>
    </div>
  );
}
