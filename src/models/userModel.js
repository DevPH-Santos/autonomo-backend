import pool from "../config/db.js"

/**
 * Busca um usuário pelo email.
 *
 * Essa função será usada no cadastro para verificar se o email já existe
 * e também no login para recuperar a senha criptografada do usuário.
 *
 * @param {string} email - Email informado pelo usuário.
 * @returns {Promise<object|null>} Retorna o usuário encontrado ou null.
 */
export async function buscarUsuarioPorEmail(email) {
    /**
    * Query parametrizada para evitar SQL Injection.
    * O ? será substituído pelo valor de email de forma segura pelo mysql2.
    */

    const sql = `

        SELECT ID_user, nome_user, email_user, senha_user
        FROM usuario
        WHERE email_user = ?
        LIMIT 1

    `
    const [rows] = await pool.execute(sql, [email])
    return rows[0] || null

}

/**
 * Cria um novo usuário no banco de dados.
 *
 * A senha recebida aqui já deve estar criptografada pelo service.
 * O model não deve saber gerar hash; ele só executa queries.
 *
 * @param {string} nome - Nome do usuário.
 * @param {string} email - Email único do usuário.
 * @param {string} senhaHash - Senha criptografada com bcrypt.
 * @returns {Promise<number>} ID do usuário criado.
 */
export async function criarUsuario(nome, email, senhaHash) {
    /**
    * Insere o usuário usando placeholders para proteger os dados enviados.
    */

    const sql = `
    
        INSERT INTO usuario(nome_user, email_user, senha_user)
        VALUES(?, ?, ?)
    
    `

    const [result] = await pool.execute(sql, [nome, email, senhaHash])

    return result.insertId

}
