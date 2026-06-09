const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');

const appRoot = path.resolve(__dirname, '..');
const dbPath = path.join(appRoot, 'config', 'db.js');

function loadDashboardRepositoryWithPool(pool) {
  const repositoryPath = path.join(appRoot, 'backend', 'dashboard', 'dashboard.repository.js');

  delete require.cache[repositoryPath];
  require.cache[dbPath] = {
    id: dbPath,
    filename: dbPath,
    loaded: true,
    exports: pool
  };

  return require(repositoryPath);
}

test('admin dashboard stats include summary, statuses, payments, and payouts', async () => {
  let callIndex = 0;
  const responses = [
    [[{ totalPayments: 2, paidRevenue: 100000, platformRevenue: 10000, ownerRevenue: 90000, pendingAmount: 50000, failedAmount: 0 }]],
    [[{ status: 'paid', count: 1, amount: 100000 }]],
    [[{ id: 1, bookingId: 1, ownerId: 1, amount: 100000, platformFee: 10000, ownerAmount: 90000, status: 'paid' }]],
    [[{ id: 1, paymentId: 1, ownerId: 1, amount: 90000, status: 'pending', payoutMethod: 'stripe' }]]
  ];
  const pool = {
    execute: async () => responses[callIndex++]
  };
  const repository = loadDashboardRepositoryWithPool(pool);

  const dashboard = await repository.getAdminDashboard();

  assert.equal(dashboard.totalPayments, 2);
  assert.equal(dashboard.paymentStatuses[0].status, 'paid');
  assert.equal(dashboard.recentPayments[0].platformFee, 10000);
  assert.equal(dashboard.recentPayouts[0].payoutMethod, 'stripe');
});
