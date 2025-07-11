import { Client } from 'pg';

// SECURITY NOTE: In production, use environment variables to store credentials, not hardcoded values.
const client = new Client({
  host: 'localhost',
  port: 5435, // Host-mapped port from Docker
  database: 'postgres',
  user: 'postgres',
  password: 'Moon-9-knight', // <-- Replace with your actual password!
});

export default client; 