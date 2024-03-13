'use client';
import Image from 'next/image';
import React from 'react';
import { Dropdown } from 'flowbite-react';
import { signOut } from 'next-auth/react';
import { FaSignOutAlt } from 'react-icons/fa';
import { MdOutlineSecurity } from 'react-icons/md';

interface PropTypes {
  handleOpenSecurityModal?: () => void;
}

export default function Navbar({ handleOpenSecurityModal }: PropTypes) {
  return (
    <div className="flex justify-between mx-2">
      <div className="flex gap-4 m-4 items-center cursor-pointer">
        <Image width={30} height={30} src="/computer-icon.png" alt="computer" />
        <h2 className="text-blue-500 font-bold text-xl">DataHabor Pro</h2>
      </div>
      <div className="m-4">
        <Dropdown style={{ background: 'black' }} label="My Account">
          <Dropdown.Item
            icon={MdOutlineSecurity}
            onClick={handleOpenSecurityModal}
          >
            Security
          </Dropdown.Item>
          <Dropdown.Item
            icon={FaSignOutAlt}
            onClick={() =>
              signOut({ callbackUrl: 'http://localhost:3000/auth/login' })
            }
          >
            Sign out
          </Dropdown.Item>
        </Dropdown>
      </div>
    </div>
  );
}
