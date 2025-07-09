import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

async function initializeDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('Initializing database...');
    
    // Read schema file
    const schemaPath = path.join(__dirname, '..', 'src', 'database', 'bma_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema
    await pool.query(schema);
    
    console.log('Database initialized successfully!');
    
    // Create default admin user
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('BMA2024admin!', 10);
    
    await pool.query(`
      INSERT INTO users (username, email, password, role)
      VALUES ('admin', 'admin@bmasiapte.com', $1, 'admin')
      ON CONFLICT (username) DO NOTHING
    `, [hashedPassword]);
    
    console.log('Default admin user created');
    console.log('Username: admin');
    console.log('Password: BMA2024admin!');
    
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeDatabase();
}

export default initializeDatabase;