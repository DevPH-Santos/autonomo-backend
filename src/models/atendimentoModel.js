import pool from "../config/db.js"

/**
 * Cria um novo atendimento no banco de dados.
 * Nota: ID_pgto pode ser null inicialmente, será linkado depois se necessário.
 */
export async function criarAtendimento(dadosAtendimento) {
    const {
        data_atendimento,
        status_atendimento,
        total_atendimento,
        descri_atendimento,
        ID_user,
        ID_cliente,
        ID_pgto = null
    } = dadosAtendimento

    const sql = `
        INSERT INTO atendimento(
            data_atendimento,
            status_atendimento,
            total_atendimento,
            descri_atendimento,
            ID_user,
            ID_cliente,
            ID_pgto
        )
        VALUES(?, ?, ?, ?, ?, ?, ?)
    `

    const [result] = await pool.execute(sql, [
        data_atendimento,
        status_atendimento,
        total_atendimento,
        descri_atendimento,
        ID_user,
        ID_cliente,
        ID_pgto
    ])

    return result.insertId
}

/**
 * Deleta um atendimento pelo ID.
 * Cascata remove automaticamente registros em tabela 'utiliza'.
 */
export async function deletarAtendimento(ID_atendimento) {
    const sql = `
        DELETE FROM atendimento
        WHERE ID_atendimento = ?
    `

    const [result] = await pool.execute(sql, [ID_atendimento])
    
    return result.affectedRows > 0
}

/**
 * Seleciona todos os atendimentos de um usuário específico.
 */
export async function selectAtendimento(idUsuario) {
    const sql = `
        SELECT * FROM atendimento
        WHERE ID_user = ?
        ORDER BY data_atendimento DESC
    `

    const [atendimentos] = await pool.execute(sql, [idUsuario])
    
    return atendimentos
}

/**
 * Seleciona um atendimento específico pelo ID.
 * Retorna também os produtos utilizados.
 */
export async function preencherCamposAtendimento(ID_atendimento) {
    const sql = `
        SELECT * FROM atendimento
        WHERE ID_atendimento = ?
    `

    const [atendimentos] = await pool.execute(sql, [ID_atendimento])
    
    return atendimentos[0] || null
}

/**
 * Atualiza apenas os campos que foram realmente enviados.
 * Evita o erro de undefined nos parâmetros do SQL.
 */
export async function updateAtendimento(ID_atendimento, dadosAtendimento) {
    // Lista de todos os campos possíveis
    const camposDisponiveis = [
        "data_atendimento",
        "status_atendimento",
        "total_atendimento",
        "descri_atendimento",
        "ID_cliente",
        "ID_pgto"
    ]

    // Filtra apenas os campos que foram realmente enviados
    const camposAtualizacao = {}
    const valores = []

    for (const campo of camposDisponiveis) {
        if (dadosAtendimento[campo] !== undefined) {
            camposAtualizacao[campo] = dadosAtendimento[campo]
            valores.push(dadosAtendimento[campo])
        }
    }

    // Se nenhum campo foi enviado, retorna false
    if (Object.keys(camposAtualizacao).length === 0) {
        return false
    }

    // Constrói dinamicamente a query SET
    const setClauses = Object.keys(camposAtualizacao)
        .map(campo => `${campo} = ?`)
        .join(", ")

    const sql = `
        UPDATE atendimento
        SET ${setClauses}
        WHERE ID_atendimento = ?
    `

    // Adiciona o ID ao final do array de valores
    valores.push(ID_atendimento)

    console.log(`📝 SQL gerado: UPDATE atendimento SET ${setClauses} WHERE ID_atendimento = ?`)
    console.log(`📝 Valores: ${valores}`)

    const [result] = await pool.execute(sql, valores)

    return result.affectedRows > 0
}

/**
 * Adiciona múltiplos produtos a um atendimento.
 * Recebe array de produtos com ID_produto.
 */
export async function adicionarProdutosAtendimento(ID_atendimento, produtos) {
    if (!Array.isArray(produtos) || produtos.length === 0) {
        return false
    }

    try {
        for (const produto of produtos) {
            const { ID_produto } = produto
            
            if (!ID_produto) continue

            const sql = `
                INSERT INTO utiliza(ID_produto, ID_atendimento)
                VALUES(?, ?)
            `

            await pool.execute(sql, [ID_produto, ID_atendimento])
        }
        return true
    } catch (erro) {
        console.error("❌ Erro ao adicionar produtos:", erro)
        return false
    }
}

/**
 * Remove um produto específico de um atendimento.
 */
export async function removerProdutoAtendimento(ID_atendimento, ID_produto) {
    const sql = `
        DELETE FROM utiliza
        WHERE ID_atendimento = ? AND ID_produto = ?
    `

    const [result] = await pool.execute(sql, [ID_atendimento, ID_produto])
    
    return result.affectedRows > 0
}

/**
 * Busca todos os produtos utilizados em um atendimento.
 * Retorna informações do produto (nome, valor, quantidade).
 */
export async function buscarProdutosAtendimento(ID_atendimento) {
    const sql = `
        SELECT 
            p.ID_produto,
            p.nome_produto,
            p.valor_produto,
            p.quantidade_produto,
            p.unidade_medida
        FROM produto p
        INNER JOIN utiliza u ON p.ID_produto = u.ID_produto
        WHERE u.ID_atendimento = ?
    `

    const [produtos] = await pool.execute(sql, [ID_atendimento])
    
    return produtos
}

/**
 * Remove todos os produtos de um atendimento.
 * Útil ao deletar um atendimento ou ao substituir a lista de produtos.
 */
export async function removerTodosProdutosAtendimento(ID_atendimento) {
    const sql = `
        DELETE FROM utiliza
        WHERE ID_atendimento = ?
    `

    const [result] = await pool.execute(sql, [ID_atendimento])
    
    return result.affectedRows > 0
}

/**
 * Busca clientes do usuário com filtro de busca por termo.
 * Usado para autocomplete no frontend.
 */
export async function buscarClientesPorTermo(idUsuario, termo) {
    const sql = `
        SELECT ID_cliente, nome_cliente
        FROM cliente
        WHERE fk_usuario_cliente = ? 
        AND nome_cliente LIKE ?
        LIMIT 10
    `

    const [clientes] = await pool.execute(sql, [idUsuario, `%${termo}%`])
    
    return clientes
}

/**
 * Busca produtos do usuário com filtro de busca por termo.
 * Usado para autocomplete no frontend.
 */
export async function buscarProdutosPorTermo(idUsuario, termo) {
    const sql = `
        SELECT ID_produto, nome_produto, valor_produto
        FROM produto
        WHERE fk_usuario_produto = ? 
        AND nome_produto LIKE ?
        LIMIT 10
    `

    const [produtos] = await pool.execute(sql, [idUsuario, `%${termo}%`])
    
    return produtos
}

/**
 * Busca um atendimento completo com todas suas informações relacionadas.
 * Inclui dados do cliente e produtos utilizados.
 */
export async function buscarAtendimentoCompleto(ID_atendimento) {
    const sql = `
        SELECT 
            a.*,
            c.nome_cliente,
            c.telefone_cliente,
            c.email_cliente,
            u.nome_user as nome_usuario
        FROM atendimento a
        LEFT JOIN cliente c ON a.ID_cliente = c.ID_cliente
        LEFT JOIN usuario u ON a.ID_user = u.ID_user
        WHERE a.ID_atendimento = ?
    `

    const [atendimento] = await pool.execute(sql, [ID_atendimento])
    
    if (atendimento.length === 0) {
        return null
    }

    // Busca os produtos também
    const produtos = await buscarProdutosAtendimento(ID_atendimento)
    
    return {
        ...atendimento[0],
        produtos
    }
}

/**
 * Lista atendimentos de um usuário com dados do cliente.
 * Usado para listagem na dashboard.
 */
export async function listarAtendimentosComCliente(idUsuario) {
    const sql = `
        SELECT 
            a.ID_atendimento,
            a.data_atendimento,
            a.status_atendimento,
            a.total_atendimento,
            a.descri_atendimento,
            c.nome_cliente,
            c.telefone_cliente,
            COUNT(u.ID_produto) as quantidade_produtos
        FROM atendimento a
        LEFT JOIN cliente c ON a.ID_cliente = c.ID_cliente
        LEFT JOIN utiliza u ON a.ID_atendimento = u.ID_atendimento
        WHERE a.ID_user = ?
        GROUP BY a.ID_atendimento
        ORDER BY a.data_atendimento DESC
    `

    const [atendimentos] = await pool.execute(sql, [idUsuario])
    
    return atendimentos
}

/**
 * Atualiza a lista de produtos de um atendimento.
 * Remove os antigos e adiciona os novos.
 */
export async function atualizarProdutosAtendimento(ID_atendimento, novosProdutos) {
    try {
        // Remove os produtos antigos
        await removerTodosProdutosAtendimento(ID_atendimento)
        
        // Adiciona os novos
        await adicionarProdutosAtendimento(ID_atendimento, novosProdutos)
        
        return true
    } catch (erro) {
        console.error("❌ Erro ao atualizar produtos:", erro)
        return false
    }
}
