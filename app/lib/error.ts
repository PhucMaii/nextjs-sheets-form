export const generateErrorMsg = (error: any) => {
    return error?.response?.data?.error || 'Something went wrong: ' + error;
}