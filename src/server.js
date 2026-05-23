import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import pool from "./config/db.js";

const PORT = process.env.PORT || 3000;

try {
  const connection = await pool.getConnection();

  console.log("✅ Conectado ao MySQL!");

  connection.release();
} catch (error) {
  console.error("❌ Erro ao conectar:", error.message);
}

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT} -> localhost:${PORT}`);
});
