"use client";
import React, { useState, FC } from 'react';
import { Transition } from '@headlessui/react';
import Snackbar from '../components/Snackbar/Snackbar';

interface SheetForm  {
  sheetName: string,
  row: number,
  revenue?: number,
  expense?: number

}

interface Fadein {
  delay: string,
  children: any
}

interface Notification {
  on: boolean,
  type: string,
  message: string
}

const FadeIn = (para: Fadein) => (
  <Transition.Child
    enter={`transition-all ease-in-out duration-700 ${para.delay}`}
    enterFrom="opacity-0 translate-y-6"
    enterTo="opacity-100 translate-y-0"
    leave="transition-all ease-in-out duration-300"
    leaveFrom="opacity-100"
    leaveTo="opacity-0"
  >
    {para.children}
  </Transition.Child>
)

export default function CashFlow() {
  const [expense, setExpense] = useState<number>(0);
  const [form, setForm] = useState<Array<SheetForm>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: '',
    message: ''
  })
  const [revenue, setRevenue] = useState<number>(0);
  const [row, setRow] = useState<number>(1);
  const [sheetName, setSheetName] = useState<string>('');

  const handleAddSheet = (e: any) => {
    e.preventDefault();
    if(sheetName === '') {
      return;
    }
    setForm((prevForm: Array<SheetForm>) => {
      return [
        ...prevForm,
        {
          sheetName,
          row,
          expense: expense && expense,
          revenue: revenue && revenue
        }
      ]
    })
    setRow(0);
  }

  const handleRemoveSheet = (e: any, id: number ) => {
    e.preventDefault();
    const newForm = form.filter((_, index) => index !== id);
    setForm(newForm);
  }

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
        const response: any = await fetch('/api/expense', {
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(form)
        })
        setNotification({
          on: true,
          type: 'success',
          message: "Data Added Successfully"
        })
        setRow(0);
        setRevenue(0);
        setExpense(0);
        setForm([]);
        setIsLoading(false);
    } catch(error) {
        setIsLoading(false)
        console.log(error);
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-16">
      <h4 className="px-8">Delivery Input Form</h4>
      <Snackbar 
        open={notification.on} 
        onClose={() => setNotification({...notification, on: false})}  
        message={notification.message}
        type={notification.type}
        />
      <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="expense"
          >
            Expense
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="expense"
            type="number"
            placeholder="Name"
            value={expense}
            onChange={(e) => setExpense(+e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="revenue"
          >
            Revenue
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="revenue"
            type="number"
            placeholder="Revenue"
            value={revenue}
            onChange={(e) => setRevenue(+e.target.value)}
          />
        </div>
        <div className="border my-4"></div>
        <div className="grid grid-cols-2 gap-5 align-center">
          {
            form.length > 0 && (
              <React.Fragment>
              <div></div>
                <div>
                  {
                    form.map((sheet, index) => {
                      return (
                        <div key={index} className="relative flex justify-between select-none items-center whitespace-nowrap rounded-lg bg-gray-900/10 py-1.5 px-3 mt-2 font-sans text-xs font-bold uppercase text-gray-900">
                          <span className="">Sheet Name: {sheet.sheetName}, Row: {sheet.row}</span>
                          <button onClick={(e) => handleRemoveSheet(e, index)} className="btn bg-red-300 rounded-lg p-1">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              strokeWidth="1.5" 
                              stroke="currentColor" 
                              className="w-6 h-6"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )
                    })
                  }
                </div>
              </React.Fragment>
            )
          }
          <div className="mb-6 w-full">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="row"
            >
              Row
            </label>
            <input
              className="w-full shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="row"
              type="number"
              placeholder="Row"
              value={row}
              onChange={(e) => {
                if(+e.target.value > 0) {
                  setRow(+e.target.value)
                }
              }}
            />
          </div>
          <div className="mb-6 w-full">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="sheetName"
            >
              Sheet Name
            </label>
            <select
              className="w-full shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="sheetName"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
            >
              <option value="">--Choose a sheet name--</option>
              <option value="MAIN">MAIN</option>
              <option value="DELIVERY_APP">DELIVERY_APP</option>
            </select>
            <div className="mb-6 w-full text-right">
              <button 
                className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" 
                onClick={handleAddSheet}
              >
                Add Sheet
              </button>
            </div>
          </div>
        </div>
        <div className="flex">
          <button
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={handleSubmit}
          >
            <span className="flex align-center justify-center">
              {
                isLoading ?
                  <svg className="mx-2" width="25" height="25" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <g stroke="#ffffff">
                        <circle cx="12" cy="12" r="9.5" fill="none" strokeLinecap="round" strokeWidth="3">
                            <animate attributeName="stroke-dasharray" calcMode="spline" dur="1.5s" keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1" keyTimes="0;0.475;0.95;1" repeatCount="indefinite" values="0 150;42 150;42 150;42 150"/>
                            <animate attributeName="stroke-dashoffset" calcMode="spline" dur="1.5s" keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1" keyTimes="0;0.475;0.95;1" repeatCount="indefinite" values="0;-16;-59;-59"/>
                        </circle>
                        <animateTransform attributeName="transform" dur="2s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/>
                    </g>
                  </svg> : 
                  <svg width="25" height="25" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#FFFFFF" d="M10 2c-4.42 0-8 3.58-8 8s3.58 8 8 8s8-3.58 8-8s-3.58-8-8-8zm-.615 12.66h-1.34l-3.24-4.54l1.341-1.25l2.569 2.4l5.141-5.931l1.34.94l-5.811 8.381z"/>
                  </svg>
              }
              Submit
            </span>
          </button>
        </div>
      </form>
    </div>
  )
}
