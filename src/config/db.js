import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  // DATETIME representa data/hora civil; mantê-lo como texto evita que o fuso
  // do processo desloque lembretes ao ler e reagendar um evento.
  dateStrings: true,

  ssl: {
    rejectUnauthorized: false,
  },
});

console.log("✅ Pool MySQL criada!");

export default pool;
