import { customStyles } from '@/app/utils/styles';
import React from 'react';
import Modal from 'react-modal'
import Input from '../Input/Input';
import Select from '../Select/Select';
import Button from '../Button/Button';

interface PropTypes {
    isOpen: boolean
    onClose: () => void 
    inputName: string,
    inputType: string,
    placeholder?: string,
    setInputName: (e: any) => void,
    setInputType: (e: any) => void,
    handleSubmit: () => void,
    title: string
}
Modal.setAppElement('#root');
export default function EditInputModal({
    isOpen,
    onClose,
    inputName,
    inputType,
    placeholder,
    setInputName,
    setInputType,
    handleSubmit,
    title
}: PropTypes) {
  return (
    <Modal
        isOpen={isOpen}
        style={customStyles}
        onRequestClose={onClose}
    >
        <h1 className="font-bold text-center text-lg mb-4">{title}</h1>
        <Input<string> 
            label="Input Name"
            onChange={setInputName}
            placeholder={placeholder ? placeholder : ''}
            value={inputName}
            type="text"
        />
        <Select
          description="Choose a data type"
          label="Input Type"
          value={inputType}
          onChange={setInputType}
          values={[
            {
              label: 'Text',
              value: 'text',
            },
            {
              label: 'Number',
              value: 'number',
            },
          ]}
        />
        <Button 
            label="Save"
            color="blue"
            onClick={() => {
                handleSubmit(); 
                onClose()
            }}
            width="full"
        />
    </Modal>
  )
}
