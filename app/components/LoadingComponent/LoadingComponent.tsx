import React from 'react'

interface PropTypes {
    color: string,
    width?: string,
    height?: string
}

export default function LoadingComponent({ color, width, height }: PropTypes) {
    const style = `inline-block 
      h-${height ? height: '8'} w-${width ? width: '8'} 
      animate-spin rounded-full border-4 text-center 
      text-${color}-500 border-current border-r-transparent 
      align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]`;
    return ( 
      <div className="flex justify-center">
        <div
          className={style}
          role="status"
        >
        </div>
      </div>
  )
}
