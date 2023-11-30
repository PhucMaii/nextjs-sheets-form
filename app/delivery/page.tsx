"use client";
import React, { useState } from 'react'

export default function CashFlow() {
  const [expense, setExpense] = useState<number>(0);
  const [revenue, setRevenue] = useState<number>(0);
  const [row, setRow] = useState<number>(0)
  const handleSubmit = async () => {
    const form = [
      {
        sheetName: 'MAIN',
        row: 3,
        revenue
      },
      {
        sheetName: 'DELIVERY_APP',
        row: 1,
        expense,
        revenue
      }
    ];
    try {
        const response: any = await fetch('/api/expense', {
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(form)
        })
        const content: any = await response.json();
        alert(content.data);
        console.log(content);
    } catch(error) {
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
              className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="revenue"
              type="number"
              placeholder="Revenue"
              value={revenue}
              onChange={(e) => setRevenue(+e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="row"
            >
              Row
            </label>
            <input
              className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="row"
              type="number"
              placeholder="Row"
              value={revenue}
              onChange={(e) => setRow(+e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </form>
    </div>
  )
}
