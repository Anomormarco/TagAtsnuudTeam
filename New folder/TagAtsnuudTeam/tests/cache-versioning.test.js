const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const test = require('node:test');

const appRoot = path.resolve(__dirname, '..');
const dbPath = path.join(appRoot, 'config', 'db.js');

function loadAppWithPool(pool) {
  [
    'app.js',
    'backend/dashboard/dashboard.controller.js',
    'backend/dashboard/dashboard.repository.js',
    'backend/dashboard/dashboard.routes.js',
    'backend/dashboard/dashboard.service.js',
    'backend/payments/payment.controller.js',
    'backend/payments/payment.repository.js',
    'backend/payments/payment.routes.js',
    'backend/payments/payment.service.js',
    'backend/utils/cache.js'
  ].forEach((file) => {
    delete require.cache[path.join(appRoot, file)];
  });

  require.cache[dbPath] = {
    id: dbPath,
    filename: dbPath,
    loaded: true,
    exports: pool
  };

  return require(path.join(appRoot, 'app.js'));
}

function request(app, method, url, body) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const payload = body ? JSON.stringify(body) : null;
      const options = {
        method,
        port: server.address().port,
        path: url,
        headers: payload
          ? {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payload)
            }
          : {}
      };

      const req = http.request(options, (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          server.close(() => {
            resolve({
              statusCode: res.statusCode,
              body: JSON.parse(Buffer.concat(chunks).toString('utf8'))
            });
          });
        });
      });

      req.on('error', (error) => {
        server.close(() => reject(error));
      });

      if (payload) {
        req.write(payload);
      }

      req.end();
    });
  });
}

test('API only exposes dashboard under v1 and reserves v2', async () => {
  const app = loadAppWithPool({ execute: async () => [[]] });

  const legacy = await request(app, 'GET', '/api/dashboard/admin');
  const v2 = await request(app, 'GET', '/api/v2/halls');

  assert.equal(legacy.statusCode, 404);
  assert.equal(v2.statusCode, 501);
  assert.equal(v2.body.version, 'v2');
});

test('dashboard stats are cached and payment update clears dashboard cache', async () => {
  let dashboardCalls = 0;
  const pool = {
    execute: async (sql) => {
      if (sql.includes('FROM payments') && sql.includes('UPDATE payments')) {
        return [{}];
      }

      if (sql.includes('UPDATE payments')) {
        return [{}];
      }

      if (sql.includes('WHERE id = ?')) {
        return [[{ id: 1, amount: 100000, status: 'paid' }]];
      }

      if (sql.includes('COUNT(*)') && sql.includes('totalPayments')) {
        dashboardCalls += 1;
        return [[{ totalPayments: dashboardCalls, paidRevenue: 0, platformRevenue: 0, ownerRevenue: 0, pendingAmount: 0, failedAmount: 0 }]];
      }

      return [[]];
    }
  };
  const app = loadAppWithPool(pool);

  const first = await request(app, 'GET', '/api/v1/dashboard/admin');
  const second = await request(app, 'GET', '/api/v1/dashboard/admin');
  await request(app, 'PATCH', '/api/v1/payments/1/status', { status: 'paid' });
  const third = await request(app, 'GET', '/api/v1/dashboard/admin');

  assert.equal(first.statusCode, 200, JSON.stringify(first.body));
  assert.equal(second.statusCode, 200, JSON.stringify(second.body));
  assert.equal(third.statusCode, 200, JSON.stringify(third.body));
  assert.equal(first.body.totalPayments, 1);
  assert.equal(second.body.totalPayments, 1);
  assert.equal(third.body.totalPayments, 2);
});
