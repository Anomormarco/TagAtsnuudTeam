const { getPool } = require('../config/db');

class UserRepository {
  async create({ name, email, password, role = 'user' }) {
    const pool = getPool();
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email.toLowerCase(), password, role]
    );
    return this.findById(result.insertId);
  }

  async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT id, name, email, phone, role, avatar, is_active as isActive, created_at as createdAt FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  async findByEmail(email) {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT id, name, email, phone, role, avatar, is_active as isActive FROM users WHERE email = ?',
      [email.toLowerCase()]
    );
    return rows[0] || null;
  }

  async findByEmailWithPassword(email) {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT id, name, email, password, role, is_active as isActive FROM users WHERE email = ?',
      [email.toLowerCase()]
    );
    return rows[0] || null;
  }

  async updateRefreshToken(id, refreshToken) {
    const pool = getPool();
    await pool.execute('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, id]);
    return this.findById(id);
  }

  async getRefreshToken(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT id, refresh_token as refreshToken FROM users WHERE id = ?', [id]
    );
    return rows[0] || null;
  }
}

module.exports = new UserRepository();