import React from 'react'

interface PropTypes {
    color: string,
    label: string,
    onClick: (e: any) => void,
}

export default function Button({ color, label, onClick }: PropTypes) {
    const style = `w-full bg-${color}-500 hover:bg-${color}-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`
    return (
        <button
            className={style}
            onClick={onClick}
        >
            {label}
        </button>
  )
}
