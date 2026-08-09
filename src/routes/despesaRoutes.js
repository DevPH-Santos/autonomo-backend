import { Router } from "express"
import {
    registrarGasto,
    listarGastos,
    obterGasto,
    editarGasto,
    excluirGasto
} from "../controllers/despesaController.js"
import { autenticar } from "../middlewares/authMiddleware.js"

/**
 * Agrupa todas as rotas relacionadas aos gastos.
 * Este router será registrado no app.js com o prefixo /despesas.
 */
const router = Router()

/**
 * POST /despesas
 * Cadastra um novo gasto
 * Requer autenticação
 *
 * Body:
 * {
 *   "descricao": "Cloro Estabilizado 10kg",
 *   "data": "2024-10-12T14:30:00",
 *   "valor": 350.00,
 *   "id_produto": 5  (opcional)
 * }
 */
router.post("/", autenticar, registrarGasto)

/**
 * GET /despesas
 * Lista todos os gastos
 * Requer autenticação
 */
router.get("/", autenticar, listarGastos)

/**
 * GET /despesas/:id
 * Obtém dados de um gasto específico
 * Usado para preencher modal de edição
 */
router.get("/:id", obterGasto)

/**
 * PUT /despesas/:id
 * Atualiza dados de um gasto
 *
 * Body: (enviar apenas os campos que deseja atualizar)
 * {
 *   "descricao": "Cloro HTH 20kg",
 *   "data": "2024-10-13T09:00:00",
 *   "valor": 420.00,
 *   "id_produto": 5
 * }
 */
router.put("/:id", editarGasto)

/**
 * DELETE /despesas/:id
 * Deleta um gasto
 */
router.delete("/:id", excluirGasto)

export default router
