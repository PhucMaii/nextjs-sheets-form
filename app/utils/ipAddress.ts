import axios from "axios";

export const getIpAddress = async () => {
    try {
        const ipAddress = await axios.get('https://api.ipify.org?format=json');

        return ipAddress;
    } catch (error: any) {
        console.log('Something went wrong. Please try again later', error);
    }
}