'use client';
import Image from 'next/image';
import React from 'react';
import Button from '../Button/Button';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface PropTypes {
  isLogin: boolean;
}

export default function Navbar({ isLogin }: PropTypes) {
  const router = useRouter();
  return (
    <div className="flex justify-between">
      <div
        className="flex gap-4 m-4 items-center cursor-pointer"
        onClick={() => router.push('/')}
      >
        <Image width={30} height={30} src="/computer-icon.png" alt="computer" />
        <h2 className="text-blue-500 font-bold text-xl">DataHabor Pro</h2>
      </div>
      <div className="m-4">
        <Button
          width="full"
          color="blue"
          label={isLogin ? 'Sign out' : 'Sign in'}
          onClick={() => {
            if (isLogin) {
              signOut();
            } else {
              router.push('/auth/login');
            }
          }}
        />
      </div>
    </div>
  );
}
