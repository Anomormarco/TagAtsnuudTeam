const DEFAULT_PLATFORM_FEE_RATE = Number(process.env.PLATFORM_FEE_RATE || 0.1);

// Мөнгөн дүнг 2 орны нарийвчлалтай number болгоно.
function money(value) {
  return Number(Number(value || 0).toFixed(2));
}

// Нийт дүнгээс platform fee болон owner авах дүнг салгаж тооцно.
function calculateCommission(amount, platformFee) {
  const totalAmount = money(amount);
  const feeAmount = money(platformFee ?? totalAmount * DEFAULT_PLATFORM_FEE_RATE);

  return {
    amount: totalAmount,
    platformFee: feeAmount,
    ownerAmount: money(totalAmount - feeAmount)
  };
}

module.exports = {
  DEFAULT_PLATFORM_FEE_RATE,
  calculateCommission,
  money
};
