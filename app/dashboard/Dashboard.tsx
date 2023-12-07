'use client';
import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar/Navbar'
import Button from '../components/Button/Button'
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import FormCard from '../components/FormCard/FormCard';
import { useSession } from 'next-auth/react';
import LoadingComponent from '../components/LoadingComponent/LoadingComponent';

interface PropTypes {
    userId: string,
    isLogin: boolean
}

interface FormType {
    form_id: number,
    form_name: string,
    user_id: number,
    lastOpened: Date
}

export default function Dashboard({ userId, isLogin }: PropTypes) {
    const router = useRouter();
    const [fadeIn, setFadeIn] = useState(false);
    const [formList, setFormList] = useState<FormType[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if(!isLoading) {
            setFadeIn(true);
        }
    }, [isLoading])

    useEffect(() => {
        if(userId) {
            fetchForms();
        }
        if(!isLogin) {
            setIsLoading(false);
        }
    }, [])

    const fetchForms = async () => {
        try {
            const response = await fetch(`/api/allForms/?userId=${userId}`, {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json'
                }
            });
            if (!response.ok) {
                console.error(`Error fetching data. Status: ${response.status}`);
                throw new Error('Failed to fetch data');
              }
            const res = await response.json();
            res.data.sort((formA: FormType, formB: FormType) => new Date(formB.lastOpened).valueOf() - new Date(formA.lastOpened).valueOf());
            setFormList(res.data);
            setIsLoading(false);
        } catch(error) {
            console.log(error);
            setIsLoading(false);
        }
    }
    if(isLoading) {
        return (
          <div className="flex flex-col gap-8 items-center mt-8">
            <LoadingComponent color="blue"/>
            <h2 className="font-bold text-lg">Loading...</h2>
          </div>
        )
    }
    return (
        <div className={`transition-opacity duration-700 ease-in ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
            <Navbar isLogin={isLogin} />
            <div className="flex flex-col items-center gap-4 m-8 p-8 ">
                <h1 className="text-6xl text-center text-blue-500 font-bold">Empower Your Business With Precision and Ease</h1>
                <div className="w-1/3 mt-4">
                    <Button 
                        label={isLogin ? "Create Forms" : "Get Started"}
                        color="blue"
                        onClick={(e: any) => router.push('/create-form')}
                        width="full"
                    />
                </div>
            </div>
            {
                isLogin ? (
                    <>
                        <div className="m-8 px-8 ">
                            <h1 className="text-4xl text-blue-500 text-center font-bold mb-8">YOUR FORMS</h1>
                            <div className="flex gap-8 justify-center flex-wrap mx-auto">
                                {
                                    formList.length > 0 ? formList.map((form) => {
                                        return <FormCard key={form.form_id} form={form} />
                                    }) : (
                                        <div className="flex flex-col gap-4 justify-center items-center text-gray-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-12 h-12 font-bold text-center">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                            </svg>
                                            <h1 className="text-xl text-gray-500 font-medium">You currently do not have any forms</h1>
                                        </div>    
                                    )
                                }
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-4xl font-medium text-center">Powerful tool integrate with Google Sheets</h2>
                        <div className="flex justify-around items-center mt-8">
                            <Image 
                                width={300}
                                height={300}
                                src="/sample.png"
                                alt="Sample"
                                style={{borderRadius: '10px'}}
                            />
                            <Image 
                                width={100}
                                height={100}
                                src="/transfer-icon.png"
                                alt="Transfer Icon"
                            />
                                <Image 
                                width={300}
                                height={300}
                                src="/google-sheets.jpg"
                                alt="GoogleSheets Img"
                                style={{borderRadius: '10px'}}
                            />
                        </div>
                    </>
                )
            }
        </div>
    )
}
