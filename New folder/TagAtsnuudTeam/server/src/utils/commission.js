/**
 * Commission calculation utility
 */
class Commission {
  // Platform commission percentage
  static COMMISSION_RATE = 0.10; // 10%

  /**
   * Calculate commission from booking amount
   */
  static calculateCommission(amount) {
    return amount * this.COMMISSION_RATE;
  }

  /**
   * Calculate owner payout (amount - commission)
   */
  static calculateOwnerPayout(amount) {
    return amount - this.calculateCommission(amount);
  }

  /**
   * Calculate total price with commission
   */
  static calculateTotalPrice(basePrice, hours, commission = true) {
    const subtotal = basePrice * hours;
    if (commission) {
      return subtotal + this.calculateCommission(subtotal);
    }
    return subtotal;
  }
}

module.exports = Commission;
