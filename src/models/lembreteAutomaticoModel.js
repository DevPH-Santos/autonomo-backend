import pool from "../config/db.js"

export async function salvarAutomatico(lembrete) {
    const sql = `
        INSERT INTO lembrete (
            titulo_lembrete, descri_lembrete, status_lembrete, data_lembrete,
            tipo_lembrete, categoria_lembrete, prioridade_lembrete, ID_user,
            origem_lembrete, tipo_notificacao_origem, id_evento_origem, chave_idempotencia
        ) VALUES (?, ?, 'Pendente', ?, ?, ?, 'média', ?, 'automatico', ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            titulo_lembrete = VALUES(titulo_lembrete),
            descri_lembrete = VALUES(descri_lembrete),
            data_lembrete = VALUES(data_lembrete),
            tipo_lembrete = VALUES(tipo_lembrete),
            categoria_lembrete = VALUES(categoria_lembrete),
            chave_idempotencia = VALUES(chave_idempotencia)
    `
    await pool.execute(sql, [
        lembrete.titulo, lembrete.descricao, lembrete.dataProgramada,
        lembrete.tipoLembrete, lembrete.categoria, lembrete.idUsuario,
        lembrete.tipoNotificacao, lembrete.idEventoOrigem, lembrete.chaveIdempotencia
    ])
}


export async function removerAutomaticos(tipoNotificacao, idEventoOrigem, idUsuario) {
    const [result] = await pool.execute(`
        DELETE FROM lembrete
        WHERE origem_lembrete = 'automatico'
          AND tipo_notificacao_origem = ?
          AND id_evento_origem = ?
          AND ID_user = ?
    `, [tipoNotificacao, idEventoOrigem, idUsuario])
    return result.affectedRows
}

