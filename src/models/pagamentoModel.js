import pool from "../config/db.js"

/**
 * Cria um novo registro de pagamento no banco de dados.
 * Retorna o ID gerado.
 */
export async function criarPagamento(dadosPagamento) {
    const {
        valor_pgto,
        data_pgto,
        status_pgto,
        forma_pgto,
        obs_pgto = null
    } = dadosPagamento

    const sql = `
        INSERT INTO pagamento(
            valor_pgto,
            data_pgto,
            status_pgto,
            forma_pgto,
            obs_pgto
        )
        VALUES(?, ?, ?, ?, ?)
    `

    const [result] = await pool.execute(sql, [
        valor_pgto,
        data_pgto,
        status_pgto,
        forma_pgto,
        obs_pgto
    ])

    return result.insertId
}

/**
 * Busca um pagamento pelo ID, com dados do cliente e atendimento vinculado.
 */
export async function buscarPagamentoPorId(ID_pgto) {
    const sql = `
        SELECT
            p.*,
            c.nome_cliente,
            c.telefone_cliente,
            a.ID_atendimento,
            a.descri_atendimento
        FROM pagamento p
        LEFT JOIN atendimento a ON a.ID_pgto = p.ID_pgto
        LEFT JOIN cliente c ON a.ID_cliente = c.ID_cliente
        WHERE p.ID_pgto = ?
    `

    const [pagamentos] = await pool.execute(sql, [ID_pgto])
    return pagamentos[0] || null
}

/**
 * Lista todos os pagamentos de um usuário, com dados do cliente e atendimento.
 * Ordenado por data decrescente.
 */
export async function listarPagamentosDoUsuario(idUsuario) {
    const sql = `
        SELECT
            p.ID_pgto,
            p.valor_pgto,
            p.data_pgto,
            p.status_pgto,
            p.forma_pgto,
            p.obs_pgto,
            c.nome_cliente,
            c.telefone_cliente,
            a.ID_atendimento,
            a.descri_atendimento
        FROM pagamento p
        INNER JOIN atendimento a ON a.ID_pgto = p.ID_pgto
        INNER JOIN cliente c ON a.ID_cliente = c.ID_cliente
        WHERE a.ID_user = ?
        ORDER BY p.data_pgto DESC
    `

    const [pagamentos] = await pool.execute(sql, [idUsuario])
    return pagamentos
}

/**
 * Atualiza apenas os campos enviados de um pagamento.
 * Construção dinâmica do SET para evitar sobrescrever campos não enviados.
 */
export async function atualizarPagamento(ID_pgto, dadosPagamento) {
    const camposDisponiveis = [
        "valor_pgto",
        "data_pgto",
        "status_pgto",
        "forma_pgto",
        "obs_pgto"
    ]

    const camposAtualizacao = {}
    const valores = []

    for (const campo of camposDisponiveis) {
        if (dadosPagamento[campo] !== undefined) {
            camposAtualizacao[campo] = dadosPagamento[campo]
            valores.push(dadosPagamento[campo])
        }
    }

    if (Object.keys(camposAtualizacao).length === 0) {
        return false
    }

    const setClauses = Object.keys(camposAtualizacao)
        .map(campo => `${campo} = ?`)
        .join(", ")

    const sql = `
        UPDATE pagamento
        SET ${setClauses}
        WHERE ID_pgto = ?
    `

    valores.push(ID_pgto)

    console.log(`📝 SQL gerado: UPDATE pagamento SET ${setClauses} WHERE ID_pgto = ?`)
    console.log(`📝 Valores: ${valores}`)

    const [result] = await pool.execute(sql, valores)
    return result.affectedRows > 0
}

/**
 * Deleta um pagamento pelo ID.
 * Desvincula o atendimento (ID_pgto → NULL) antes de deletar,
 * pois a FK em atendimento é RESTRICT.
 */
export async function deletarPagamento(ID_pgto) {
    const sqlDesvincula = `
        UPDATE atendimento
        SET ID_pgto = NULL
        WHERE ID_pgto = ?
    `
    await pool.execute(sqlDesvincula, [ID_pgto])

    const sql = `
        DELETE FROM pagamento
        WHERE ID_pgto = ?
    `

    const [result] = await pool.execute(sql, [ID_pgto])
    return result.affectedRows > 0
}

/**
 * Vincula um pagamento já criado a um atendimento.
 * Chamado internamente após criarPagamento + criarAtendimento.
 */
export async function vincularPagamentoAoAtendimento(ID_atendimento, ID_pgto) {
    const sql = `
        UPDATE atendimento
        SET ID_pgto = ?
        WHERE ID_atendimento = ?
    `

    const [result] = await pool.execute(sql, [ID_pgto, ID_atendimento])
    return result.affectedRows > 0
}
