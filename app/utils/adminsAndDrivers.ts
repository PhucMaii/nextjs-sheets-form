import { fetchApi } from './db';
import { getAdminApiUrl } from './enum';

export const getAdminsAndDrivers = async (
  companyId: string,
  showNotification?: any,
) => {
  try {
    const adminsAndDrivers = await fetchApi(
      getAdminApiUrl(companyId, '/adminsAndDrivers'),
      showNotification,
    );

    return adminsAndDrivers;
  } catch (error: any) {
    console.log('There was an error: ', error);
    showNotification(
      'error',
      'There was an error: ' + error.response.data.error,
    );
  }
};
