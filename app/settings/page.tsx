'use client';
import React from 'react';
import FadeIn from '../HOC/FadeIn';
import Divider from '../components/Divider/Divider';
import Input from '../components/Input/Input';
import Button from '../components/Button/Button';

export default function page() {
  return (
    <FadeIn>
      <div className="max-w-6xl mx-auto py-16">
        <h4 className="text-2xl font-bold">Settings</h4>
        <Divider />
        <div className="grid grid-cols-2 mb-6">
          <h4 className="text-xl mt-4">General Information</h4>
          <div className="flex flex-col gap-4 mt-4">
            <Input
              label="Name"
              placeholder="Enter your name"
              type="text"
              value=""
              onChange={() => {}}
              className="mb-0"
            />
            <Divider />
            <Input
              label="Email"
              placeholder="Enter your email"
              type="text"
              value=""
              onChange={() => {}}
              className="mb-0"
            />
            <Button
              color="blue"
              label="Update"
              onClick={() => {}}
              width="100%"
            />
          </div>
        </div>
        <Divider />
        <div className="grid grid-cols-2">
          <h4 className="text-xl mt-4">Security</h4>
          <div className="flex flex-col gap-4 mt-4">
            <Input
              label="Current Password"
              placeholder="Enter your current password"
              type="password"
              value=""
              onChange={() => {}}
              className="mb-0"
            />
            <Divider />
            <Input
              label="New Password"
              placeholder="Enter your new password"
              type="password"
              value=""
              onChange={() => {}}
              className="mb-0"
            />
            <Button
              color="blue"
              label="Update"
              onClick={() => {}}
              width="100%"
            />
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
