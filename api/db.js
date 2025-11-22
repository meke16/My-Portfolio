// db.js
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASS,
  database: process.env.PG_NAME,
  port: 5432,
  ssl: {
    require: true,            
    rejectUnauthorized: false 
  }
});
