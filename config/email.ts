export const orderTemplate = `
    <div>
        <div>
            <h2>Supreme Sprouts LTD</h2>
            <h4>1-6420 Beresford Street, Burnaby, BC, V5E 1B3
            <h4>778 789 1060</h4>
            <h4>709 789 6000</h4>
        </div>
        <div style="height: 1px; background-color: black; width: 100%"></div>
        <div>

        </div>
    </div>
`;

export const generateOrderTemplate = (
    clientName: string, 
    clientNumber: string, 
    orderDetails: any,
    phoneNumber: string,
    deliveryAddress: string,
) => {
  return `
    <div>
    <div>
        <h2>Supreme Sprouts LTD</h2>
        <h4>1-6420 Beresford Street, Burnaby, BC, V5E 1B3
        <h4>778 789 1060</h4>
        <h4>709 789 6000</h4>
    </div>
    <div style="height: 1px; background-color: black; width: 100%"></div>
    <div>
        <h4>Client Name: ${clientName}</h4>
        <h4>Client Number: ${clientNumber}>/h4>
        <h4>Date: ${orderDetails.date}</h4>
        <h4>Orders:</h4>
        <div>
            <h6>1x Beansprout 10lbs</h6>
            <h6>2x Basil 10lbs</h6>
            <h6>1x Jumbo Eggs 10lbs</h6>
        </div>
        <h4>Delivery Address: ${deliveryAddress}</h4>
        <h4>Contact: ${phoneNumber}</h4>
    </div>
</div>
    `;
};
