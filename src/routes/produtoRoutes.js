import { Router } from "express";
import { 
    registrarProduto, 
    listarProdutos, 
    obterProduto, 
    editarProduto, 
    excluirProduto 
} from "../controllers/produtoController.js";
import { autenticar } from "../middlewares/authMiddleware.js";

/**
 * Agrupa todas as rotas relacionadas aos produtos.
 * Este router será registrado no app.js com o prefixo /produtos.
 */
const router = Router()

/**
 * POST /produtos
 * Cria um novo produto
 * Requer autenticação
 * 
 * Body:
 * {
 *   "nome_produto": "Óleo de Lubrificação",
 *   "quantidade_produto": 50,
 *   "valor_produto": 45.50,
 *   "unidade_medida": "litro"
 * }
 */
router.post("/", autenticar, registrarProduto)  // ✅ middleware ANTES do controller

/**
 * GET /produtos
 * Lista todos os produtos do usuário autenticado
 * Requer autenticação
 */
router.get("/", autenticar, listarProdutos)  // ✅ middleware ANTES do controller

/**
 * GET /produtos/:id
 * Obtém dados de um produto específico
 * Usado para preencher modal de edição
 */
router.get("/:id", obterProduto)

/**
 * PUT /produtos/:id
 * Atualiza dados de um produto
 * 
 * Body: (enviar apenas os campos que deseja atualizar)
 * {
 *   "nome_produto": "Óleo Premium",
 *   "quantidade_produto": 75,
 *   "valor_produto": 55.00,
 *   "unidade_medida": "litro"
 * }
 */
router.put("/:id", editarProduto)

/**
 * DELETE /produtos/:id
 * Deleta um produto
 */
router.delete("/:id", excluirProduto)

export default router
