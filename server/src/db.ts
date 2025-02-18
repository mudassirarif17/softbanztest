import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// Define types for the database configuration
interface DBConfig {
    user: string;
    host: string;
    database: string;
    password: string;
    port: number;
}

// Create a new Pool instance with environment variables
const pool = new Pool({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "softbanz",
    password: process.env.DB_PASSWORD || "123456789",
    port: parseInt(process.env.DB_PORT || "5432"), // Ensure port is a number
});

export default pool;