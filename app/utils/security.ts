import CryptoJS from 'crypto-js';

export const generateSessionSignature = (sessionId: string) => {
    const secretKey: string | undefined = process.env.TOKEN_SECRET;

    if (!secretKey) {
        throw new Error('TOKEN_SECRET is not defined in environment variables');
    }

    const signature = CryptoJS.HmacSHA256(sessionId, secretKey).toString();

    return signature;
}

export const generateGuestSessionId = () => {
    return (
        Math.random().toString(36) + 
        Date.now().toString(36)
    )
}

export const verifySessionId = (sessionId: string, sessionSignature: string) => {
    if (!sessionSignature) {
        return false;
    }
    const expectedSignature = generateSessionSignature(sessionId);

    return expectedSignature === sessionSignature;
}