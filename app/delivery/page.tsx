"use client";
import React, { useState } from 'react'

interface SheetForm  {
  sheetName: string,
  row: number,
  revenue?: number,
  expense?: number

}

export default function CashFlow() {
  const [expense, setExpense] = useState<number>(0);
  const [form, setForm] = useState<Array<SheetForm>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState({
    on: false,
    type: '',
    message: ''
  })
  const [revenue, setRevenue] = useState<number>(0);
  const [row, setRow] = useState<number>(0);
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
        const content: any = await response.json();
        // alert(content.data);
        setNotification({
          on: true,
          type: 'success',
          message: content.data
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
                onChange={(e) => setRow(+e.target.value)}
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
                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 18c-1.5 0-2.89-.5-4-1.36 1.01-1.98 2.09-3.52 3.61-4.93 1.39-1.34 2.97-2.84 4.06-4.54 1.58-2.44 2.22-4.97 1.78-7.04C16.3 2.42 14.22 2 12 2V4c1.98 0 3.89.71 5.41 2 1.73 1.54 2.53 3.4 2.4 5.4-.14 2.27-1.4 4.22-3.18 5.72-1.32 1.04-2.86 1.78-4.6 2.07-.16.03-.33.05-.5.05z"></path>
                </svg>
                Submit
              </span>
            </button>
          </div>
        </form>
    </div>
  )
}
