import React from 'react';
import loaderStyle from './style.module.css';
import Image from 'next/image';

export default function LoadingComponent() {
  return (
    <div className="flex justify-center flex-col items-center">
      {/* <div
        className={`${loaderStyle.loader} ${width ? `w-${width}` : 'w-12'}
        } text-${color}-500`}
        role="status"
      ></div> */}
      <div className={loaderStyle.loader}>
        <Image
          alt="Supreme Sprouts Logo"
          src="/supremesproutsIcon.png"
          width={100}
          height={100}
        />
      </div>
      <div className={loaderStyle.text}></div>
    </div>
  );
}
