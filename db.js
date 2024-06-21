const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

const query = async (sql, params) => {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows;
  } catch (err) {
    console.error(err.message);
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  query,
};