import conexao from "../config/database.js";

/**
 * Seleciona todos os produtos de um usuário específico
 * @param {number} idUsuario - ID do usuário
 * @returns {Promise<Array>} Lista de produtos do usuário
 */
export async function selectProduto(idUsuario) {
    try {
        const sql = `
            SELECT ID_produto, nome_produto, quantidade_produto, 
                   valor_produto, unidade_medida, fk_usuario_produto
            FROM produto 
            WHERE fk_usuario_produto = ?
            ORDER BY nome_produto ASC
        `

        const [produtos] = await conexao.promise().query(sql, [idUsuario])

        return produtos

    } catch (error) {
        console.error("❌ Erro em selectProduto (model):", error)
        throw {
            statusCode: 500,
            message: "Erro ao listar produtos"
        }
    }
}

/**
 * Preenche todos os campos de um produto específico pelo ID
 * @param {number} idProduto - ID do produto
 * @returns {Promise<Object>} Dados completos do produto
 */
export async function preencherCamposProduto(idProduto) {
    try {
        const sql = `
            SELECT ID_produto, nome_produto, quantidade_produto, 
                   valor_produto, unidade_medida, fk_usuario_produto
            FROM produto 
            WHERE ID_produto = ?
        `

        const [resultado] = await conexao.promise().query(sql, [idProduto])

        // Retorna o primeiro resultado ou null se não encontrado
        return resultado.length > 0 ? resultado[0] : null

    } catch (error) {
        console.error("❌ Erro em preencherCamposProduto (model):", error)
        throw {
            statusCode: 500,
            message: "Erro ao obter dados do produto"
        }
    }
}

/**
 * OPCIONAL: Busca produtos por nome (útil para autocomplete)
 * @param {string} nomeProduto - Nome ou parte do nome
 * @param {number} idUsuario - ID do usuário
 * @returns {Promise<Array>} Produtos encontrados
 */
export async function buscarProdutosPorNome(nomeProduto, idUsuario) {
    try {
        const sql = `
            SELECT ID_produto, nome_produto, quantidade_produto, 
                   valor_produto, unidade_medida
            FROM produto 
            WHERE fk_usuario_produto = ? 
            AND nome_produto LIKE ?
            LIMIT 10
        `

        const [produtos] = await conexao.promise().query(sql, [
            idUsuario,
            `%${nomeProduto}%`
        ])

        return produtos

    } catch (error) {
        console.error("❌ Erro em buscarProdutosPorNome (model):", error)
        throw {
            statusCode: 500,
            message: "Erro ao buscar produtos"
        }
    }
}

/**
 * OPCIONAL: Calcula o valor total do estoque
 * @param {number} idUsuario - ID do usuário
 * @returns {Promise<number>} Valor total do estoque
 */
export async function calcularValorTotalEstoque(idUsuario) {
    try {
        const sql = `
            SELECT SUM(quantidade_produto * valor_produto) as total_estoque
            FROM produto 
            WHERE fk_usuario_produto = ?
        `

        const [resultado] = await conexao.promise().query(sql, [idUsuario])

        return resultado[0]?.total_estoque || 0

    } catch (error) {
        console.error("❌ Erro em calcularValorTotalEstoque (model):", error)
        throw {
            statusCode: 500,
            message: "Erro ao calcular valor total"
        }
    }
}
