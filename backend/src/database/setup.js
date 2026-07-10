import pool from './pool.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const setupDB = async () => {
  try {
    const initSql = fs.readFileSync(path.join(__dirname, '../sql/init.sql'), 'utf-8');
    const seedSql = fs.readFileSync(path.join(__dirname, '../sql/seed.sql'), 'utf-8');

    console.log('Running DDL (init.sql)...');
    await pool.query(initSql);
    
    console.log('Running DML (seed.sql)...');
    await pool.query(seedSql);

    console.log('Database setup complete.');
  } catch (error) {
    console.error('Error setting up DB:', error);
    throw error;
  }
};

// Si el archivo se ejecuta directamente (node setup.js)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  setupDB()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
