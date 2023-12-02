"use client";
import { redirect } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react';
import Snackbar from '../components/Snackbar/Snackbar';
import { Notification, User } from './type';
import Input from '../components/Input/Input';
import Button from '../components/Button/Button';
import LoadingComponent from '../components/LoadingComponent/LoadingComponent';


export default function SignupForm() {
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: '',
    message: ''
  });
  const [userData, setUserData] = useState<User>({
    firstName: '',
    email: '',
    password: '',
  });
  const {data: session} = useSession();
  const sessionRef: any = useRef(); // for ignoring the first run of useEffect

  useEffect(() => {
    // Check if it's not the initial render
    if (sessionRef.current !== undefined) {
      if (!session) {
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }
    }
    // Update the ref with the current value of session
    sessionRef.current = '';
  }, [session, sessionRef]);
  
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if(userData.password.length < 6){
      setNotification({
        on: true,
        type: 'error',
        message: 'Password length must be greater than 6'
      });
      return;
    }
    if(userData.password !== confirmPassword) {
      setNotification({
        on: true,
        type: 'error',
        message: 'Confirm Password does not match'
      });
      return;
    }
    try {
      const response = await fetch('/api/signup', {
        method: "POST",
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(userData)
      }) 
      setUserData({
        firstName: '',
        email: '',
        password: ''
      })
      setConfirmPassword('');
      redirect('/api/auth/signin');
    } catch(error) {
      console.log(error);
    }
  }
  
  if(session) {
    return redirect('/dashboard');
  }
  
  if(isLoading) {
    return (
      <LoadingComponent color="blue" loadingMsg="Loading"/>
    )
  }

  return (
    <main className="bg-gray-100 min-h-screen">
      <Snackbar  
        open={notification.on} 
        type={notification.type} 
        onClose={() => setNotification({...notification, on: false})} 
        message={notification.message}   
      />
      <div className="max-w-2xl mx-auto py-16">
        <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-center text-lg font-bold my-4">Welcome To Our Sheets App</h2>
          <Input<string> 
            label="Name"
            onChange={(e) => setUserData({...userData, firstName: e.target.value})}
            placeholder="Enter your name..."
            type="text"
            value={userData.firstName}
          />
          <Input<string> 
            label="Email"
            onChange={(e) => setUserData({...userData, email: e.target.value})}
            placeholder="Enter your email..."
            type="email"
            value={userData.email}
          />
          <Input<string> 
            label="Password"
            onChange={(e) => setUserData({...userData, password: e.target.value})}
            placeholder="Enter your password..."
            type="password"
            value={userData.password}
          />
          <Input<string> 
            label="Confirm Password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Enter your confirm password..."
            type="password"
            value={confirmPassword}
          />
          <Button 
            color="blue"
            onClick={handleSubmit}
            label="Sign up"
          />
          <h4 className="text-right mt-4">
            Have an account already? <a
            className="text-right inline-block align-baseline mb-2 font-bold text-sm text-blue-500 hover:text-blue-800"
            href="/api/auth/signin"
          >
            Log in here
          </a>    
          </h4>
        </form>
      </div>
    </main>
  );
}
