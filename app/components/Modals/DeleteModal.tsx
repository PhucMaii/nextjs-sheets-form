import { customStyles } from '@/app/utils/styles';
import Modal from 'react-modal';
import IconButton from '../IconButton/IconButton';

interface PropTypes {
  isOpen: boolean;
  onClose: () => void;
  handleDelete: () => void;
}

export default function DeleteModal({
  isOpen,
  onClose,
  handleDelete,
}: PropTypes) {
  return (
    <Modal isOpen={isOpen} style={customStyles}>
      <div className="relative p-4 w-full max-w-md max-h-full">
        <div className="relative bg-white rounded-lg">
          <IconButton
            icon={
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
            }
            backgroundColor="gray"
            onClick={onClose}
            className="absolute top-1 right-2.5 text-center"
          />
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
              Are you sure you want to delete?
            </h3>
            <button
              onClick={() => {
                handleDelete();
                onClose();
              }}
              data-modal-hide="popup-modal"
              type="button"
              className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center me-2"
            >
              Yes, I&apos;m sure
            </button>
            <button
              onClick={onClose}
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
  );
}
