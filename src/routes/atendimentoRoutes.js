import express from "express"
import {
    registrarAtendimento,
    listarAtendimentos,
    obterAtendimento,
    editarAtendimento,
    excluirAtendimento,
    buscarClientesAutocomplete,
    buscarProdutosAutocomplete,
    atualizarProdutosAtendimento
} from "../controllers/atendimentoController.js"
import { autenticar } from "../middlewares/authMiddleware.js"

const router = express.Router()

/**
 * Middleware de autenticação em todas as rotas
 */
router.use(autenticar)

/**
 * CRUD Atendimentos
 */

// CREATE - Cria novo atendimento
router.post("/", registrarAtendimento)

// READ ALL - Lista atendimentos do usuário
router.get("/", listarAtendimentos)

// READ BY ID - Obtém um atendimento específico
router.get("/:id", obterAtendimento)

// UPDATE - Atualiza atendimento
router.put("/:id", editarAtendimento)

// DELETE - Deleta atendimento
router.delete("/:id", excluirAtendimento)

/**
 * Funcionalidades Especiais
 */

// AUTOCOMPLETE - Busca clientes
// GET /atendimentos/clientes/buscar?termo=joão
router.get("/clientes/buscar", buscarClientesAutocomplete)

// AUTOCOMPLETE - Busca produtos
// GET /atendimentos/produtos/buscar?termo=cloro
router.get("/produtos/buscar", buscarProdutosAutocomplete)

// UPDATE PRODUTOS - Atualiza produtos de um atendimento
// PUT /atendimentos/:id/produtos
router.put("/:id/produtos", atualizarProdutosAtendimento)

export default router
