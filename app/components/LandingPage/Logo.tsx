import Image from 'next/image';
import React from 'react';

export default function Logo({width, height}: {width?: number; height?: number}) {
  return (
    <Image
      src={'/supremesproutsIcon.png'}
      alt="Supreme Sprouts Logo"
      width={width ?? 80}
      height={height ?? 80}
      style={{ borderRadius: 20 }}
    />
  );
}
