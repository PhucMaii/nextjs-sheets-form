import React from 'react'

interface PropTypes {
    color: string,
    label: string,
    onClick: (e: any) => void,
    className?: string
    width: string,
    disabled?: boolean
}

export default function Button({ color, label, onClick, className, width, disabled }: PropTypes) {
    const style = `w-${width} bg-${color}-500 ${!disabled && `hover:bg-${color}-700`} ${disabled && `opacity-80`} text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${className}`
    return (
        <button
            disabled={disabled}
            className={style}
            onClick={onClick}
        >
            {label}
        </button>
  )
}
