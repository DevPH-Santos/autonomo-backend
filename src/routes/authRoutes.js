import { Router } from "express"
import { registrarUsuario, autenticarUsuario } from "../controllers/authController.js"

/**
 * Agrupa todas as rotas relacionadas à autenticação.
 *
 * Este router será registrado no app.js com o prefixo /auth.
 * Exemplo final da rota: POST /auth/cadastro
*/
const router = Router()

/**
 * Rota responsável pelo cadastro de usuários.
 *
 * Espera receber no corpo da requisição:
 * {
 *   "nome": "Pedro",
 *   "email": "pedro@email.com",
 *   "senha": "123456"
 * }
*/
router.post("/cadastro", registrarUsuario)

/**
 * Rota responsável pelo login de usuários.
 *
 * Espera receber no corpo da requisição:
 * {
 *   "email": "pedro@email.com",
 *   "senha": "123456"
 * }
*/
router.post("/login", autenticarUsuario)

export default router
