import { homeLat, homeLng, maxDistance } from '@/app/lib/constant';
import { calculateDistance } from '@/app/utils/googleMaps';

export const verifyDeliveryAddress = (lat: number, lng: number) => {
  if (lat === null || lng === null) {
    return false;
  }

  const distanceToHome = calculateDistance(lat, lng, homeLat, homeLng);

  if (distanceToHome > maxDistance) {
    return false;
  }

  return { ok: true, distance: distanceToHome };
};
