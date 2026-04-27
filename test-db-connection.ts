import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

console.log('Connecting to DB...');
const start = Date.now();
client
  .connect()
  .then(() => {
    console.log(`Connected in ${Date.now() - start}ms`);
    return client.end();
  })
  .catch((err) => {
    console.error('Connection failed:', err);
  });
