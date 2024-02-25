export const generateOrderTemplate = (
  clientName: string,
  clientNumber: string,
  orderDetails: any,
  phoneNumber: string,
  deliveryAddress: string,
) => {
  let orderDetailsTemplate = '';

  for (const key of Object.keys(orderDetails)) {
    if (key === 'sheetName' || key === 'row') {
      continue;
    }
    if (key === 'Order Date' || key === 'ORDER DATE') {
      orderDetailsTemplate += `<h4 style="text-align: left;">${key.toUpperCase()}: ${
        orderDetails[key]
      }</h4></br>`;
    } else {
      if (parseInt(orderDetails[key]) > 0) {
        orderDetailsTemplate += `<h4 style="text-align: left;">${orderDetails[key]} ${key}</h4>`;
      }
    }
  }
  return `
    <div style="margin: auto; width: 500px">
        <div style="width: 100%;">
            <h2 style="text-align: center;">TEST: Supreme Sprouts LTD</h2>
            <h4 style="text-align: center;font-weight: 300;">1-6420 Beresford Street, Burnaby, BC, V5E 1B3</h4>
            <div style="text-align: center;font-weight: 300;">
                778 789 1060
                <br/>
                709 789 6000
            </div>
        </div>
        <div style="height: 1px; background-color: black; width: 100%; margin: auto"></div>
        <div style="width: 100%;">
            <h3 style="text-align: left;font-weight: 300;">Client Name: ${clientName}</h3>
            <h3 style="text-align: left;font-weight: 300;">Client Number: ${clientNumber}</h3>
            <h3 style="text-align: left;">ORDER DETAILS</h3>
            ${orderDetailsTemplate}
            <h4 style="text-align: left;font-weight: 300;">DELIVERY ADDRESS: ${deliveryAddress}</h4>
            <h4 style="text-align: left;font-weight: 300;">CONTACT: ${phoneNumber}</h4>
        </div>
    </div>
    `;
};
