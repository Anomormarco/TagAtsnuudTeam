const db = require("../config/db");
const Hall = require("../models/hall.model");
const Category = require("../models/category.model");

const mapHallRow = (row) => {
  const categoryIds = row.category_ids ? row.category_ids.split(",").map(Number) : [];
  const categoryNames = row.category_names ? row.category_names.split(",") : [];

  return {
    ...new Hall({
      id: row.id,
      ownerId: row.owner_id,
      name: row.name,
      description: row.description,
      location: row.location,
      capacity: row.capacity,
      pricePerHour: row.price_per_hour,
      imageUrl: row.thumbnail_url || row.image_url,
      status: row.status,
      categoryIds,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }),
    categories: categoryIds.map(
      (id, index) =>
        new Category({
          id,
          name: categoryNames[index],
        })
    ),
    rating: Number(row.average_rating || 0),
    reviewCount: Number(row.review_count || 0),
  };
};

const findImagesByHallId = async (hallId) => {
  const [rows] = await db.execute(
    `SELECT id, image_url, image_type, sort_order, alt_text
     FROM hall_images
     WHERE hall_id = ?
     ORDER BY
       CASE WHEN image_type = 'thumbnail' THEN 0 ELSE 1 END,
       sort_order ASC,
       id ASC`,
    [hallId]
  );

  return rows.map((row) => ({
    id: row.id,
    imageUrl: row.image_url,
    imageType: row.image_type,
    sortOrder: row.sort_order,
    altText: row.alt_text,
  }));
};

const baseSelect = `
  SELECT
    h.id,
    h.owner_id,
    h.name,
    h.description,
    h.location,
    h.capacity,
    h.price_per_hour,
    h.image_url,
    MAX(thumb.image_url) AS thumbnail_url,
    h.status,
    h.created_at,
    h.updated_at,
    COALESCE(ROUND(AVG(r.rating), 1), 0) AS average_rating,
    COUNT(DISTINCT r.id) AS review_count,
    GROUP_CONCAT(DISTINCT c.id ORDER BY c.name) AS category_ids,
    GROUP_CONCAT(DISTINCT c.name ORDER BY c.name) AS category_names
  FROM halls h
  LEFT JOIN hall_images thumb ON thumb.id = (
    SELECT hi.id
    FROM hall_images hi
    WHERE hi.hall_id = h.id AND hi.image_type = 'thumbnail'
    ORDER BY hi.sort_order ASC, hi.id ASC
    LIMIT 1
  )
  LEFT JOIN hall_categories hc ON hc.hall_id = h.id
  LEFT JOIN categories c ON c.id = hc.category_id
  LEFT JOIN reviews r ON r.hall_id = h.id AND r.deleted_at IS NULL
`;

const buildWhere = ({ keyword, category, location, ownerId } = {}) => {
  const params = [];
  const where = ["h.deleted_at IS NULL"];

  if (keyword) {
    where.push("(h.name LIKE ? OR h.description LIKE ?)");
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  if (location) {
    where.push("h.location LIKE ?");
    params.push(`%${location}%`);
  }

  if (ownerId) {
    where.push("h.owner_id = ?");
    params.push(ownerId);
  }

  if (category) {
    where.push(
      "EXISTS (SELECT 1 FROM hall_categories filter_hc WHERE filter_hc.hall_id = h.id AND filter_hc.category_id = ?)"
    );
    params.push(category);
  }

  return { sql: `WHERE ${where.join(" AND ")}`, params };
};

const parseSort = (sort = "created_at,desc") => {
  const [field, direction] = String(sort).split(",");
  const columns = {
    name: "h.name",
    price: "h.price_per_hour",
    capacity: "h.capacity",
    created_at: "h.created_at",
  };
  const column = columns[field] || columns.created_at;
  const order = String(direction).toLowerCase() === "asc" ? "ASC" : "DESC";

  return `${column} ${order}`;
};

const findAll = async (filters = {}) => {
  const page = Math.max(Number(filters.page) || 1, 1);
  const size = Math.min(Math.max(Number(filters.size) || 12, 1), 200);
  const offset = (page - 1) * size;
  const where = buildWhere(filters);
  const orderBy = parseSort(filters.sort);

  const [rows] = await db.execute(
    `${baseSelect}
     ${where.sql}
     GROUP BY h.id
     ORDER BY ${orderBy}
     LIMIT ${size} OFFSET ${offset}`,
    where.params
  );

  const [countRows] = await db.execute(
    `SELECT COUNT(DISTINCT h.id) AS total
     FROM halls h
     ${where.sql}`,
    where.params
  );

  return {
    content: rows.map(mapHallRow),
    page,
    size,
    totalElements: countRows[0].total,
    totalPages: Math.ceil(countRows[0].total / size),
  };
};

const findById = async (id) => {
  const [rows] = await db.execute(
    `${baseSelect}
     WHERE h.id = ? AND h.deleted_at IS NULL
     GROUP BY h.id
     LIMIT 1`,
    [id]
  );

  if (!rows[0]) {
    return null;
  }

  const hall = mapHallRow(rows[0]);
  hall.images = await findImagesByHallId(id);

  return hall;
};

const create = async (hallData) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [idRows] = await connection.execute("SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM halls");
    const nextId = idRows[0].nextId;

    const [result] = await connection.execute(
      `INSERT INTO halls
       (id, owner_id, name, description, location, capacity, price_per_hour, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nextId,
        hallData.ownerId,
        hallData.name,
        hallData.description || null,
        hallData.location,
        hallData.capacity,
        hallData.pricePerHour,
        hallData.imageUrl || null,
        hallData.status || "AVAILABLE",
      ]
    );

    if (Array.isArray(hallData.categoryIds) && hallData.categoryIds.length) {
      await connection.query("INSERT INTO hall_categories (hall_id, category_id) VALUES ?", [
        hallData.categoryIds.map((categoryId) => [nextId, categoryId]),
      ]);
    }

    await connection.commit();
    return findById(nextId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updateById = async (id, hallData) => {
  const fields = {
    name: "name",
    description: "description",
    location: "location",
    capacity: "capacity",
    pricePerHour: "price_per_hour",
    imageUrl: "image_url",
    status: "status",
  };
  const updates = [];
  const params = [];
  const connection = await db.getConnection();

  Object.entries(fields).forEach(([key, column]) => {
    if (hallData[key] !== undefined) {
      updates.push(`${column} = ?`);
      params.push(hallData[key]);
    }
  });

  try {
    await connection.beginTransaction();

    if (updates.length) {
      await connection.execute(
        `UPDATE halls SET ${updates.join(", ")} WHERE id = ? AND deleted_at IS NULL`,
        [...params, id]
      );
    }

    if (Array.isArray(hallData.categoryIds)) {
      await connection.execute("DELETE FROM hall_categories WHERE hall_id = ?", [id]);

      if (hallData.categoryIds.length) {
        await connection.query("INSERT INTO hall_categories (hall_id, category_id) VALUES ?", [
          hallData.categoryIds.map((categoryId) => [id, categoryId]),
        ]);
      }
    }

    await connection.commit();
    return findById(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const softDeleteById = async (id) => {
  const [result] = await db.execute(
    "UPDATE halls SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL",
    [id]
  );

  return result.affectedRows > 0;
};

module.exports = {
  findAll,
  findById,
  create,
  updateById,
  softDeleteById,
};
