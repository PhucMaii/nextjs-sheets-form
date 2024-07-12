const googleMapsBaseUrl = 'https://www.google.com/maps/dir/?api=1';
const googleMapsAppBaseUrl = 'http://maps.apple.com/?daddr=San+Francisco';

const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error: any) => reject(error),
      );
    } else {
      reject(new Error('Geolocation is not supported by this browser'));
    }
  });
};

// export const getGoogleMapsUrl = async (
//   destinationLat: number,
//   destinationLng: number,
// ) => {
//   const currentLocation: any = await getCurrentLocation();
//   return `${googleMapsUrl}&origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${destinationLat},${destinationLng}`;
// };

export const getGoogleMapsUrl = async (
  destinationLat: number,
  destinationLng: number,
) => {
  const currentLocation: any = await getCurrentLocation();
  const origin = `${currentLocation.latitude},${currentLocation.longitude}`;
  const destination = `${destinationLat},${destinationLng}`;

  const webUrl = `${googleMapsBaseUrl}&${origin}&destination=${destination}`;
  const appUrl = `${googleMapsAppBaseUrl}${destination}&saddr=${origin}`;

  return { webUrl, appUrl };
};
