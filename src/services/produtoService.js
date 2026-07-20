import {
    criarProduto,
    deletarProduto as deletarProdutoModel,
    updateProduto
} from "../models/produtoModel.js"

/**
 * Service responsável pelo cadastro de produtos.
 */
export async function cadastrarProduto(dadosProduto) {

    try {
        // Validações
        if (!dadosProduto.nome_produto || dadosProduto.nome_produto.trim() === "") {
            const erro = new Error("Nome do produto é obrigatório.")
            erro.statusCode = 400
            throw erro
        }

        const idProduto = await criarProduto(dadosProduto)

        return {
            id: idProduto,
            nome: dadosProduto.nome_produto,
            quantidade: dadosProduto.quantidade_produto,
            valor: dadosProduto.valor_produto,
            unidadeMedida: dadosProduto.unidade_medida
        }

    } catch (error) {
        console.error("❌ Erro em cadastrarProduto:", error.message)
        throw error
    }
}

/**
 * Service para atualizar um produto.
 */
export async function atualizarProduto(ID_produto, dadosProduto) {

    try {
        if (!ID_produto) {
            const erro = new Error("ID do produto é obrigatório.")
            erro.statusCode = 400
            throw erro
        }

        console.log(`🔄 Atualizando produto ID: ${ID_produto}`)
        const atualizado = await updateProduto(ID_produto, dadosProduto)

        if (!atualizado) {
            const erro = new Error("Produto não encontrado.")
            erro.statusCode = 404
            throw erro
        }

        return {
            mensagem: "Produto atualizado com sucesso.",
            id: ID_produto
        }

    } catch (error) {
        console.error("❌ Erro em atualizarProduto:", error.message)
        throw error
    }
}

/**
 * Service para deletar um produto.
 */
export async function deletarProduto(ID_produto) {

    try {
        if (!ID_produto) {
            const erro = new Error("ID do produto é obrigatório.")
            erro.statusCode = 400
            throw erro
        }

        console.log(`🗑️ Deletando produto ID: ${ID_produto}`)
        const deletado = await deletarProdutoModel(ID_produto)

        if (!deletado) {
            const erro = new Error("Produto não encontrado.")
            erro.statusCode = 404
            throw erro
        }

        return {
            mensagem: "Produto deletado com sucesso."
        }

    } catch (error) {
        console.error("❌ Erro em deletarProduto:", error.message)
        throw error
    }
}
