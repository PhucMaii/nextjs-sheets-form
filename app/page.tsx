'use client';
import React, { useContext } from 'react';
import MainPage from './overview/overviewPage';
import { UserContext } from './context/UserContextAPI';
import LoadingComponent from './components/LoadingComponent/LoadingComponent';
import './registerSW';

export default function ClientOverviewPage() {
  const { user } = useContext(UserContext);

  if (!user) {
    return <LoadingComponent />;
  }

  return <MainPage />;
}
