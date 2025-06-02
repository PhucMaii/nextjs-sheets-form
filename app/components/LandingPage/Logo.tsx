import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function Logo({
  width,
  height,
}: {
  width?: number;
  height?: number;
}) {
  const router = useRouter();
  return (
    <Image
      src={'/supremesproutsIcon.png'}
      alt="Supreme Sprouts Logo"
      width={width ?? 80}
      height={height ?? 80}
      style={{ borderRadius: 20 }}
      onClick={() => router.push('/')}
    />
  );
}
