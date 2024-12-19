import { getSession, signIn } from "next-auth/react";

let authToken: string = '';

jest.mock('next-auth/react', () => ({
    signIn: jest.fn().mockResolvedValue({ ok: true, error: null }),
    getSession: jest.fn().mockResolvedValue({ token: 'mockedAuthToken' }),
  }));

export const loginAdminBeforeAll = () => {
    beforeAll(async () => {
        const user: any = await signIn('credentials', {
            redirect: false,
            clientId: process.env.TEST_ADMIN_CLIENT_ID,
            password: process.env.TEST_ADMIN_PASSWORD,
        });
        
        const session: any = await getSession();
        console.log(session, 'session');

        if (!user || user?.error) {
            throw new Error('Login Failed: ' + user?.error);
        }
        authToken = session.token;
        console.log(authToken);


    });
}

export const getAuthToken = () => authToken;
