import bcrypt from "bcrypt"
import { buscarUsuarioPorEmail, criarUsuario } from "../models/userModel.js"
import jwt from "jsonwebtoken"

/**
 * Define o custo do hash da senha.
 *
 * Quanto maior o número, mais seguro e mais lento fica o processo.
 * O valor 10 é um equilíbrio comum para projetos web.
*/
const SALT_ROUNDS = 10

/**
 * Valida se o email tem um formato básico válido.
 *
 * Essa validação não confirma se a caixa de email realmente existe.
 * Ela apenas impede formatos inválidos, como "pedro@", "abc.com" ou texto vazio.
 *
 * @param {string} email - Email que será validado.
 * @returns {boolean} Retorna true se o formato for válido.
*/

function validarFormatoEmail(email) {

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    return regexEmail.test(email)

}

/**
 * Cadastra um novo usuário no sistema.
 *
 * Essa função concentra as regras de negócio do cadastro:
 * valida os dados recebidos, verifica se o email já existe,
 * criptografa a senha e chama o model para salvar no banco.
 *
 * @param {object} dadosUsuario - Dados enviados pelo controller.
 * @param {string} dadosUsuario.nome - Nome do usuário.
 * @param {string} dadosUsuario.email - Email do usuário.
 * @param {string} dadosUsuario.senha - Senha original informada pelo usuário.
 * @returns {Promise<object>} Dados públicos do usuário criado.
*/

export async function cadastrarUsuario({ nome, email, senha }) {

    /**
     * Normaliza os dados antes de validar e salvar.
     * O email é salvo em minúsculo para evitar duplicidade como:
     * "Pedro@email.com" e "pedro@email.com".
    */
    const nomeTratado = nome?.trim()
    const emailTratado = email?.trim().toLowerCase()

    if (!nomeTratado || !emailTratado || !senha) {
        const erro = new Error("Nome, email e senha são obrigatórios.")
        erro.statusCode = 400
        throw erro
    }

    if (!validarFormatoEmail(emailTratado)) {
        const erro = new Error("Email inválido.")
        erro.statusCode = 400
        throw erro
    }

    if (senha.length < 6) {
        const erro = new Error("A senha deve ter no mínimo 6 caracteres.")
        erro.statusCode = 400
        throw erro
    }

    const usuarioExistente = await buscarUsuarioPorEmail(emailTratado)

    if (usuarioExistente) {
        const erro = new Error("Email já cadastrado.")
        erro.statusCode = 409
        throw erro
    }

    /**
     * Gera o hash da senha antes de salvar.
     * A senha original nunca deve ser gravada no banco.
    */

    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS)

    const idUsuario = await criarUsuario(nomeTratado, emailTratado, senhaHash)

    /**
     * Retorna apenas dados públicos.
     * Nunca retornamos senha, nem mesmo a senha criptografada.
    */

    return {
        id: idUsuario,
        nome: nomeTratado,
        email: emailTratado,
    }

}

/**
 * Realiza o login de um usuário.
 *
 * Essa função valida os dados recebidos, busca o usuário pelo email,
 * compara a senha informada com a senha criptografada no banco
 * e gera um token JWT caso as credenciais estejam corretas.
 *
 * @param {object} dadosLogin - Dados enviados pelo controller.
 * @param {string} dadosLogin.email - Email do usuário.
 * @param {string} dadosLogin.senha - Senha original informada pelo usuário.
 * @returns {Promise<object>} Token JWT e dados públicos do usuário.
*/
export async function loginUsuario({ email, senha }) {

    /**
     * Normaliza o email antes de buscar no banco.
     * Isso evita diferença entre "Pedro@email.com" e "pedro@email.com".
    */
    const emailTratado = email?.trim().toLowerCase()

    if (!emailTratado || !senha) {
        const erro = new Error("Email e senha são obrigatórios.")
        erro.statusCode = 400
        throw erro
    }

    if (!validarFormatoEmail(emailTratado)) {
        const erro = new Error("Email inválido.")
        erro.statusCode = 400
        throw erro
    }

    /**
     * Busca o usuário pelo email.
     * A query usada aqui vem do model e retorna também senha_user,
     * porque precisamos comparar com a senha digitada.
    */
    const usuario = await buscarUsuarioPorEmail(emailTratado)

    if (!usuario) {
        const erro = new Error("Email ou senha inválidos.")
        erro.statusCode = 401
        throw erro
    }

    /**
      * Compara a senha enviada com o hash salvo no banco.
      * Nunca comparamos senha pura diretamente no SQL.
    */
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_user)

    if (!senhaCorreta) {
        const erro = new Error("Email ou senha inválidos.")
        erro.statusCode = 401
        throw erro
    }

    /**
     * Gera um token JWT com dados mínimos do usuário.
     * O token será usado depois para acessar rotas protegidas.
    */
    const token = jwt.sign(
        { id: usuario.ID_user },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    /**
     * Retorna o token e apenas dados públicos do usuário.
     * A senha nunca deve sair da API.
    */
    return {
        token,
        usuario: {
            id: usuario.ID_user,
            nome: usuario.nome_user,
            email: usuario.email_user
        }
    }

}
