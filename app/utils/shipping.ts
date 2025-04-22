// export const calculateShippingFee = (distance: number, profit: number) => {
//   // distance in km
//   const gasPerLiter = 1.78;
//   const litersRatePer100km = 7; // ex: Gas rate per 100km is 7L;
//   const totalLiters = distance * litersRatePer100km / 100;

//   // const litersCost = (distance * gasRatePer100) / 100;

//   const gasCost = totalLiters * gasPerLiter;

//   const costToSalesRatio = gasCost / profit;

//   console.log({
//     gasCost,
//     costToSalesRatio,
//     shippingFee: profit * costToSalesRatio,
//     profit,
//   });

//   return profit * costToSalesRatio;
// };

export function calculateShippingFee(distance: number, revenue: number) {
  // Dynamic discount factor: higher profit reduces shipping cost
  // You can tweak this formula!
  let profitDiscountFactor = 1;
  if (revenue >= 100) {
    profitDiscountFactor = 0.8;  // 20% discount
  } else if (revenue >= 50) {
    profitDiscountFactor = 0.9;  // 10% discount
  } // else 1 (no discount)

  const costPerLiter = 1.8;
  const litersPer100km = 7; // ex: Gas rate per 100km is 7L;
  const totalLiters = distance * (litersPer100km / 100); // ex: Gas rate per 100km is 7L;

  const costPerKm = 0.8;
  
  const baseShipping = (costPerLiter * totalLiters) + (costPerKm * distance);
  const finalShippingCost = baseShipping * profitDiscountFactor;

  console.log({
    distance,
    baseShipping,
    totalLiters,
    profitDiscountFactor,
    finalShippingCost,
    revenue,
  })

  return parseFloat(finalShippingCost.toFixed(2));
}
