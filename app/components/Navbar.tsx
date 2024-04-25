/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import Image from 'next/image';
import React from 'react';

export default function Navbar() {
  const url = process.env.NEXT_PUBLIC_WEB_URL;
  return (
    <div className="flex justify-between mx-2">
      <div className="flex gap-4 m-4 items-center cursor-pointer">
        <Image
          width={80}
          height={80}
          src="/supremesproutsIcon.png"
          alt="Supreme Sprouts Logo"
        />
      </div>
    </div>
  );
}
