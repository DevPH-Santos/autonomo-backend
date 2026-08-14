import express from "express"
import cors from "cors"
import authRoutes from "./routes/authRoutes.js"
import clienteRoutes from "./routes/clienteRoutes.js"
import produtoRoutes from "./routes/produtoRoutes.js"
import atendimentoRoutes from "./routes/atendimentoRoutes.js"
import pagamentoRoutes from "./routes/pagamentoRoutes.js"
import despesasRoutes from "./routes/despesaRoutes.js"
import lembreteRoutes from "./routes/lembreteRoutes.js"

const app = express()

/**
 * Habilita o CORS para permitir que o frontend acesse a API.
*/
app.use(cors())

/**
 * Permite que a API receba dados em formato JSON no corpo das requisições.
*/
app.use(express.json())

/**
 * Rota inicial usada para testar se a API está funcionando.
*/
app.get("/", (req, res) => {
  res.send("🚀 API funcionando!")
})

/**
 * Registra as rotas de autenticação com o prefixo /auth.
 *
 * Rotas disponíveis neste grupo:
 * POST /auth/cadastro
 * futuramente: POST /auth/login
*/
app.use("/auth", authRoutes)
app.use("/clientes", clienteRoutes)
app.use("/produtos", produtoRoutes)
app.use("/atendimentos", atendimentoRoutes)
app.use("/pagamentos", pagamentoRoutes)
app.use("/despesas", despesasRoutes)
app.use("/lembretes", lembreteRoutes)

export default app
