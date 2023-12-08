'use client';
import { signIn, signOut } from 'next-auth/react';

export const LoginButton = () => {
  return (
    <button className="border bg-blue-500 m-2" onClick={() => signIn()}>
      Sign in
    </button>
  );
};

export const LogoutButton = () => {
  return (
    <button className="border bg-blue-500 m-2" onClick={() => signOut()}>
      Sign out
    </button>
  );
};
