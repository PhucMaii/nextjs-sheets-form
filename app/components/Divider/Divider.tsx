import React from 'react'

interface PropTypes {
    label?: string
}
export default function Divider({ label }: PropTypes) {
  return (
    <div className="flex mt-4 items-center">
        <div className="border-black w-5/12 h-px bg-black"></div>
        {label && <h2 className="font-medium text-center w-2/12 text-sm">{label}</h2>}
        <div className="border-black w-5/12 h-px bg-black"></div>
    </div>
  )
}
