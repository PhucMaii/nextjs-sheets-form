'use client';
import Image from 'next/image'
import React from 'react'
import Button from '../Button/Button'
import { redirect } from 'next/navigation'
import { signIn, signOut } from 'next-auth/react';

interface PropTypes {
    isLogin: boolean
}

export default function Navbar({ isLogin }: PropTypes) {
  return (
    <div className="flex justify-between">
        <div className="flex gap-4 m-4 items-center">
            <Image 
                width={30} 
                height={30}
                src='/computer-icon.png' 
                alt='computer'
            />
            <h2 className="text-blue-500 font-bold text-xl">DataHabor Pro</h2>
        </div>
        <div className="m-4">
            <Button 
                color="blue"
                label={isLogin ? "Sign out" : "Sign in"}
                onClick={(e: any) => {
                    if(isLogin) {
                        signOut();
                    } else {
                        signIn();
                    }
                    redirect('/api/auth/signin');
                }}
            />
        </div>

    </div>
  )
}