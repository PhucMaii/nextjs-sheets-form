'use client';
import { FormType } from '@/app/utils/type';
import moment from 'moment/moment';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import IconButton from './IconButton';
import DeleteModal from './Modals/DeleteModal';

interface PropTypes {
  form: FormType;
  handleDelete: (id: number) => void;
}

export default function FormCard({ form, handleDelete }: PropTypes) {
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const router = useRouter();
  return (
    <div className="w-full relative flex flex-col gap-2 w-1/4 p-6 sm:p-2 rounded-2xl bg-white border border-gray-200 rounded-lg shadow">
      <DeleteModal
        isOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        handleDelete={() => handleDelete(form.formId)}
      />
      <div className="text-right">
        <IconButton
          icon={
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
          }
          backgroundColor="blue"
          className="hover:bg-blue-100"
          onClick={() => router.push(`/edit-form/${form.formId}`)}
        />
        <IconButton
          icon={
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
          }
          backgroundColor="red"
          className="hover:bg-red-100 text-red-500"
          onClick={() => setOpenDeleteModal(true)}
        />
      </div>
      <Link href={`/form/${form.formId}`}>
        <h5 className="mb-2 text-2xl text-center font-bold tracking-tight text-gray-900 hover:text-blue-800 hover:underline">
          {form.formName}
        </h5>
      </Link>
      <h5 className="text-center">
        Last opened: {moment(form.lastOpened).fromNow()}
      </h5>
    </div>
  );
}
