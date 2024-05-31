const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'employee_db',
  password: 'd1onysus72',
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