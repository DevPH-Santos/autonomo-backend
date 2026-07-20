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
const router = Router();

/**
 * POST /produtos
 * Cria um novo produto
 * Requer autenticação
 *
 * Body:
 * {
 *   "nome_produto": "Detergente",
 *   "quantidade_produto": 10,
 *   "valor_produto": 15.90,
 *   "unidade_medida": "Litro"
 * }
 */
router.post("/", autenticar, registrarProduto);

/**
 * GET /produtos
 * Lista todos os produtos do usuário autenticado
 * Requer autenticação
 */
router.get("/", autenticar, listarProdutos);

/**
 * GET /produtos/:id
 * Obtém dados de um produto específico
 * Usado para preencher modal de edição
 */
router.get("/:id", obterProduto);

/**
 * PUT /produtos/:id
 * Atualiza dados de um produto
 *
 * Body: (enviar apenas os campos que deseja atualizar)
 * {
 *   "nome_produto": "Detergente Neutro",
 *   "quantidade_produto": 20,
 *   "valor_produto": 18.50,
 *   "unidade_medida": "Litro"
 * }
 */
router.put("/:id", editarProduto);

/**
 * DELETE /produtos/:id
 * Deleta um produto
 */
router.delete("/:id", excluirProduto);

export default router;
