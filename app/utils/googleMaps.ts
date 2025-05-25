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

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  // Convert lat and lon from degrees to radians
  const toRadians = (degrees: number) => degrees * (Math.PI / 180);

  const R = 6371; // Radius of the earth in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  return distance;
};
