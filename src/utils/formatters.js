export const formatIndianCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(Number(amount)) || amount === '') {
    return '₹0.00';
  }
  return '₹' + Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
