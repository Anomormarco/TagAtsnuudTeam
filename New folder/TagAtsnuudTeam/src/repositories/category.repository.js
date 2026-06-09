const db = require("../config/db");
const Category = require("../models/category.model");

const mapCategory = (row) =>
  new Category({
    id: row.id,
    name: row.name,
  });

const findAll = async () => {
  const [rows] = await db.execute("SELECT id, name FROM categories ORDER BY name ASC");
  return rows.map(mapCategory);
};

const findById = async (id) => {
  const [rows] = await db.execute("SELECT id, name FROM categories WHERE id = ? LIMIT 1", [id]);
  return rows[0] ? mapCategory(rows[0]) : null;
};

module.exports = {
  findAll,
  findById,
};
