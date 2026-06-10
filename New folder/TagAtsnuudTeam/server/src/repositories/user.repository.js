const db = require('../config/db');

class UserRepository {
  async create({ name, email, password, role = 'user' }) {
    const [maxRows] = await db.execute('SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM users');
    const nextId = maxRows[0].nextId;

    const [result] = await db.execute(
      'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [nextId, name, email.toLowerCase(), password, role.toUpperCase()]
    );
    return this.findById(result.insertId || nextId);
  }


  async findById(id) {
    const [rows] = await db.execute(
      `
        SELECT
          id,
          name,
          email,
          phone,
          role,
          profile_image AS avatar,
          deleted_at IS NULL AS isActive,
          created_at AS createdAt
        FROM users
        WHERE id = ?
      `,
      [id]
    );
    return rows[0] || null;
  }

  async findByEmail(email) {
    const [rows] = await db.execute(
      `
        SELECT
          id,
          name,
          email,
          phone,
          role,
          profile_image AS avatar,
          deleted_at IS NULL AS isActive
        FROM users
        WHERE email = ?
      `,
      [email.toLowerCase()]
    );
    return rows[0] || null;
  }

  async findByEmailWithPassword(email) {
    const [rows] = await db.execute(
      `
        SELECT
          id,
          name,
          email,
          password,
          phone,
          role,
          profile_image AS avatar,
          deleted_at IS NULL AS isActive,
          created_at AS createdAt
        FROM users
        WHERE email = ?
      `,
      [email.toLowerCase()]
    );
    return rows[0] || null;
  }

  async countByRole(role) {
    const [rows] = await db.execute(
      'SELECT COUNT(*) AS count FROM users WHERE role = ? AND deleted_at IS NULL',
      [String(role).toUpperCase()]
    );
    return Number(rows[0]?.count || 0);
  }

  async listByRole(role) {
    const [rows] = await db.execute(
      `
        SELECT
          id,
          name,
          email,
          phone,
          role,
          profile_image AS avatar,
          created_at AS createdAt
        FROM users
        WHERE role = ? AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT 50
      `,
      [String(role).toUpperCase()]
    );
    return rows;
  }

  async updateRefreshToken(id, refreshToken) {
    await db.execute('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, id]);
    return this.findById(id);
  }

  async getRefreshToken(id) {
    const [rows] = await db.execute(
      'SELECT id, refresh_token as refreshToken FROM users WHERE id = ?', [id]
    );
    return rows[0] || null;
  }
}

module.exports = new UserRepository();
