import pool from "../config/db.js"

/**
 * Formata uma linha do banco para o padrão da API.
 */
function formatarGasto(row) {
    return {
        id: row.ID_gasto,
        descricao: row.descri_gasto,
        data: row.data_gasto,
        valor: row.valor_gasto,
        categoria: row.categoria ?? null,   // ← nullable
        observacao: row.observacao ?? null
    }
}

/**
 * Cria um novo gasto no banco de dados.
 */
export async function criarGasto(dadosGasto) {
    const { descricao, data, valor, categoria, observacao, fk_usuario_gasto } = dadosGasto

    const sql = `
        INSERT INTO gasto (descri_gasto, data_gasto, valor_gasto, categoria, observacao, fk_usuario_gasto)
        VALUES (?, ?, ?, ?, ?, ?)
    `

    const [result] = await pool.execute(sql, [descricao, data, valor, categoria ?? null, observacao ?? null, fk_usuario_gasto])

    return result.insertId
}

/**
 * Deleta um gasto pelo ID.
 */
export async function deletarGasto(ID_gasto) {
    const sql = `
        DELETE FROM gasto
        WHERE ID_gasto = ?
    `

    const [result] = await pool.execute(sql, [ID_gasto])

    return result.affectedRows > 0
}

/**
 * Seleciona todos os gastos ordenados por data decrescente.
 */
export async function selectGastos(idUsuario) {
    const sql = `
        SELECT * FROM gasto
        WHERE fk_usuario_gasto = ?
        ORDER BY data_gasto DESC
    `

    const [gastos] = await pool.execute(sql, [idUsuario])

    return gastos.map(formatarGasto)
}

/**
 * Seleciona um gasto específico pelo ID.
 */
export async function selectGastoPorId(ID_gasto) {
    const sql = `
        SELECT * FROM gasto
        WHERE ID_gasto = ?
    `

    const [gastos] = await pool.execute(sql, [ID_gasto])

    return gastos[0] ? formatarGasto(gastos[0]) : null
}

/**
 * Atualiza apenas os campos enviados.
 * Mapeia os nomes da API para as colunas reais do banco.
 */
export async function updateGasto(ID_gasto, dadosGasto) {
    const mapeamento = {
        descricao: "descri_gasto",
        data: "data_gasto",
        valor: "valor_gasto",
        categoria: "categoria",
        observacao: "observacao"
    }

    const setClauses = []
    const valores = []

    for (const [campo, coluna] of Object.entries(mapeamento)) {
        if (dadosGasto[campo] !== undefined) {
            setClauses.push(`${coluna} = ?`)
            valores.push(dadosGasto[campo])
        }
    }

    if (setClauses.length === 0) return false

    const sql = `
        UPDATE gasto
        SET ${setClauses.join(", ")}
        WHERE ID_gasto = ?
    `

    valores.push(ID_gasto)

    console.log(`📝 SQL gerado: UPDATE gasto SET ${setClauses.join(", ")} WHERE ID_gasto = ?`)
    console.log(`📝 Valores: ${valores}`)

    const [result] = await pool.execute(sql, valores)

    return result.affectedRows > 0
}
