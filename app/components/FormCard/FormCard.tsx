'use client';
import { customStyles } from '@/app/utils/styles';
import moment from 'moment/moment';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Modal from 'react-modal';

interface PropTypes {
  form: any;
  handleDelete: (id: number) => void;
}

export default function FormCard({ form, handleDelete }: PropTypes) {
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const router = useRouter();
  return (
    <div className="w-full relative flex flex-col gap-2 w-1/4 p-6 sm:p-2 rounded-2xl bg-white border border-gray-200 rounded-lg shadow">
      <Modal isOpen={openDeleteModal} style={customStyles}>
        <div className="relative p-4 w-full max-w-md max-h-full">
          <div className="relative bg-white rounded-lg">
            <button
              type="button"
              className="absolute top-1 right-2.5 text-center flex justify-center items-center text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center-600"
              data-modal-hide="popup-modal"
              onClick={() => setOpenDeleteModal(false)}
            >
              <svg
                className="w-3 h-3 text-center"
                aria-hidden="true"
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
            <div className="p-4 md:p-5 text-center">
              <svg
                className="mx-auto mb-4 text-gray-400 w-12 h-12"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <h3 className="mb-5 text-lg font-normal text-gray-500">
                Are you sure you want to delete this product?
              </h3>
              <button
                onClick={() => {
                  handleDelete(form.form_id);
                  setOpenDeleteModal(false);
                }}
                data-modal-hide="popup-modal"
                type="button"
                className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center me-2"
              >
                Yes, I&apos;m sure
              </button>
              <button
                onClick={() => setOpenDeleteModal(false)}
                data-modal-hide="popup-modal"
                type="button"
                className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10-600-600"
              >
                No, cancel
              </button>
            </div>
          </div>
        </div>
      </Modal>
      <div className="text-right">
        <button onClick={() => router.push(`/edit-form/${form.form_id}`)} className="inline-block text-blue-500 hover:bg-blue-100 focus:ring-4 focus:outline-none focus:ring-blue-200 rounded-lg text-sm p-1.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
            />
          </svg>
        </button>
        <button
          className="inline-block text-red-500 hover:bg-red-100 focus:ring-4 focus:outline-none focus:ring-red-200 rounded-lg text-sm p-1.5"
          onClick={() => setOpenDeleteModal(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          </svg>
        </button>
      </div>
      <Link href={`/form/${form.form_id}`}>
        <h5 className="mb-2 text-2xl text-center font-bold tracking-tight text-gray-900 hover:text-blue-800 hover:underline">
          {form.form_name}
        </h5>
      </Link>
      <h5 className="text-center">
        Last opened: {moment(form.lastOpened).fromNow()}
      </h5>
    </div>
  );
}
