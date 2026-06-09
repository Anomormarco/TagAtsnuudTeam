const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');

const appRoot = path.resolve(__dirname, '..');
const dbPath = path.join(appRoot, 'config', 'db.js');

function loadPaymentServiceWithPool(pool) {
  const servicePath = path.join(appRoot, 'backend', 'payments', 'payment.service.js');
  const repositoryPath = path.join(appRoot, 'backend', 'payments', 'payment.repository.js');

  delete require.cache[servicePath];
  delete require.cache[repositoryPath];
  require.cache[dbPath] = {
    id: dbPath,
    filename: dbPath,
    loaded: true,
    exports: pool
  };

  return require(servicePath);
}

test('calculateCommission returns 10 percent platform fee by default', () => {
  const service = loadPaymentServiceWithPool({ execute: async () => [[]] });
  assert.deepEqual(service.calculateCommission(100000), {
    amount: 100000,
    platformFee: 10000,
    ownerAmount: 90000
  });
});

test('createPayment stores payment skeleton with commission split', async () => {
  const calls = [];
  const pool = {
    execute: async (sql, params) => {
      calls.push({ sql, params });

      if (sql.includes('INSERT INTO payments')) {
        return [{ insertId: 7 }];
      }

      if (sql.includes('WHERE id = ?')) {
        return [[{
          id: 7,
          bookingId: 2,
          userId: 3,
          hallId: 4,
          ownerId: 5,
          amount: 100000,
          platformFee: 10000,
          ownerAmount: 90000,
          currency: 'MNT',
          method: 'stripe',
          status: 'pending'
        }]];
      }

      return [[]];
    }
  };
  const service = loadPaymentServiceWithPool(pool);

  const payment = await service.createPayment({
    bookingId: 2,
    userId: 3,
    hallId: 4,
    ownerId: 5,
    amount: 100000
  });

  assert.equal(payment.id, 7);
  assert.equal(calls[0].params[5], 10000);
  assert.equal(calls[0].params[6], 90000);
});
