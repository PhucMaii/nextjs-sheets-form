export const generateEmployeeCode = () => {
  // random number with 4 digits
  return `${Math.floor(1000 + Math.random() * 9000)}`;
};
