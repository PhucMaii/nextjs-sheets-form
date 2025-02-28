import LoginPage from '@/app/auth/login/page';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('axios', () => ({
  post: jest.fn(() => Promise.resolve({ data: { success: true } })),
}));


jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(), // Mock the router push function
  })),
}));

describe('Login User', () => {
  test('Login User', async () => {
    render(<LoginPage />);
    const clientIdInput: any = screen.getByTestId('clientId-input');
    const passwordInput: any = screen.getByTestId('password-input');

    if (!clientIdInput || !passwordInput) {
      throw new Error('Input elements not found');
    }

    // Set input values
    clientIdInput.value = '00107';
    passwordInput.value = '17789286668';

    // Assertions
    expect(clientIdInput.value).toBe('00107');
    expect(passwordInput.value).toBe('17789286668');

    // Submit the form
    const loginButton = screen.getByTestId('login-button');

    await userEvent.type(clientIdInput, '00107');
    await userEvent.type(passwordInput, '17789286668');
    await userEvent.click(loginButton);

    // await waitFor(() => expect(screen.getByText('Login Successful')).toBeInTheDocument());
  });
});
