
class Commission {
  static COMMISSION_RATE = 0.10;
  static calculateCommission(amount) {
    return amount * this.COMMISSION_RATE;
  }
  static calculateOwnerPayout(amount) {
    return amount - this.calculateCommission(amount);
  }
  static calculateTotalPrice(basePrice, hours, commission = true) {
    const subtotal = basePrice * hours;
    if (commission) {
      return subtotal + this.calculateCommission(subtotal);
    }
    return subtotal;
  }
}

module.exports = Commission;
