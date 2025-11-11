import { generateOrderTotalPrice } from '@/app/utils/orders';

export const LouisFooter = `
    <p>
      <strong>Louis Le</strong><br />
      Supreme Sprouts Ltd.<br />
      1-6420 Beresford Street, Burnaby, BC, V5E 1B3<br />
      Contact: 778-789-1060 | 709-989-6000<br />
      Website: <a href="https://supremesprouts.com">supremesprouts.com</a>
    </p>
`;

export const TimFooter = `
    <p>
      <strong>Tim Le</strong><br />
      Supreme Sprouts Ltd.<br />
      1-6420 Beresford Street, Burnaby, BC, V5E 1B3<br />
      Contact: 778-789-1060 | 709-989-6000<br />
      Website: <a href="https://supremesprouts.com">supremesprouts.com</a>
    </p>
`;

export const generateOrderTemplate = (
  clientName: string,
  clientNumber: string,
  order: any,
  phoneNumber: string,
  deliveryAddress: string,
  orderId: number,
  flag?: string,
) => {
  const total = generateOrderTotalPrice(order.items, order?.shippingFee);

  let orderDetailsTemplate = '';

  const flagText = flag
    ? `<h2 style="text-align: center; font-weight: 300;">${flag}</h2>`
    : '';

  for (const item of order?.items || []) {
    if (item.quantity === 0) continue;

    const optionText = item?.option?.name ? ` - ${item.option.name}` : '';
    const totalPrice = item.price * item.quantity;

    const hasDiscount = item?.isShowDiscount && item?.prevPrice;

    orderDetailsTemplate += `
      <tr>
        <td style="padding: 8px; border: 1px solid #ccc;">
          <div>
            <strong>${item.name}${optionText}</strong>
          </div>
        </td>
        <td style="padding: 8px; text-align: center; border: 1px solid #ccc;">
          ${item.quantity}
        </td>
        <td style="padding: 8px; text-align: center; border: 1px solid #ccc;">
          ${
            hasDiscount
              ? `<div><span style="text-decoration: line-through; color: #888;">$${item.prevPrice.toFixed(
                  2,
                )}</span><br/><span>$${item.price.toFixed(2)}</span></div>`
              : `$${item.price.toFixed(2)}`
          }
        </td>
        <td style="padding: 8px; text-align: center; border: 1px solid #ccc;">
          $${totalPrice.toFixed(2)}
        </td>
      </tr>
    `;
  }

  return `
    <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; color: #333;">
      ${flagText}
      <h2 style="text-align: center; font-weight: 300;">Supreme Sprouts LTD</h2>
      <p style="text-align: center; margin: 0;">1-6420 Beresford Street, Burnaby, BC, V5E 1B3</p>
      <p style="text-align: center;">778-789-1060 | 709-989-6000</p>
      
      <hr />

      <p><strong>Invoice:</strong> ${orderId}</p>
      <p><strong>Client Name:</strong> ${clientName}</p>
      <p><strong>Client Number:</strong> ${clientNumber}</p>
      <p><strong>Order Time:</strong> ${order?.orderTime}</p>
      <p><strong>Delivery Date:</strong> ${order?.deliveryDate}</p>

      <h3 style="margin-top: 20px;">Order Details</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr>
            <th style="padding: 8px; border: 1px solid #000;">Item</th>
            <th style="padding: 8px; border: 1px solid #000;">Quantity</th>
            <th style="padding: 8px; border: 1px solid #000;">Unit Price</th>
            <th style="padding: 8px; border: 1px solid #000;">Total Price</th>
          </tr>
        </thead>
        <tbody>
          ${orderDetailsTemplate}
        </tbody>
      </table>

      <hr style="margin: 20px 0;" />

      ${
        total?.discount && total?.discount > 0
          ? `<p style="text-align: right;">Discount: -$${total?.discount?.toFixed(2) || '0.00'}</p>`
          : ''
      }
      <p style="text-align: right;">Subtotal: $${total?.subTotal?.toFixed(2) || '0.00'}</p>
      <p style="text-align: right;">GST: $${total?.GST?.toFixed(2) || '0.00'}</p>
      <p style="text-align: right;">PST: $${total?.PST?.toFixed(2) || '0.00'}</p>
      <p style="text-align: right;"><strong>Total: $${total?.totalPrice?.toFixed(2)}</strong></p>

      <p><strong>Delivery Address:</strong> ${deliveryAddress}</p>
      <p><strong>Contact:</strong> ${phoneNumber}</p>
      
      ${order?.note ? `<hr /><p><strong>Note:</strong> ${order.note}</p>` : ''}

      <p style="text-align: right;">Order by: ${order?.createdBy}</p>
      ${order?.updatedBy ? `<p style="text-align: right;">Updated by: ${order?.updatedBy}</p>` : ''}
    </div>
  `;
};

export const generatePurchaseOrderTemplate = (vendor: any, po: any) => {
  let poItemsTemplate = '';

  for (const item of po.poItems) {
    poItemsTemplate += `
        <tr>
          <td style="border: 1px solid #ccc; padding: 8px 12px;">${item.inventoryItem.name}</td>
          <td style="border: 1px solid #ccc; padding: 8px 12px;">${item.orderedQty}</td>
          <td style="border: 1px solid #ccc; padding: 8px 12px;">${item?.note || ''}</td>
        </tr>
      `;
  }

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h3 style="margin-top: 20px;">Purchase Order Details</h3>
    <p>
      <strong>PO Number:</strong> #${po.poNumber}<br />
      <strong>Expected Arrival Date:</strong> ${po.estArrival}<br />
      <strong>Note:</strong> ${po.note}<br />
      
    </p>

    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
      <thead>
        <tr>
          <th style="border: 1px solid #ccc; padding: 8px 12px; background-color: #f2f2f2; text-align: left;">Item Name</th>
          <th style="border: 1px solid #ccc; padding: 8px 12px; background-color: #f2f2f2; text-align: left;">Quantity</th>
          <th style="border: 1px solid #ccc; padding: 8px 12px; background-color: #f2f2f2; text-align: left;">Note</th>
        </tr>
      </thead>
      <tbody>
        ${poItemsTemplate}
      </tbody>
    </table>

    ${LouisFooter}
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

export const rejectOrderTemplate = (
  reason: string,
  order: any,
  note?: string,
) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333;">
      <h2 style="text-align: center; background-color: #d9534f; color: white; padding: 10px; border-radius: 5px;">Order Rejection Notice</h2>
      
      <p>Dear ${order?.user?.clientName || 'Customer'},</p>
      
      <p>We regret to inform you that your order <strong>#${order?.id}</strong> placed on <strong>${order?.orderTime}</strong> has been rejected.</p>
      
      <p><strong>Reason:</strong> ${reason}</p>
      
      ${note ? `<p><strong>Additional Note:</strong> ${note}</p>` : ''}

      <p>If you have any questions or would like to place a new order, feel free to reach out to us by replying to this email. We sincerely apologize for the inconvenience.</p>
      
      <hr style="margin: 20px 0;" />

      ${generateOrderTemplate(order?.user?.clientName, order?.user?.clientId, order, order?.user?.contactNumber, order?.user?.deliveryAddress, order?.id)}

      ${LouisFooter}
    </div>
  `;
};

export const approveOrderTemplate = (
  deliveryDate: string,
  deliveryTime: string,
  order: any,
) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333;">
      <h2 style="text-align: center; background-color: #5cb85c; color: white; padding: 10px; border-radius: 5px;">Order Confirmation</h2>
      
      <p>Dear ${order?.user?.clientName || 'Customer'},</p>
      
      <p>Good news! Your order <strong>#${order?.id}</strong> placed on <strong>${order?.orderTime}</strong> has been <strong>approved</strong> and is scheduled for delivery.</p>

      <p><strong>Scheduled Delivery:</strong> ${deliveryDate} at ${deliveryTime}</p>

      <p>If there are any changes or issues, feel free to contact us as soon as possible by replying to this email.</p>

      <hr style="margin: 20px 0;" />

      ${generateOrderTemplate(
        order?.user?.clientName,
        order?.user?.clientId,
        order,
        order?.user?.contactNumber,
        order?.user?.deliveryAddress,
        order?.id,
      )}

      ${LouisFooter}
    </div>
  `;
};
