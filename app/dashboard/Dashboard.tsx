'use client';
import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar/Navbar'
import Button from '../components/Button/Button'
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface PropTypes {
    isLogin: boolean
}

export default function Dashboard({ isLogin }: PropTypes) {
    const router = useRouter();
    const [fadeIn, setFadeIn] = useState(false);

    useEffect(() => {
        setFadeIn(true);
    }, [])

    return (
        <div className={`transition-opacity duration-700 ease-in ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
            <Navbar isLogin={isLogin} />
            <div className="flex flex-col items-center gap-4 m-8 p-8 ">
                <h1 className="text-6xl text-center text-blue-500 font-bold">Empower Your Business With Precision and Ease</h1>
                <div className="w-1/3 mt-4">
                    <Button 
                        label={isLogin ? "Create Forms" : "Get Started"}
                        color="blue"
                        onClick={(e: any) => router.push('/delivery')}
                        width="full"
                    />
                </div>
            </div>
            {
                isLogin ? (
                    <>
                        <div>
                            Your Forms
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
