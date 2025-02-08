export const calculateShippingFee = (distance: number) => {
  // distance in km
  const gasPerLiter = 1.78;
  const gasRatePer100 = 10;

  const litersCost = (distance * gasRatePer100) / 100;

  return litersCost * gasPerLiter;
};
