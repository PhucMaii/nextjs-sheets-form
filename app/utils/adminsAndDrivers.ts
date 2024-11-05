import { fetchApi } from './db';
import { API_URL } from './enum';

export const getAdminsAndDrivers = async (showNotification: any) => {
  try {
    const admins = await fetchApi(`${API_URL.ADMIN}/admins`, showNotification);

    const drivers = await fetchApi(
      `${API_URL.ADMIN}/drivers`,
      showNotification,
    );

    return [
      ...admins.map((admin: any) => `Admin - ${admin.clientName}`),
      ...drivers.map((driver: any) => `Driver - ${driver.name}`),
    ];
  } catch (error: any) {
    console.log('There was an error: ', error);
    showNotification(
      'error',
      'There was an error: ' + error.response.data.error,
    );
  }
};
