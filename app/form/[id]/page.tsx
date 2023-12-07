'use client';
import Button from '@/app/components/Button/Button';
import Input from '@/app/components/Input/Input';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import Navbar from '@/app/components/Navbar/Navbar';
import Snackbar from '@/app/components/Snackbar/Snackbar';
import { Notification } from '@/app/utils/type';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface Input {
  input_id: number,
  input_name: string,
  input_type: string
}

interface InputValues {
  [key: string] : string | number
}

interface Position {
  form_id: number,
  position_id: number,
  sheet_name: string,
  row: number,
  inputs: Input[]
}

export default function Form() {
  const [formData, setFormData] = useState<any>({});
  const [inputList, setInputList] = useState<Input[]>([]);
  const [inputValues, setInputValues] = useState<InputValues>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(true);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: '',
    message: ''
  });
  const [positionList, setPositionList] = useState<Position[]>([]);
  const { id } : any = useParams();
  const { data: session, status}: any = useSession();
  const router = useRouter();

  useEffect(() => {
    if(status === 'authenticated'){
      fetchForm();
    }
  }, [status])

  const fetchForm = async () => {
    try {
      const response = await fetch(`/api/form/?id=${id}`, {
        method: 'GET',
        headers: {
          'Content-type': 'application/json'
        }
      })
      if (!response.ok) {
        console.error(`Error fetching data. Status: ${response.status}`);
        throw new Error('Failed to fetch data');
      }
      const comingData = await response.json();
      const data = comingData.data;
      if(parseInt(session?.user?.id as string) !== data.user_id) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }
      getMostInputsPosition(data);
      setPositionList(data.positions);
      setFormData(data);
      setIsLoading(false);
    } catch(error) {
      console.log(error);
    }
  }

  const getMostInputsPosition = (data: any) => {
    const positionList = data.positions;
    let posIndex = 0;
    let longestInputList = positionList[0].inputs.length;
    for(let i = 1; i < positionList.length; i++) {
      if(positionList[i].inputs.length > longestInputList) {
        longestInputList = positionList[i].inputs.length;
        posIndex = i;
      }
    }
    const newInputList = data.positions[posIndex].inputs;
    createInputValues(newInputList);
    setInputList(newInputList);
  }

  const createInputValues = (inputs: Input[]) => {
    const newInputValues: InputValues = {};
    for(let input of inputs) {
      if(input.input_type === 'text') {
        newInputValues[input.input_name] = '';
      } else {
        newInputValues[input.input_name] = 0;
      }
    }
    console.log(newInputValues, "new input values");
    setInputValues(newInputValues);
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const submitForm = positionList.map((pos) => {
        const validInputs: InputValues = {};
        for(let input of pos.inputs) {
          validInputs[input.input_name] = inputValues[input.input_name];
        }
        // const validInputs = pos.inputs.map((input) => ({[input.input_name]: inputValues[input.input_name]}));
        return {
          sheetName: pos.sheet_name,
          row: pos.row,
          ...validInputs
        }
      })
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(submitForm)
      });
      const res = await response.json();
      setNotification({
        on: true,
        type: 'success',
        message: res.message
      })
    } catch(error) {
      console.log(error);
    }
  }

  if(isLoading || status === 'loading') {
    return (
      <div className="flex flex-col gap-8 items-center mt-8">
        <LoadingComponent color="blue"/>
        <h2 className="font-bold text-lg">Loading...</h2>
      </div>
    )
  }

  if(!isAuthorized) {
    return (
      <div className="bg-red-100 p-20 w-full h-full flex flex-col justify-center items-center gap-8">
        <h1 className="text-2xl text-red-800 font-bold text-center">Sorry You Do Not Have Access To This Page</h1>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
          <path className="text-red-600" strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <Button 
          color="blue"
          label="Back Home"
          onClick={() => router.push('/')}
          width="auto"
        />
      </div>
    )
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
      <div className="max-w-2xl mx-auto py-16">
        <h4 className="text-center font-bold text-2xl text-blue-600 px-8">{formData.form_name}</h4>
        <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          {
            inputList.length > 0 && inputList.map((input, index) => {
              return <Input 
                        key={index} 
                        label={input.input_name}
                        type={input.input_type}
                        value={inputValues[input.input_name]}
                        onChange={(e: any) => {
                          setInputValues((prevInputValues) => {
                            if(e.target.type === 'text') {
                              return {
                                ...prevInputValues,
                                [input.input_name]: e.target.value
                              }
                            } else {
                              return {
                                ...prevInputValues,
                                [input.input_name]: +e.target.value
                              }
                            }
                          })
                        }}
                        placeholder={`Enter ${input.input_name} here...`}
                      />
            })
          }
          <Button 
            color="blue"
            label="Submit"
            onClick={handleSubmit}
            width="full"
            loadingButton
          />
        </form>
      </div>
    </div>
  )
}
