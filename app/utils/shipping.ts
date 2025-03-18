export const calculateShippingFee = (distance: number, profit: number) => {
  // distance in km
  const gasPerLiter = 1.78;
  const gasRatePer100 = 10;

  const litersCost = (distance * gasRatePer100) / 100;

  const shippingCost = litersCost * gasPerLiter;

  const costToSalesRatio = shippingCost / profit;

  console.log({
    shippingCost,
    costToSalesRatio,
    shippingFee: profit * costToSalesRatio,
    profit,
  });

  return profit * costToSalesRatio;
};
