import pool from "../config/db.js"

function formatarLembrete(row) {
    return {
        id: row.ID_lembrete,
        titulo: row.titulo_lembrete,
        descricao: row.descri_lembrete,
        tipo: row.tipo_lembrete,
        status: row.status_lembrete,
        prioridade: row.prioridade_lembrete,
        data: row.data_lembrete
    }
}

export async function criarLembrete(dadosLembrete) {
    const {
        titulo,
        descricao,
        tipo,
        status,
        prioridade,
        data,
        fk_usuario_lembrete
    } = dadosLembrete

    const sql = `
        INSERT INTO lembrete (
            titulo_lembrete,
            descri_lembrete,
            tipo_lembrete,
            status_lembrete,
            prioridade_lembrete,
            data_lembrete,
            fk_usuario_lembrete
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `

    const [result] = await pool.execute(sql, [
        titulo,
        descricao,
        tipo,
        status,
        prioridade,
        data,
        fk_usuario_lembrete
    ])

    return result.insertId
}

export async function selectLembretes(idUsuario) {
    const sql = `
        SELECT *
        FROM lembrete
        WHERE fk_usuario_lembrete = ?
        ORDER BY
            CASE
                WHEN status_lembrete = 'Atrasado' THEN 0
                WHEN status_lembrete = 'Pendente' THEN 1
                ELSE 2
            END,
            data_lembrete ASC
    `

    const [lembretes] = await pool.execute(sql, [idUsuario])

    return lembretes.map(formatarLembrete)
}

export async function selectLembretePorId(ID_lembrete, idUsuario) {
    const sql = `
        SELECT *
        FROM lembrete
        WHERE ID_lembrete = ? AND fk_usuario_lembrete = ?
    `

    const [lembretes] = await pool.execute(sql, [ID_lembrete, idUsuario])

    return lembretes[0] ? formatarLembrete(lembretes[0]) : null
}

export async function updateLembrete(ID_lembrete, idUsuario, dadosLembrete) {
    const mapeamento = {
        titulo: "titulo_lembrete",
        titulo_lembrete: "titulo_lembrete",
        descricao: "descri_lembrete",
        descri_lembrete: "descri_lembrete",
        descricao_lembrete: "descri_lembrete",
        tipo: "tipo_lembrete",
        tipo_lembrete: "tipo_lembrete",
        status: "status_lembrete",
        status_lembrete: "status_lembrete",
        prioridade: "prioridade_lembrete",
        prioridade_lembrete: "prioridade_lembrete",
        data: "data_lembrete",
        data_lembrete: "data_lembrete"
    }

    const setClauses = []
    const valores = []

    for (const [campo, coluna] of Object.entries(mapeamento)) {
        if (dadosLembrete[campo] !== undefined) {
            setClauses.push(`${coluna} = ?`)
            valores.push(dadosLembrete[campo])
        }
    }

    if (setClauses.length === 0) return false

    const sql = `
        UPDATE lembrete
        SET ${setClauses.join(", ")}
        WHERE ID_lembrete = ? AND fk_usuario_lembrete = ?
    `

    valores.push(ID_lembrete, idUsuario)

    const [result] = await pool.execute(sql, valores)

    return result.affectedRows > 0
}

export async function deletarLembrete(ID_lembrete, idUsuario) {
    const sql = `
        DELETE FROM lembrete
        WHERE ID_lembrete = ? AND fk_usuario_lembrete = ?
    `

    const [result] = await pool.execute(sql, [ID_lembrete, idUsuario])

    return result.affectedRows > 0
}
