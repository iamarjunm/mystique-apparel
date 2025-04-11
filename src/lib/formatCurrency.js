const formatCurrency = (amount, currency = "INR", locale = "en-IN") => {
  // Convert amount to a number if it's a string
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  // Check if the amount is a valid number
  if (isNaN(numericAmount)) {
    console.error("Invalid amount:", amount);
    return "₹0.00"; // Fallback value
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
};

export default formatCurrency;