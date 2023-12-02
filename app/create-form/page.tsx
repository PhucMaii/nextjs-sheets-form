'use client';
import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar/Navbar'
import Input from '../components/Input/Input'
import Divider from '../components/Divider/Divider';
import Select from '../components/Select/Select';
import { InputField, InsertPosition, Notification } from './type';
import Button from '../components/Button/Button';
import Snackbar from '../components/Snackbar/Snackbar';
import Chip from '../components/Chip/Chip';

export default function CreateForm() {
    const [formName, setFormName] = useState<string>('');
    const [inputField, setInputField] = useState<InputField>({
        name: '',
        type: '',
        isChoose: true
    });
    const [inputFieldList, setInputFieldList] = useState<InputField[]>([]);
    const [insertPosition, setInsertPosition] = useState<InsertPosition>({
        sheetName: '',
        row: 0
    })
    const [insertPositionList, setInsertPositionList] = useState<InsertPosition[]>([]);
    const [notification, setNotification] = useState<Notification>({
        on: false,
        type: '',
        message: ''
    });
    const [disableInput, setDisableInput] = useState<boolean>(true); 
    const [disableInsertPosition, setDisableInsertPosition] = useState<boolean>(true); 
    const [disableAddForm, setDisableAddForm] = useState<boolean>(true);

    useEffect(() => {
        if(formName.length > 0) {
            setDisableInput(false);
        } else {
            setDisableInput(true);
            setDisableInsertPosition(true)
            setDisableAddForm(true);
        }
    }, [formName])

    useEffect(() => {
        if(inputFieldList.length > 0) {
            setDisableInsertPosition(false);
        } else {
            setDisableInsertPosition(true);
            setDisableAddForm(true);
        }
    }, [inputFieldList])

    useEffect(() => {
        if(insertPositionList.length > 0) {
            setDisableAddForm(false);
        } else {
            setDisableAddForm(true);
        }
    }, [insertPositionList])

    const handleAddInputField = () => {
        if(!inputField.name || !inputField.type) {
            setNotification({
                on: true,
                type: 'error',
                message: 'You are missing either input name or input type'
            })
            return;
        }
        const isInputFieldInvalid = inputFieldList.some((input) => input.name === inputField.name);
        if(isInputFieldInvalid) {
            setNotification({
                on: true,
                type: 'error',
                message: `Name ${inputField.name} is already taken`
            })
            return;
        }
        setInputFieldList([...inputFieldList, inputField]); 
        setInputField({
            name: '',
            type: '',
            isChoose: true
        })       
        setNotification({
            on: true,
            type: 'success',
            message: 'Added input successfully'
        })
    }

    const handleRemoveSheet = (e: any, id: number ) => {
        e.preventDefault();
        const newInputFieldList = inputFieldList.filter((_, index) => index !== id);
        setInputFieldList(newInputFieldList);
      }
    return (
        <div>
            <Snackbar 
                open={notification.on}
                onClose={() => setNotification({...notification, on: false})}
                type={notification.type}
                message={notification.message}
            />
            <Navbar isLogin={true}/>
            <h2 className="mb-4 text-4xl text-center text-blue-600 font-bold">Create Form</h2>
            <div className="mx-80 my-4">
                <Input 
                    label="Form Name"
                    onChange={(e: any) => {setFormName(e.target.value)}}
                    type="text"
                    placeholder="Enter form name"
                    value={formName}
                />
            </div>
            <Divider label="Inputs" />
            <div className="mx-80 my-4">
                {
                    inputFieldList.length > 0 && inputFieldList.map((input, index) => {
                        return (
                            <Chip 
                                key={index}
                                content={`Input Name: ${input.name}, Inputt ${input.type}`}
                                handleRemove={(e: any) => handleRemoveSheet(e, index)}
                            />
                        )
                    })
                }
                <Input 
                    disabled={disableInput}
                    label="Input Name (Label)"
                    onChange={(e: any) => {setInputField({...inputField, name: e.target.value})}}
                    type="text"
                    placeholder="Enter input name"
                    value={inputField.name}
                />
                <Select 
                    disabled={disableInput}
                    description="Choose a data type"
                    label="Input Type"
                    value={inputField.type}
                    onChange={(e) => setInputField({...inputField, type: e.target.value})}
                    values={[
                        {
                            label: "Text",
                            value: "text"
                        },
                        {
                            label: "Number",
                            value: "number"
                        }
                    ]}
                />
                <Button 
                    color="blue"
                    label="Add Input"
                    onClick={handleAddInputField}
                    width="full"
                    disabled={disableInput}
                />
            </div>
            <Divider label="Insert Position" />
            <div className="mx-80 my-4">
                <Input 
                    disabled={disableInsertPosition}
                    label="Sheet Name"
                    onChange={(e: any) => {setInsertPosition({...insertPosition, sheetName: e.target.value})}}
                    type="text"
                    placeholder="Enter sheet name"
                    value={insertPosition.sheetName}
                />
                <Input 
                    disabled={disableInsertPosition}
                    label="Row"
                    onChange={(e: any) => {setInsertPosition({...insertPosition, row: +e.target.value})}}
                    type="number"
                    placeholder="Enter row number"
                    value={insertPosition.row}
                />
                <div>
                    <h2 className="text-lg font-medium mb-4">Select fields to insert position</h2>
                    <div className="flex items-center mb-4">
                        <input 
                            disabled={disableInsertPosition}
                            id="default-checkbox" 
                            type="checkbox" 
                            className="w-4 h-4 text-blue-600 bg-white-100 border-black-300 rounded focus:ring-blue-500 focus:ring-2" 
                        />
                        <label 
                            htmlFor="default-checkbox" 
                            className="ms-2 text-sm font-medium"
                        >
                            Input Name
                        </label>
                    </div>
                    <div className="flex items-center ml-4 mb-4">
                        <input 
                            disabled={disableInsertPosition}
                            id="default-checkbox" 
                            type="checkbox" 
                            className="w-4 h-4 text-blue-600 bg-white-100 border-black-300 rounded focus:ring-blue-500 focus:ring-2" 
                        />
                        <label 
                            htmlFor="default-checkbox" 
                            className="ms-2 text-sm font-medium"
                        >
                            Input Name
                        </label>
                    </div>
                </div>
                <Button 
                    color="blue"
                    disabled={disableInsertPosition}
                    label="Add Position"
                    onClick={() => {}}
                    width="full"
                />
            </div>
            <div className="flex justify-center mx-80">
                <Button 
                    disabled={disableAddForm}
                    color="green"
                    label="Add Form"
                    onClick={() => {}}
                    width="full"
                    className="my-8"
                />
            </div>
        </div>
  )
}
