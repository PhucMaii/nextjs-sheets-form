export const generateOrderTemplate = (
  clientName: string,
  clientNumber: string,
  orderDetails: any,
  phoneNumber: string,
  deliveryAddress: string,
  orderId: number,
) => {
  let orderDetailsTemplate = '';
  let total = 0;

  for (const key of Object.keys(orderDetails)) {
    console.log(orderDetails[key], key);
    if (key !== 'DELIVERY DATE' && key !== 'orderTime' && key !== 'NOTE') {
      total += orderDetails[key].totalPrice;
      orderDetailsTemplate += `
        <tr>
          <td style="padding: 8px">${key}</td>
          <td style="padding: 8px; text-align: center">${
            orderDetails[key].quantity
          }</td>
          <td style="padding: 8px; text-align: center">$${orderDetails[
            key
          ].price.toFixed(2)}</td>
          <td style="padding: 8px; text-align: center">$${orderDetails[
            key
          ].totalPrice.toFixed(2)}</td>
        </tr>
      `;
    }
  }
  return `
    <div style="margin: auto; width: 500px">
        <div style="width: 100%;">
            <h2 style="text-align: center; font-weight: 300">Supreme Sprouts LTD</h2>
            <h4 style="text-align: center;font-weight: 300;">1-6420 Beresford Street, Burnaby, BC, V5E 1B3</h4>
            <div style="text-align: center;font-weight: 300;">
                778 789 1060
                <br/>
                709 789 6000
            </div>
        </div>
        <div style="height: 1px; background-color: black; width: 100%; margin: auto"></div>
        <div style="width: 100%;">
            <h3 style="text-align: left;font-weight: 300;">Order Id: #${orderId}</h3>
            <h3 style="text-align: left;font-weight: 300;">Client Name: ${clientName}</h3>
            <h3 style="text-align: left;font-weight: 300;">Client Number: #${clientNumber}</h3>
            <h3 style="text-align: left;font-weight: 300;">Order Time: ${orderDetails.orderTime}</h3>
            <h3 style="text-align: left;font-weight: 300;">Delivery Date: ${
              orderDetails['DELIVERY DATE']
            }</h3>
            <h3 style="text-align: left;">ORDER DETAILS</h3>
            <table style="width: 100%"; border-collapse: collapse;>
              <thead>
                <tr>
                  <th style="padding: 8px; border: 1px solid #000 font-weight: bold">Item</th>
                  <th style="padding: 8px; border: 1px solid #000 font-weight: bold">Quantity</th>
                  <th style="padding: 8px; border: 1px solid #000 font-weight: bold">Unit Price</th>
                  <th style="padding: 8px; border: 1px solid #000 font-weight: bold">Total Price</th>
                </tr>
              </thead>
              <tbody>
                ${orderDetailsTemplate}
              </tbody>
            </table>
            <div style="height: 1px; background-color: black; width: 100%; margin: auto"></div>
            <h4 style="text-align: right;font-weight: 300;">Total: $${total.toFixed(
              2,
            )}</h4>
            <h4 style="text-align: left;font-weight: 300;">DELIVERY ADDRESS: ${deliveryAddress}</h4>
            <h4 style="text-align: left;font-weight: 300;">CONTACT: ${phoneNumber}</h4>
            <div style="height: 1px; background-color: black; width: 100%; margin: auto"></div>
            <h4 style="text-align: left;font-weight: 300;">NOTE</h4>
            <h4 style="text-align: left;font-weight: 300;">${
              orderDetails.NOTE
            }</h4>
        </div>
    </div>
    `;
};
