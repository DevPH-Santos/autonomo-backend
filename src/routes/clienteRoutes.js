import { Router } from "express";
import { 
    registrarCliente, 
    listarClientes, 
    obterCliente, 
    editarCliente, 
    excluirCliente 
} from "../controllers/clienteController.js";
import { autenticar } from "../middlewares/authMiddleware.js";

/**
 * Agrupa todas as rotas relacionadas aos clientes.
 * Este router será registrado no app.js com o prefixo /clientes.
 */
const router = Router()

/**
 * POST /clientes
 * Cria um novo cliente
 * 
 * Body:
 * {
 *   "nome_cliente": "João Silva",
 *   "email_cliente": "joao@email.com",
 *   "telefone_cliente": "11999999999",
 *   "endereco_cliente": "Rua das Flores, 123",
 *   "bairro_cliente": "Centro",
 *   "frequencia_cliente": "Semanal",
 *   "tipo_contratacao_cliente": "Mensal",
 *   "valor_visita_cliente": 150.00,
 *   "status_cliente": "Ativo",
 *   "observacao_cliente": "Cliente VIP"
 * }
 */
router.post("/", registrarCliente)

/**
 * GET /clientes
 * Lista todos os clientes
 */
router.get("/", listarClientes, autenticar)

/**
 * GET /clientes/:id
 * Obtém dados de um cliente específico
 * Usado para preencher modal de edição
 */
router.get("/:id", obterCliente)

/**
 * PUT /clientes/:id
 * Atualiza dados de um cliente
 * 
 * Body: (enviar apenas os campos que deseja atualizar)
 * {
 *   "nome_cliente": "João da Silva",
 *   "email_cliente": "joao.silva@email.com",
 *   ...outros campos
 * }
 */
router.put("/:id", editarCliente)

/**
 * DELETE /clientes/:id
 * Deleta um cliente
 */
router.delete("/:id", excluirCliente)

export default router
