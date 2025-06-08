export const formatCurrency = (amount: number): string => {
  return `RWF ${amount.toLocaleString('en-RW')}`;
};

export const formatCurrencyWithoutSymbol = (amount: number): string => {
  return amount.toLocaleString('en-RW');
}; 