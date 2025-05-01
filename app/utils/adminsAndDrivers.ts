import { fetchApi } from './db';
import { API_URL } from './enum';

export const getAdminsAndDrivers = async (showNotification?: any) => {
  try {
    const adminsAndDrivers = await fetchApi(`${API_URL.ADMIN}/adminsAndDrivers`, showNotification);

    return adminsAndDrivers;
  } catch (error: any) {
    console.log('There was an error: ', error);
    showNotification(
      'error',
      'There was an error: ' + error.response.data.error,
    );
  }
};