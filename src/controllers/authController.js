import { cadastrarUsuario, loginUsuario } from "../services/authService.js"

/**
 * Controller responsável por cadastrar um novo usuário.
 *
 * Ele recebe os dados da requisição, envia para o service aplicar
 * as regras de negócio e devolve uma resposta HTTP para o cliente.
 *
 * @param {object} req - Objeto da requisição HTTP.
 * @param {object} res - Objeto usado para enviar a resposta HTTP.
 * @returns {Promise<object>} Resposta JSON com o usuário criado ou erro.
*/
export async function registrarUsuario(req, res) {
    try {
        /**
         * Extrai os dados enviados no corpo da requisição.
         * Esperamos receber: nome, email e senha.
        */
        const { nome, email, senha } = req.body

        /**
         * Chama o service, que valida os dados, verifica email duplicado,
         * gera o hash da senha e salva o usuário no banco.
        */
        const usuarioCriado = await cadastrarUsuario({ nome, email, senha })

        /**
         * Retorna status 201 porque um novo recurso foi criado.
         * Nunca retornamos senha na resposta.
        */
        return res.status(201).json({
            mensagem: "Usuário cadastrado com sucesso.",
            usuario: usuarioCriado,
        })

    } catch (error) {
        /**
         * Usa o statusCode definido no service.
         * Se o erro não tiver statusCode, tratamos como erro interno do servidor.
        */
        const statusCode = error.statusCode || 500

        /**
         * Evita expor detalhes técnicos para o usuário final em erros inesperados.
        */
        const mensagem =
            statusCode === 500
                ? "Erro interno do servidor."
                : error.message

        return res.status(statusCode).json({
            erro: mensagem
        })

    }
}

/**
 * Controller responsável por autenticar um usuário.
 *
 * Ele recebe email e senha, envia para o service validar as credenciais
 * e devolve um token JWT caso o login seja realizado com sucesso.
 *
 * @param {object} req - Objeto da requisição HTTP.
 * @param {object} res - Objeto usado para enviar a resposta HTTP.
 * @returns {Promise<object>} Resposta JSON com token e dados públicos do usuário.
*/
export async function autenticarUsuario(req, res) {
    try {
        /**
         * Extrai as credenciais enviadas pelo cliente.
        */
        const { email, senha } = req.body

        /**
         * Chama o service para validar email, senha e gerar o token JWT.
        */
        const resultadoLogin = await loginUsuario({ email, senha })

        return res.status(200).json({
            mensagem: "Login realizado com sucesso.",
            ...resultadoLogin
        })

    } catch (error) {
        /**
         * Usa o statusCode definido no service.
         * Se não existir, retorna erro interno.
        */
        const statusCode = error.statusCode || 500

        const mensagem =
            statusCode === 500
                ? "Erro interno do servidor."
                : error.message

        return res.status(statusCode).json({
            erro: mensagem
        })
    }
}
