import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "club_ticket_booking",
    password: "Password123",  // Make sure this is correct
    port: 5432,
});

async function testConnection() {
    try {
        const res = await pool.query("SELECT NOW()");
        console.log("Database Connected! Current time:", res.rows[0]);
    } catch (err) {
        console.error("Database Connection Error:", err);
    } finally {
        pool.end();
    }
}

testConnection();
