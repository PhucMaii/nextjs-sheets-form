import { Dispatch, SetStateAction } from 'react';
import { Notification } from './type';
import axios from 'axios';

export const fetchData = async (
  api: string,
  setNotification: Dispatch<SetStateAction<Notification>>,
) => {
    try {
        const response = await axios.get(api);

        if (response.data.error) {
            setNotification({
                on: true,
                type: 'error',
                message: response.data.error
            });
        }

        return response.data.data;
    } catch (error: any) {
        console.log('There was an error: ', error);
        setNotification({
            on: true,
            type: 'error',
            message: 'There was an error: ' + error.response.data.error
        })
    }
};
