'use client';
import { Notification } from '@/app/utils/type';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'

export default function Form() {
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: '',
    message: ''
  });
  const { id } : any = useParams();

  useEffect(() => {
    fetchForm();
  }, [])

  const fetchForm = async () => {
    try {
      const response = await fetch(`/api/form/?id=${id}`, {
        method: 'GET',
        headers: {
          'Content-type': 'application/json'
        }
      })
      if (!response.ok) {
        console.error(`Error fetching data. Status: ${response.status}`);
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setFormData(data);
      setIsLoading(false);
    } catch(error) {
      console.log(error);
    }
  }
  return (
    <div className="max-w-2xl mx-auto py-16">
      <h4 className="px-8">Delivery Input Form</h4>
      <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      
      </form>
    </div>
  )
}
