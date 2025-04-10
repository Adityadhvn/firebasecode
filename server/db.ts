import pg from "pg";
const { Pool } = pg;
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Manually define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file correctly
dotenv.config({ path: path.resolve(__dirname, "../.env") });

console.log("Loaded DATABASE_URL:", process.env.DATABASE_URL);


if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Define pool before using it

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
console.log("Initialized database pool with connection string:", process.env.DATABASE_URL);


// Use pool for drizzle
export const db = drizzle(pool, { schema });

// Query function
export const query = async (text: string, params?: any[]) => {
  try {
    console.log("Executing query:", text);
    console.log("With parameters:", params);
    
    const result = await pool.query(text, params);
    
    console.log("Query result:", result.rows);  // Log the result for debugging
    return result.rows;
  } catch (error) {
    console.error("🔥 Database Query Error:", error);
    throw error;
  }
};

// Fetch user by username
// In db.ts (update this function)
export async function getUserByUsername(identifier: string | number) {
  const query = typeof identifier === "number" 
    ? "SELECT * FROM users WHERE id = $1" 
    : "SELECT * FROM users WHERE username = $1";
  
  const values = [identifier];
  
  const result = await pool.query(query, values);
  return result.rows[0]; // Return user object
}
// Fetch user by userid
export const getUserById = async (id: number) => {
  if (typeof id !== "number") {
      throw new Error(`Invalid ID type received: ${JSON.stringify(id)}`);
  }

  const queryText = `
  SELECT 
  id, username, email, full_name AS "fullName", password, is_organizer AS "isOrganizer", is_super_admin AS "isSuperAdmin"
  FROM users 
  WHERE id = $1
  `;
  const users = await query(queryText, [id]);

  return users.length > 0 ? users[0] : null;
};


// ✅ Added createUser function
export const createUser = async (user: { 
  username: string; 
  email: string; 
  password: string;
  full_name: string; // Add this field
}) => {
  const queryText = `
    INSERT INTO users (username, email, password, full_name) 
    VALUES ($1, $2, $3, $4) 
    RETURNING *
  `;
  const users = await query(queryText, [
    user.username, 
    user.email, 
    user.password,
    user.full_name // Include full_name
  ]);
  return users.length > 0 ? users[0] : null;
};


// Export all functions
const dbFunctions = {
  query,
  getUserByUsername,
  createUser,   // Added this
  getUserById   // Added this
};

export default dbFunctions;


// In db.ts
pool.on('connect', () => console.log('New DB connection'));
pool.on('error', (err) => console.error('Database pool error:', err));

