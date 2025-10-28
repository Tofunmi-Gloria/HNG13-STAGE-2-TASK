import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

await db.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
await db.query(`USE ${process.env.DB_NAME}`);

export default db;
