import React from 'react'

interface PropTypes {
    color: string,
    loadingMsg: string
}

export default function LoadingComponent({ color, loadingMsg }: PropTypes) {
    const style = `inline-block h-8 w-8 animate-spin rounded-full border-4 text-center text-${color}-500 border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]`
    return ( 
        <div className="flex flex-col justify-center items-center gap-4 mt-8">
        <div
          className={style}
          role="status"
        >
        </div>
        <h4 className="text-lg font-medium">{loadingMsg}</h4>
    </div>
  )
}
