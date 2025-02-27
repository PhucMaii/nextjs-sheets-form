describe('Order', () => {
    test('Order', () => {
        const clientIdInput: any = document.getElementById('clientId-input');
        const passwordInput: any = document.getElementById('password-input');

        if (!clientIdInput || !passwordInput) {
            throw new Error('Input elements not found');
        }

        clientIdInput.value = '00107';
        passwordInput.value = '17789286668';

        expect(clientIdInput.value).toBe('00107');
        expect(passwordInput.value).toBe('17789286668');
    })
});