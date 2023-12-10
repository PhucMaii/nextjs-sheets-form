import { customStyles } from '@/app/utils/styles';
import React from 'react';
import Modal from 'react-modal';
import Input from '../Input/Input';
import Button from '../Button/Button';
import Select from '../Select/Select';

interface PropTypes {
    isOpen: boolean
    onClose: () => void 
    type: string,
    value: string,
    values: any,
    onChange: (e: any) => void,
}
Modal.setAppElement('#root');
export default function EditSheetName({ 
  isOpen, 
  onClose, 
  onChange,
  type, 
  value, 
  values, 
}: PropTypes) {
  return (
    <Modal 
        isOpen={isOpen} 
        onRequestClose={onClose} 
        style={customStyles}
    >
      <h1 className="font-bold text-center text-lg mb-4">Edit Sheet Name</h1>
      <Select 
        description="Change Sheet Name"
        label="Sheet Name"
        onChange={onChange}
        values={values}
        value={value}
      /> 
      <Button 
        label="Save"
        color="blue"
        onClick={onClose}
        width="full"
      />
    </Modal>
  )
}
