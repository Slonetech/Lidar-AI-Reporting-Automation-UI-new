import client from './src/config/db.js';

async function testConnection() {
  try {
    await client.connect();
    const res = await client.query('SELECT version();');
    console.log('PostgreSQL version:', res.rows[0].version);
  } catch (err) {
    console.error('Database connection error:', err);
  } finally {
    await client.end();
  }
}

testConnection(); 