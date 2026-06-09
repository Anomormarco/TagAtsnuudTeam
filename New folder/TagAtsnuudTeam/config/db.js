require('dotenv').config();
const mysql = require('mysql2/promise');

let pool;

const initializeDB = async () => {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Aa80622400@',
    database: process.env.DB_NAME || 'zaal',
    waitForConnections: true,
    connectionLimit: 10,
  });

  const conn = await pool.getConnection();
  conn.release();

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(50) DEFAULT NULL,
      role ENUM('admin','owner','user') DEFAULT 'user',
      avatar VARCHAR(500) DEFAULT NULL,
      refresh_token TEXT DEFAULT NULL,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  console.log('✓ MySQL connected successfully');
};

const getPool = () => pool;

module.exports = { initializeDB, getPool };