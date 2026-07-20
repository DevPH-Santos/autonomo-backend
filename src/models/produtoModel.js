import pool from "../config/db.js"

/**
 * Cria um novo produto no banco de dados.
 */
export async function criarProduto(dadosProduto) {
    const {
        nome_produto,
        quantidade_produto,
        valor_produto,
        unidade_medida,
        fk_usuario_produto
    } = dadosProduto

    const sql = `
        INSERT INTO produto(
            nome_produto,
            quantidade_produto,
            valor_produto,
            unidade_medida,
            fk_usuario_produto
        )
        VALUES (?, ?, ?, ?, ?)
    `

    const [result] = await pool.execute(sql, [
        nome_produto,
        quantidade_produto,
        valor_produto,
        unidade_medida,
        fk_usuario_produto
    ])

    return result.insertId
}

/**
 * Deleta um produto pelo ID.
 */
export async function deletarProduto(ID_produto) {
    const sql = `
        DELETE FROM produto
        WHERE ID_produto = ?
    `

    const [result] = await pool.execute(sql, [ID_produto])

    return result.affectedRows > 0
}

/**
 * Seleciona todos os produtos do usuário.
 */
export async function selectProduto(idUsuario) {
    const sql = `
        SELECT * FROM produto
        WHERE fk_usuario_produto = ?
    `

    const [produtos] = await pool.execute(sql, [idUsuario])

    return produtos
}

/**
 * Seleciona um produto específico pelo ID.
 */
export async function preencherCamposProduto(ID_produto) {
    const sql = `
        SELECT * FROM produto
        WHERE ID_produto = ?
    `

    const [produtos] = await pool.execute(sql, [ID_produto])

    return produtos[0] || null
}

/**
 * Atualiza apenas os campos enviados.
 */
export async function updateProduto(ID_produto, dadosProduto) {

    const camposDisponiveis = [
        "nome_produto",
        "quantidade_produto",
        "valor_produto",
        "unidade_medida"
    ]

    const camposAtualizacao = {}
    const valores = []

    for (const campo of camposDisponiveis) {
        if (dadosProduto[campo] !== undefined) {
            camposAtualizacao[campo] = dadosProduto[campo]
            valores.push(dadosProduto[campo])
        }
    }

    if (Object.keys(camposAtualizacao).length === 0) {
        return false
    }

    const setClauses = Object.keys(camposAtualizacao)
        .map(campo => `${campo} = ?`)
        .join(", ")

    const sql = `
        UPDATE produto
        SET ${setClauses}
        WHERE ID_produto = ?
    `

    valores.push(ID_produto)

    console.log(`📝 SQL gerado: UPDATE produto SET ${setClauses} WHERE ID_produto = ?`)
    console.log(`📝 Valores: ${valores}`)

    const [result] = await pool.execute(sql, valores)

    return result.affectedRows > 0
}
