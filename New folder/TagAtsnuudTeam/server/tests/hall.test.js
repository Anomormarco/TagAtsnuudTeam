const assert = require("node:assert");
const app = require("../app");
const db = require("../src/config/db");
const cache = require("../src/utils/cache");

const PORT = 3099;
const baseUrl = `http://localhost:${PORT}/api/v1`;

const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const body = await response.json();
  return { response, body };
};

const startServer = () =>
  new Promise((resolve) => {
    const server = app.listen(PORT, () => resolve(server));
  });

const run = async () => {
  await db.testConnection();
  const server = await startServer();
  let createdHallId;

  try {
    cache.clear();

    const list = await request("/halls?page=1&size=5&keyword=спорт&sort=price,asc");
    assert.equal(list.response.status, 200);
    assert.equal(Array.isArray(list.body.data.content), true);
    assert.equal(list.body.data.page, 1);
    assert.equal(list.body.data.size, 5);

    const categoryFiltered = await request("/halls?category=1&page=1&size=3");
    assert.equal(categoryFiltered.response.status, 200);
    assert.equal(categoryFiltered.body.data.content.length <= 3, true);

    const firstHall = list.body.data.content[0];
    const detail = await request(`/halls/${firstHall.id}`);
    assert.equal(detail.response.status, 200);
    assert.equal(detail.body.data.id, firstHall.id);

    const cacheKey = JSON.stringify({
      keyword: "",
      category: "",
      location: "",
      page: 1,
      size: 2,
      sort: "created_at,desc",
    });
    await request("/halls?page=1&size=2");
    assert.equal(cache.has(`halls:list:${cacheKey}`), true);

    const create = await request("/halls", {
      method: "POST",
      headers: { "x-user-id": "6", "x-user-role": "OWNER" },
      body: JSON.stringify({
        name: `Test Hall ${Date.now()}`,
        description: "Day4 automated CRUD test hall",
        location: "Test district",
        capacity: 24,
        pricePerHour: 45000,
        imageUrl: "/uploads/halls/test.jpg",
        status: "AVAILABLE",
        categoryIds: [1],
      }),
    });
    assert.equal(create.response.status, 201, JSON.stringify(create.body));
    createdHallId = create.body.data.id;
    assert.equal(cache.keys().some((key) => key.startsWith("halls:list:")), false);

    const denied = await request(`/halls/${createdHallId}`, {
      method: "PATCH",
      headers: { "x-user-id": "7", "x-user-role": "OWNER" },
      body: JSON.stringify({ capacity: 30 }),
    });
    assert.equal(denied.response.status, 403);

    const update = await request(`/halls/${createdHallId}`, {
      method: "PATCH",
      headers: { "x-user-id": "6", "x-user-role": "OWNER" },
      body: JSON.stringify({ capacity: 30, sort: undefined }),
    });
    assert.equal(update.response.status, 200);
    assert.equal(update.body.data.capacity, 30);

    const remove = await request(`/halls/${createdHallId}`, {
      method: "DELETE",
      headers: { "x-user-id": "6", "x-user-role": "OWNER" },
    });
    assert.equal(remove.response.status, 200);

    const deletedDetail = await request(`/halls/${createdHallId}`);
    assert.equal(deletedDetail.response.status, 404);

    console.log("Hall Day4 tests passed");
  } finally {
    if (createdHallId) {
      await db.query("DELETE FROM hall_categories WHERE hall_id = ?", [createdHallId]);
      await db.query("DELETE FROM halls WHERE id = ?", [createdHallId]);
    }
    await new Promise((resolve) => server.close(resolve));
    await db.end();
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
