import Image from 'next/image';
import React from 'react';

export default function Logo() {
  return (
    <Image
      src={'/supremesproutsIcon.png'}
      alt="Supreme Sprouts Logo"
      width={80}
      height={80}
      style={{ borderRadius: 20 }}
    />
  );
}
