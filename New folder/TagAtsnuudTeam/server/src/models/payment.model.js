const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];
const PAYMENT_METHODS = ['stripe', 'cash', 'bank_transfer', 'qpay'];

const paymentModel = {
  tableName: 'payments',
  columns: {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    bookingId: 'INT NOT NULL',
    userId: 'INT NOT NULL',
    hallId: 'INT NOT NULL',
    ownerId: 'INT NOT NULL',
    amount: 'DECIMAL(12,2) NOT NULL',
    platformFee: 'DECIMAL(12,2) NOT NULL DEFAULT 0',
    ownerAmount: 'DECIMAL(12,2) NOT NULL DEFAULT 0',
    currency: "VARCHAR(8) NOT NULL DEFAULT 'MNT'",
    method: "ENUM('stripe','cash','bank_transfer','qpay') NOT NULL DEFAULT 'stripe'",
    status: "ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending'",
    transactionId: 'VARCHAR(120)',
    paidAt: 'DATETIME',
    createdAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updatedAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
  }
};

module.exports = {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  paymentModel
};
