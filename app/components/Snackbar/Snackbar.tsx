import React from 'react';
import { Transition } from '@headlessui/react';

interface Fadein {
    delay: string,
    children: any
}

interface PropTypes {
    open: boolean,
    onClose: () => void,
    message: string,
    type: string
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

export default function Snackbar(props: PropTypes) {
  return (
    <Transition.Root className="absolute top-0 right-0 mx-auto my-8 w-full space-y-4" show={props.open}>
    <FadeIn delay="delay-[0ms]">
      <div id="toast-default" className="animation ease-in absolute top-0 right-0 m-5 flex items-center w-full max-w-xs p-4 text-green-100 bg-green-600 rounded-lg shadow" role="alert">
        <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-500 rounded-lg">
          <svg width="64" height="64" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill="#dcfce8" d="m14.83 4.89l1.34.94l-5.81 8.38H9.02L5.78 9.67l1.34-1.25l2.57 2.4z"/>
          </svg>
        </div>
        <div className="ms-3 text-sm font-normal">{props.message}</div>
        <button 
          type="button" 
          className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8" 
          onClick={props.onClose}
        >
          <span className="sr-only">Close</span>
          <svg className="w-3 h-3"  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
          </svg>
        </button>
      </div>
    </FadeIn>
  </Transition.Root>
  )
}
