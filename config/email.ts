export const generateOrderTemplate = (
  clientName: string,
  clientNumber: string,
  // orderDetails: any,
  order: any,
  phoneNumber: string,
  deliveryAddress: string,
  orderId: number,
  flag?: string,
) => {
  let orderDetailsTemplate = '';
  // let total = 0;

  const flagText = flag
    ? `<h2 style="text-align: center; font-weight: 300">${flag}</h2>`
    : '';

  for (const item of order?.items as any[]) {
    if (item.quantity === 0) continue;
    const totalPrice = item.price * item.quantity;
    if (item?.isShowDiscount && item?.prevPrice) {
      orderDetailsTemplate += `
      <tr>
      <td style="padding: 8px">${item?.name}</td>
      <td style="padding: 8px; text-align: center">${item?.quantity}</td>
      <td style="padding: 8px; text-align: center">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 1px">
          <h4 style="text-decoration: line-through">$${item.prevPrice.toFixed(2)}</h4>
          <br />
          <h4>$${item.price.toFixed(2)}</h4>
        </div>
      </td>
      <td style="padding: 8px; text-align: center; display: flex; flex-direction: column; align-items: center;">
          <h4>$${totalPrice.toFixed(2)}</h4>
      </td>
      </tr>
        `;
    } else {
      orderDetailsTemplate += `
        <tr>
        <td style="padding: 8px">${item?.name}</td>
        <td style="padding: 8px; text-align: center">${item?.quantity}</td>
        <td style="padding: 8px; text-align: center">
          $${item.price.toFixed(2)}
        </td>
        <td style="padding: 8px; text-align: center">$${totalPrice.toFixed(2)}</td>
        </tr>
          `;
    }
  }

  return `
    <div style="margin: auto; width: 500px">
        <div style="width: 100%;">
        ${flagText}
            <h2 style="text-align: center; font-weight: 300">Supreme Sprouts LTD</h2>
            <h4 style="text-align: center;font-weight: 300;">1-6420 Beresford Street, Burnaby, BC, V5E 1B3</h4>
            <div style="text-align: center;font-weight: 300;">
                778 789 1060
                <br/>
                709 989 6000
            </div>
        </div>
        <div style="height: 1px; background-color: black; width: 100%; margin: auto"></div>
        <div style="width: 100%;">
            <h3 style="text-align: left;font-weight: 300;">Invoice: ${orderId}</h3>
            <h3 style="text-align: left;font-weight: 300;">Client Name: ${clientName}</h3>
            <h3 style="text-align: left;font-weight: 300;">Client Number: ${clientNumber}</h3>
            <h3 style="text-align: left;font-weight: 300;">Order Time: ${
              order?.orderTime
            }</h3>
            <h3 style="text-align: left;font-weight: 300;">Delivery Date: ${
              order?.deliveryDate
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
            <h4 style="text-align: right;font-weight: 300;">Discount: -$${order?.discount?.toFixed(2)}</h4>
            <h4 style="text-align: right;font-weight: 300;">Subtotal: $${order?.subTotal?.toFixed(2) || order?.totalPrice?.toFixed(2) || 0}</h4>
            <h4 style="text-align: right;font-weight: 300;">GST: $${order?.GST?.toFixed(
              2,
            )}</h4>
            <h4 style="text-align: right;font-weight: 300;">PST: $${order?.PST?.toFixed(
              2,
            )}</h4>
            <h4 style="text-align: right;font-weight: 300;">Total: $${order?.totalPrice?.toFixed(
              2,
            )}</h4>
            <h4 style="text-align: left;font-weight: 300;">DELIVERY ADDRESS: ${deliveryAddress}</h4>
            <h4 style="text-align: left;font-weight: 300;">CONTACT: ${phoneNumber}</h4>
            <div style="height: 1px; background-color: black; width: 100%; margin: auto"></div>
            <h4 style="text-align: left;font-weight: 300;">NOTE: ${order?.note}</h4>
            <div style="height: 1px; background-color: black; width: 100%; margin: auto"></div>
            <h4 style="text-align: right;font-weight: 300;">Order by: ${order?.createdBy}</h4>
        </div>
    </div>
    `;
};

export const signUpRequest = (newClient: {
  name: string;
  email: string;
  contactNumber: string;
  deliveryAddress: string;
  message: string;
}) => {
  return `
    <div>
      <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 10px">
        <h4 style="font-weight: 100;">Name:</h4>
        <h4 style="font-weight: 300;">${newClient.name}</h4>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 10px">
        <h4 style="font-weight: 100;">Email:</h4>
        <h4 style="font-weight: 300;">${newClient.email}</h4>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 10px">
        <h4 style="font-weight: 100;">Contact Number:</h4>
        <h4 style="font-weight: 300;">${newClient.contactNumber}</h4>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 10px">
        <h4 style="font-weight: 100;">Delivery Address:</h4>
        <h4 style="font-weight: 300;">${newClient.deliveryAddress}</h4>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 10px">
        <h4 style="font-weight: 100;">Message:</h4>
        <h4 style="font-weight: 300;">${newClient.message}</h4>
      </div>
    </div>
  `;
};