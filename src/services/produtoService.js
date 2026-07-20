import conexao from "../config/database.js";

/**
 * Cadastra um novo produto no banco de dados
 * @param {Object} dadosProduto - Dados do produto
 * @returns {Promise<Object>} Produto cadastrado
 */
export async function cadastrarProduto(dadosProduto) {
    try {
        const sql = `
            INSERT INTO produto 
            (nome_produto, quantidade_produto, valor_produto, unidade_medida, fk_usuario_produto)
            VALUES (?, ?, ?, ?, ?)
        `

        const [resultado] = await conexao.promise().query(sql, [
            dadosProduto.nome_produto,
            dadosProduto.quantidade_produto,
            dadosProduto.valor_produto,
            dadosProduto.unidade_medida,
            dadosProduto.fk_usuario_produto
        ])

        return {
            ID_produto: resultado.insertId,
            nome_produto: dadosProduto.nome_produto,
            quantidade_produto: dadosProduto.quantidade_produto,
            valor_produto: dadosProduto.valor_produto,
            unidade_medida: dadosProduto.unidade_medida,
            fk_usuario_produto: dadosProduto.fk_usuario_produto
        }

    } catch (error) {
        console.error("❌ Erro em cadastrarProduto (service):", error)
        throw {
            statusCode: 500,
            message: "Erro ao cadastrar produto"
        }
    }
}

/**
 * Atualiza dados de um produto
 * @param {number} idProduto - ID do produto
 * @param {Object} dadosAtualizacao - Dados a atualizar
 * @returns {Promise<Object>} Resultado da atualização
 */
export async function atualizarProduto(idProduto, dadosAtualizacao) {
    try {
        // Constrói dinamicamente a query baseado nos campos fornecidos
        const campos = []
        const valores = []

        if (dadosAtualizacao.nome_produto !== undefined) {
            campos.push("nome_produto = ?")
            valores.push(dadosAtualizacao.nome_produto)
        }
        if (dadosAtualizacao.quantidade_produto !== undefined) {
            campos.push("quantidade_produto = ?")
            valores.push(dadosAtualizacao.quantidade_produto)
        }
        if (dadosAtualizacao.valor_produto !== undefined) {
            campos.push("valor_produto = ?")
            valores.push(dadosAtualizacao.valor_produto)
        }
        if (dadosAtualizacao.unidade_medida !== undefined) {
            campos.push("unidade_medida = ?")
            valores.push(dadosAtualizacao.unidade_medida)
        }

        if (campos.length === 0) {
            return { mensagem: "Nenhum dado para atualizar" }
        }

        valores.push(idProduto)

        const sql = `UPDATE produto SET ${campos.join(", ")} WHERE ID_produto = ?`

        const [resultado] = await conexao.promise().query(sql, valores)

        if (resultado.affectedRows === 0) {
            throw {
                statusCode: 404,
                message: "Produto não encontrado"
            }
        }

        return {
            mensagem: "Produto atualizado com sucesso",
            affectedRows: resultado.affectedRows
        }

    } catch (error) {
        console.error("❌ Erro em atualizarProduto (service):", error)
        throw error.statusCode 
            ? error 
            : { statusCode: 500, message: "Erro ao atualizar produto" }
    }
}

/**
 * Deleta um produto
 * @param {number} idProduto - ID do produto
 * @returns {Promise<Object>} Resultado da deleção
 */
export async function deletarProduto(idProduto) {
    try {
        const sql = "DELETE FROM produto WHERE ID_produto = ?"

        const [resultado] = await conexao.promise().query(sql, [idProduto])

        if (resultado.affectedRows === 0) {
            throw {
                statusCode: 404,
                message: "Produto não encontrado"
            }
        }

        return {
            mensagem: "Produto deletado com sucesso",
            affectedRows: resultado.affectedRows
        }

    } catch (error) {
        console.error("❌ Erro em deletarProduto (service):", error)
        throw error.statusCode 
            ? error 
            : { statusCode: 500, message: "Erro ao deletar produto" }
    }
}
