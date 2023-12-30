import { customStyles } from '@/app/utils/styles';
import React from 'react';
import Modal from 'react-modal';

interface PropTypes {
  isOpen: boolean;
  onClose: () => void;
  handleAddPos: () => void;
}

export default function AddPosition({
  isOpen,
  onClose,
  handleAddPos,
}: PropTypes) {
  return (
    <Modal isOpen={isOpen} style={customStyles}>
      <div>Add Position</div>
      <button onClick={onClose}>Close</button>
      <button onClick={handleAddPos}>Add</button>
    </Modal>
  );
}
