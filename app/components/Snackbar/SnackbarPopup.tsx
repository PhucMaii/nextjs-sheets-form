import React, { useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { Fadein, PropTypes } from './type';

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
);

export default function SnackbarPopup(props: PropTypes) {
  useEffect(() => {
    if (props.open) {
      const timeoutId = setTimeout(() => {
        props.onClose();
      }, 5000);

      return () => clearTimeout(timeoutId);
    }
  }, [props.open]);
  const containerStyle =
    props.type === 'error'
      ? 'animation ease-in fixed top-0 right-0 m-5 flex items-center w-full max-w-xs p-4 text-red-600 bg-red-100 rounded-lg shadow'
      : props.type === 'success'
        ? 'animation ease-in fixed top-0 right-0 m-5 flex items-center w-full max-w-xs p-4 text-green-600 bg-green-200 rounded-lg shadow'
        : 'animation ease-in fixed top-0 right-0 m-5 flex items-center w-full max-w-xs p-4 text-yellow-600 bg-yellow-200 rounded-lg shadow';
  const textStyle =
    props.type === 'error'
      ? 'inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-300 bg-red-500 rounded-lg'
      : props.type === 'success'
        ? 'inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-300 bg-green-500 rounded-lg'
        : 'inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-yellow-300 bg-yellow-500 rounded-lg';

  return (
    <Transition.Root
      className="fixed top-0 right-0 mx-auto my-8 w-full space-y-4 z-50"
      show={props.open}
    >
      <FadeIn delay="delay-[0ms]">
        <div id="toast-default" className={containerStyle} role="alert">
          <div className={textStyle}>
            {props.type === 'error' || props.type === 'warning' ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 42 42"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#dcfce8"
                  fillRule="evenodd"
                  d="m21.002 26.588l10.357 10.604c1.039 1.072 1.715 1.083 2.773 0l2.078-2.128c1.018-1.042 1.087-1.726 0-2.839L25.245 21L36.211 9.775c1.027-1.055 1.047-1.767 0-2.84l-2.078-2.127c-1.078-1.104-1.744-1.053-2.773 0L21.002 15.412L10.645 4.809c-1.029-1.053-1.695-1.104-2.773 0L5.794 6.936c-1.048 1.073-1.029 1.785 0 2.84L16.759 21L5.794 32.225c-1.087 1.113-1.029 1.797 0 2.839l2.077 2.128c1.049 1.083 1.725 1.072 2.773 0l10.358-10.604z"
                />
              </svg>
            ) : (
              <svg
                width="64"
                height="64"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#dcfce8"
                  d="m14.83 4.89l1.34.94l-5.81 8.38H9.02L5.78 9.67l1.34-1.25l2.57 2.4z"
                />
              </svg>
            )}
          </div>
          <div className="ms-3 text-sm font-normal">{props.message}</div>
          <button
            type="button"
            className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8"
            onClick={props.onClose}
          >
            <span className="sr-only">Close</span>
            <svg
              className="w-3 h-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
          </button>
        </div>
      </FadeIn>
    </Transition.Root>
  );
}
