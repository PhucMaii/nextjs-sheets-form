import { customStyles } from '@/app/utils/styles';
import React from 'react';
import Modal from 'react-modal';
import Input from '../Input/Input';
import Button from '../Button/Button';

interface PropTypes {
    isOpen: boolean
    onClose: () => void 
    value: number,
    onChange: (e: any) => void,
}

export default function EditRow({
    isOpen,
    onClose,
    value,
    onChange
} : PropTypes) {
    return (
        <Modal 
        isOpen={isOpen} 
        onRequestClose={onClose} 
        style={customStyles}
    >
      <h1 className="font-bold text-center text-lg mb-4">Edit Start Row</h1>
      <Input<number> 
        label="Row"
        onChange={onChange}
        value={value}
        type="number"
        placeholder="Enter row"
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