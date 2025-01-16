// jest.mock('next-auth/react', () => ({
//   signIn: jest.fn().mockResolvedValue({ ok: true, error: null }),
//   getSession: jest.fn().mockResolvedValue({ token: 'mockedAuthToken' }),
// }));

export const loginTestAccountBeforeAll = () => {
  return beforeAll(() => {
    jest.mock('next-auth', () => ({
      default: jest.fn(() => jest.fn()),
      getServerSession: jest.fn().mockResolvedValue({
        user: { name: 'Test User 2', id: 223 },
      }),
    }));

    jest.mock('../pages/api/auth/[...nextauth]', () => ({
      authOptions: {
        providers: [],
        session: { strategy: 'jwt' },
        callbacks: {
          async session({ session }: any) {
            return session;
          },
        },
      },
    }));

    jest.mock('../pages/api/utils/withAuthGuard', () => {
      return {
        __esModule: true,
        default: jest.fn((handler) => (req: any, res: any) => {
          req.session = { user: { name: 'Test User 2', id: 223 } }; // Inject session
          return handler(req, res);
        }),
      };
    });
  });
};
