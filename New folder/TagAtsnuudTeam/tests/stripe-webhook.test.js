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

test('Stripe webhook mock marks payment paid and creates owner payout', async () => {
  delete process.env.STRIPE_WEBHOOK_SECRET;

  const calls = [];
  const pool = {
    execute: async (sql, params) => {
      calls.push({ sql, params });

      if (sql.includes('UPDATE payments')) {
        return [{}];
      }

      if (sql.includes('FROM payments') && sql.includes('WHERE id = ?')) {
        return [[{
          id: 11,
          bookingId: 22,
          userId: 33,
          hallId: 44,
          ownerId: 55,
          amount: 100000,
          platformFee: 10000,
          ownerAmount: 90000,
          currency: 'MNT',
          status: 'paid'
        }]];
      }

      if (sql.includes('FROM owner_payouts') && sql.includes('WHERE payment_id = ?')) {
        return [[]];
      }

      if (sql.includes('INSERT INTO owner_payouts')) {
        return [{ insertId: 99 }];
      }

      if (sql.includes('FROM owner_payouts') && sql.includes('WHERE id = ?')) {
        return [[{ id: 99, paymentId: 11, ownerId: 55, amount: 90000, status: 'pending' }]];
      }

      return [[]];
    }
  };
  const service = loadPaymentServiceWithPool(pool);
  const event = {
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_123',
        payment_intent: 'pi_test_123',
        metadata: {
          paymentId: '11'
        }
      }
    }
  };

  await service.handleStripeWebhook({
    headers: {},
    body: Buffer.from(JSON.stringify(event))
  });

  assert.equal(calls.some((call) => call.sql.includes('UPDATE payments') && call.params[1] === 'pi_test_123'), true);
  assert.equal(calls.some((call) => call.sql.includes('INSERT INTO owner_payouts')), true);
});
