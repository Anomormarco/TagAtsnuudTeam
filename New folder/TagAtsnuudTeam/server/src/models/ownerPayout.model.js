const PAYOUT_STATUSES = ['pending', 'processing', 'paid', 'cancelled'];

const ownerPayoutModel = {
  tableName: 'owner_payouts',
  columns: {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    ownerId: 'INT NOT NULL',
    paymentId: 'INT',
    amount: 'DECIMAL(12,2) NOT NULL',
    currency: "VARCHAR(8) NOT NULL DEFAULT 'MNT'",
    status: "ENUM('pending','processing','paid','cancelled') NOT NULL DEFAULT 'pending'",
    payoutMethod: 'VARCHAR(40) NOT NULL',
    bankAccount: 'VARCHAR(120)',
    note: 'VARCHAR(255)',
    requestedAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    paidAt: 'DATETIME',
    createdAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updatedAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
  }
};

module.exports = {
  PAYOUT_STATUSES,
  ownerPayoutModel
};
