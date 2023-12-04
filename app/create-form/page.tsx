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
import NestedCheckbox from '../components/NestedCheckbox/NestedCheckbox';

export default function CreateForm() {
    const [disableInput, setDisableInput] = useState<boolean>(true); 
    const [disableInsertPosition, setDisableInsertPosition] = useState<boolean>(true); 
    const [disableAddForm, setDisableAddForm] = useState<boolean>(true);
    const [formName, setFormName] = useState<string>('');
    const [inputField, setInputField] = useState<InputField>({
        name: '',
        type: '',
        isChoose: true
    });
    const [inputFieldList, setInputFieldList] = useState<InputField[]>([]);
    const [insertPosition, setInsertPosition] = useState<InsertPosition>({
        sheetName: '',
        row: 1
    })
    const [insertPositionList, setInsertPositionList] = useState<InsertPosition[]>([]);
    const [notification, setNotification] = useState<Notification>({
        on: false,
        type: '',
        message: ''
    });
    const [selectAll, setSelectAll] = useState<boolean>(true);
    const [sheetNames, setSheetNames] = useState<any[]>([]);

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

    useEffect(() => {
        if(selectAll) {
            setInputFieldList((prevList) => {
                return prevList.map((input) => {
                    return {
                        ...input,
                        isChoose: true
                    }
                })
            })
        } else {
            setInputFieldList((prevList) => {
                return prevList.map((input) => {
                    return {
                        ...input,
                        isChoose: false
                    }
                })
            })
        }
    }, [selectAll])

    useEffect(() => {
        fetchSheetsName();
    }, [])

    const fetchSheetsName = async () => {
        try {
            const response = await fetch('/api/sheets', {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json'
                }
            })
            let data = await response.json();
            data = data.map((sheet: any) => {
                return {
                    value: sheet,
                    label: sheet
                }
            })
            console.log(data);
            setSheetNames(data);
        } catch(error) {
            console.log(error);
        } 
    }

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
            message: 'Added Input Successfully'
        })
    }

    const handleAddForm = async () => {
        try {
            const response = await fetch('/api/form', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({})
            })
        } catch(error) {
            console.log(error);
        }
    }

    const handleAddPosition = () => {
        if(insertPosition.sheetName === '' || insertPosition.row < 1) {
            setNotification({
                on: true,
                type: 'error',
                message: 'You are missing either sheet name or row field'
            })
            return;
        }
        const isInsertFieldInvalid = insertPositionList.some((pos) => {
            return pos.sheetName === insertPosition.sheetName && pos.row == insertPosition.row
        }) 
        if(isInsertFieldInvalid) {
            setNotification({
                on: true,
                type: 'error',
                message: `Sheet name ${insertPosition.sheetName} and row ${insertPosition.row} have already taken`
            })
            return;
        }
        const insertInputFields = inputFieldList.filter((input) => input.isChoose === true);
        const validPos = {
            ...insertPosition,
            inputFields: [...insertInputFields]
        }
        setInsertPositionList([...insertPositionList, validPos]);
        setInsertPosition({
            sheetName: '',
            row: 1
        })
        setNotification({
            on: true,
            type: 'success',
            message: 'Added Position Successfully'
        })
    }

    const handleToggleIsChoose = (id: number) => {
        setInputFieldList((prevList) => {
            return prevList.map((input, index) => {
                if(id === index) {
                    return {
                        ...input,
                        isChoose: !input.isChoose
                    }
                }   
                return input 
            })
        })
    }

    const handleRemoveInputField = (e: any, id: number ) => {
        e.preventDefault();
        const newInputFieldList = inputFieldList.filter((_, index) => index !== id);
        setInputFieldList(newInputFieldList);
    }

    const handleRemoveInsertPosition = (e: any, id: number ) => {
        e.preventDefault();
        const newInsertPositionList = insertPositionList.filter((_, index) => index !== id);
        setInsertPositionList(newInsertPositionList);
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
                                content={`Input Name: ${input.name}, Input type: ${input.type}`}
                                handleRemove={(e: any) => handleRemoveInputField(e, index)}
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
                {
                    insertPositionList.length > 0 && insertPositionList.map((insertPos, index) => {
                        return (
                            <Chip 
                                key={index}
                                content={`Sheet Name: ${insertPos.sheetName}, Row: ${insertPos.row}`}
                                handleRemove={(e: any) => handleRemoveInsertPosition(e, index)}
                            />
                        )
                    })
                }
                <Select 
                    disabled={disableInsertPosition}
                    description="Choose a sheet name"
                    label="Sheet Name"
                    value={insertPosition.sheetName}
                    onChange={(e) => setInsertPosition({...insertPosition, sheetName: e.target.value})}
                    values={sheetNames}
                />
                <Input 
                    disabled={disableInsertPosition}
                    label="Row"
                    onChange={(e: any) => {
                        if(insertPosition.row >= 0) {
                            if(+e.target.value === 0) {
                                return;
                            }
                            setInsertPosition({...insertPosition, row: +e.target.value})
                        }
                    }}
                    type="number"
                    placeholder="Enter row number"
                    value={insertPosition.row}
                />
                <div>
                    <h2 className="text-lg font-medium mb-4">Select fields to insert position</h2>
                    <NestedCheckbox 
                        disabled={disableInsertPosition}
                        checkboxList={inputFieldList}
                        handleToggleCheckbox={handleToggleIsChoose}
                        toggleAll={selectAll}
                        handleToggleAll={setSelectAll}
                    />
                </div>
                <Button 
                    color="blue"
                    disabled={disableInsertPosition}
                    label="Add Position"
                    onClick={handleAddPosition}
                    width="full"
                />
            </div>
            <div className="flex justify-center mx-80">
                <Button 
                    disabled={disableAddForm}
                    color="green"
                    label="Add Form"
                    onClick={handleAddForm}
                    width="full"
                    className="my-8"
                />
            </div>
        </div>
  )
}
