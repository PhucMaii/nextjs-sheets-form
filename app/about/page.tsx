'use client';
import React, { useState } from 'react'
import ErrorComponent from '../admin/components/ErrorComponent'
import NavbarWrapper from '../lib/NavbarWrapper'
import RequestToJoinModal from '../components/Modals/RequestToJoinModal';

export default function AboutPage() {
    const [isOpenSignUp, setIsOpenSignUp] = useState<boolean>(false);

  return (
    <>
        <RequestToJoinModal open={isOpenSignUp} onClose={() => setIsOpenSignUp(false)} />
        <NavbarWrapper setIsOpenSignUp={setIsOpenSignUp}>
            <ErrorComponent errorText="This page is under construction" />
        </NavbarWrapper>
    </>
  )
}
