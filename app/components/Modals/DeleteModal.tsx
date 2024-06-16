import Modal from 'react-modal';
import IconButton from '../IconButton';
import { useState } from 'react';
import { modalStyles } from './styles';
import { Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';

interface PropTypes {
  isOpen: boolean;
  onClose: () => void;
  handleDelete: any;
}

export default function DeleteModal({
  isOpen,
  onClose,
  handleDelete,
}: PropTypes) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleClick = async () => {
    setIsLoading(true);
    await handleDelete();
    setIsLoading(false);
  };
  return (
    <Modal isOpen={isOpen} style={modalStyles}>
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
            <div
              className="flex gap-2 items-center justify-center"
              style={{ color: 'white !important' }}
            >
              <LoadingButton
                variant="contained"
                color="error"
                onClick={handleClick}
                loading={isLoading}
              >
                Yes I'm sure
              </LoadingButton>
              <Button onClick={onClose} color="inherit" variant="outlined">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
