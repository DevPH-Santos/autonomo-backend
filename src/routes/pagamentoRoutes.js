import express from "express"
import {
    listarTodosPagamentos,
    obterUmPagamento,
    editarPagamento,
    excluirPagamento,
    alterarStatusPagamento
} from "../controllers/pagamentoController.js"
import { autenticar } from "../middlewares/authMiddleware.js"

const router = express.Router()

/**
 * Middleware de autenticação em todas as rotas
 */
router.use(autenticar)

/**
 * CRUD Pagamentos
 *
 * Nota: não há POST aqui pois o pagamento é criado automaticamente
 * pelo atendimentoService ao cadastrar um atendimento.
 */

// READ ALL - Lista pagamentos do usuário
// GET /pagamentos
router.get("/", listarTodosPagamentos)

// READ BY ID - Obtém um pagamento específico
// GET /pagamentos/:id
router.get("/:id", obterUmPagamento)

// UPDATE - Atualiza dados do pagamento (valor, forma, observação, etc.)
// PUT /pagamentos/:id
router.put("/:id", editarPagamento)

// DELETE - Deleta um pagamento (desvincula o atendimento automaticamente)
// DELETE /pagamentos/:id
router.delete("/:id", excluirPagamento)

/**
 * Funcionalidade especial
 */

// PATCH STATUS - Atualiza apenas o status do pagamento
// PATCH /pagamentos/:id/status
// Body: { status_pgto: "Pago" | "Pendente" | "Atrasado" }
router.patch("/:id/status", alterarStatusPagamento)

export default router
