'use client';
import Image from 'next/image';
import React from 'react';
import Button from './Button';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface PropTypes {
  isLogin: boolean;
}

export default function Navbar({ isLogin }: PropTypes) {
  const router = useRouter();

  return (
    <div className="flex justify-between mx-2">
      <div
        className="flex gap-4 m-4 items-center cursor-pointer"
        onClick={() => router.push('/')}
      >
        <Image width={30} height={30} src="/computer-icon.png" alt="computer" />
        <h2 className="text-blue-500 font-bold text-xl">DataHabor Pro</h2>
      </div>
      <div className="m-4">
        {isLogin ? (
          <>
            <Button
              width="full"
              color="blue"
              label="Sign out"
              onClick={() =>
                signOut({ callbackUrl: 'http://localhost:3000/auth/login' })
              }
              className="bg-blue-600"
            />
          </>
        ) : (
          <Button
            width="full"
            color="blue"
            label="Sign in"
            onClick={() => router.push('/auth/login')}
            className="bg-blue-600"
          />
        )}
      </div>
    </div>
  );
}
