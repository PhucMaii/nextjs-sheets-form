export const generateOrderTemplate = (
  clientName: string,
  clientNumber: string,
  order: any,
  phoneNumber: string,
  deliveryAddress: string,
  orderId: number,
  flag?: string,
) => {
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
        order?.discount
          ? `<p style="text-align: right;">Discount: -$${order.discount.toFixed(2)}</p>`
          : ''
      }
      <p style="text-align: right;">Subtotal: $${(order?.subTotal ?? order?.totalPrice ?? 0).toFixed(2)}</p>
      <p style="text-align: right;">GST: $${order?.GST?.toFixed(2) || '0.00'}</p>
      <p style="text-align: right;">PST: $${order?.PST?.toFixed(2) || '0.00'}</p>
      <p style="text-align: right;"><strong>Total: $${order?.totalPrice?.toFixed(2)}</strong></p>

      <p><strong>Delivery Address:</strong> ${deliveryAddress}</p>
      <p><strong>Contact:</strong> ${phoneNumber}</p>
      
      ${order?.note ? `<hr /><p><strong>Note:</strong> ${order.note}</p>` : ''}

      <p style="text-align: right;">Order by: ${order?.createdBy}</p>
      ${order?.updatedBy ? `<p style="text-align: right;">Updated by: ${order?.updatedBy}</p>` : ''}

    </div>
  `;
};

// export const generateOrderTemplate = (
//   clientName: string,
//   clientNumber: string,
//   // orderDetails: any,
//   order: any,
//   phoneNumber: string,
//   deliveryAddress: string,
//   orderId: number,
//   flag?: string,
// ) => {
//   let orderDetailsTemplate = '';
//   // let total = 0;

//   const flagText = flag
//     ? `<h2 style="text-align: center; font-weight: 300">${flag}</h2>`
//     : '';

//   for (const item of order?.items as any[]) {
//     if (item.quantity === 0) continue;
//     const optionText = item?.option?.name
//       ? `
//     <p> - ${item?.option.name}</p>
//   `
//       : '';
//     console.log(optionText, 'OPTION TEXT');
//     const totalPrice = item.price * item.quantity;
//     if (item?.isShowDiscount && item?.prevPrice) {
//       orderDetailsTemplate += `
//       <tr>
//       <td style="padding: 8px">
//       <h4>${item?.name} ${item?.option?.name ? `- ${item.option.name}` : ''}</h4>
//         </td>
//       <td style="padding: 8px; text-align: center">${item?.quantity}</td>
//       <td style="padding: 8px; text-align: center">
//         <div style="display: flex; flex-direction: column; align-items: center; gap: 1px">
//           <h4 style="text-decoration: line-through">$${item.prevPrice.toFixed(2)}</h4>
//           <br />
//           <h4>$${item.price.toFixed(2)}</h4>
//         </div>
//       </td>
//       <td style="padding: 8px; text-align: center; display: flex; flex-direction: column; align-items: center;">
//           <h4>$${totalPrice.toFixed(2)}</h4>
//       </td>
//       </tr>
//         `;
//     } else {
//       orderDetailsTemplate += `
//         <tr>
//         <td style="padding: 8px">
//         <div style="display: flex; flex-direction: column; align-items: center; gap: 1px">
//         <h4>${item?.name}</h4>
//         <br />
//         <h4 style="font-weight: regular">
//         ${optionText}
//         </h4>

//         </div>
//         </td>
//         <td style="padding: 8px; text-align: center">${item?.quantity}</td>
//         <td style="padding: 8px; text-align: center">
//           $${item.price.toFixed(2)}
//         </td>
//         <td style="padding: 8px; text-align: center">$${totalPrice.toFixed(2)}</td>
//         </tr>
//           `;
//     }
//   }

//   return `
//     <div style="margin: auto; width: 500px">
//         <div style="width: 100%;">
//         ${flagText}
//             <h2 style="text-align: center; font-weight: 300">Supreme Sprouts LTD</h2>
//             <h4 style="text-align: center;font-weight: 300;">1-6420 Beresford Street, Burnaby, BC, V5E 1B3</h4>
//             <div style="text-align: center;font-weight: 300;">
//                 778 789 1060
//                 <br/>
//                 709 989 6000
//             </div>
//         </div>
//         <div style="height: 1px; background-color: black; width: 100%; margin: auto"></div>
//         <div style="width: 100%;">
//             <h3 style="text-align: left;font-weight: 300;">Invoice: ${orderId}</h3>
//             <h3 style="text-align: left;font-weight: 300;">Client Name: ${clientName}</h3>
//             <h3 style="text-align: left;font-weight: 300;">Client Number: ${clientNumber}</h3>
//             <h3 style="text-align: left;font-weight: 300;">Order Time: ${
//               order?.orderTime
//             }</h3>
//             <h3 style="text-align: left;font-weight: 300;">Delivery Date: ${
//               order?.deliveryDate
//             }</h3>
//             <h3 style="text-align: left;">ORDER DETAILS</h3>
//             <table style="width: 100%"; border-collapse: collapse;>
//               <thead>
//                 <tr>
//                   <th style="padding: 8px; border: 1px solid #000 font-weight: bold">Item</th>
//                   <th style="padding: 8px; border: 1px solid #000 font-weight: bold">Quantity</th>
//                   <th style="padding: 8px; border: 1px solid #000 font-weight: bold">Unit Price</th>
//                   <th style="padding: 8px; border: 1px solid #000 font-weight: bold">Total Price</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 ${orderDetailsTemplate}
//               </tbody>
//             </table>
//             <div style="height: 1px; background-color: black; width: 100%; margin: auto"></div>
//             <h4 style="text-align: right;font-weight: 300;">Discount: -$${order?.discount?.toFixed(2)}</h4>
//             <h4 style="text-align: right;font-weight: 300;">Subtotal: $${order?.subTotal?.toFixed(2) || order?.totalPrice?.toFixed(2) || 0}</h4>
//             <h4 style="text-align: right;font-weight: 300;">GST: $${order?.GST?.toFixed(
//               2,
//             )}</h4>
//             <h4 style="text-align: right;font-weight: 300;">PST: $${order?.PST?.toFixed(
//               2,
//             )}</h4>
//             <h4 style="text-align: right;font-weight: 300;">Total: $${order?.totalPrice?.toFixed(
//               2,
//             )}</h4>
//             <h4 style="text-align: left;font-weight: 300;">DELIVERY ADDRESS: ${deliveryAddress}</h4>
//             <h4 style="text-align: left;font-weight: 300;">CONTACT: ${phoneNumber}</h4>
//             <div style="height: 1px; background-color: black; width: 100%; margin: auto"></div>
//             <h4 style="text-align: left;font-weight: 300;">NOTE: ${order?.note}</h4>
//             <div style="height: 1px; background-color: black; width: 100%; margin: auto"></div>
//             <h4 style="text-align: right;font-weight: 300;">Order by: ${order?.createdBy}</h4>
//         </div>
//     </div>
//     `;
// };

export const generatePurchaseOrderTemplate = (vendor: any, po: any) => {
  let poItemsTemplate = '';

  for (const item of po.poItems) {
    poItemsTemplate += `
        <tr>
          <td style="border: 1px solid #ccc; padding: 8px 12px;">${item.inventoryItem.name}</td>
          <td style="border: 1px solid #ccc; padding: 8px 12px;">${item.orderedQty}</td>
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
        </tr>
      </thead>
      <tbody>
        ${poItemsTemplate}
      </tbody>
    </table>

    <p>
      <strong>Louis Le</strong><br />
      Supreme Sprouts Ltd.<br />
      1-6420 Beresford Street, Burnaby, BC, V5E 1B3<br />
      Contact: 778-789-1060 | 709-989-6000<br />
      Website: <a href="https://supremesprouts.com">supremesprouts.com</a>
    </p>
    </div>
  `;
};
