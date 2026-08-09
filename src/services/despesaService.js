import {
    criarGasto,
    deletarGasto as deletarGastoModel,
    updateGasto
} from "../models/despesaModel.js"

/**
 * Service responsável pelo cadastro de gastos.
 */
export async function cadastrarGasto(dadosGasto) {
    try {
        if (!dadosGasto.descricao || dadosGasto.descricao.trim() === "") {
            const erro = new Error("Descrição do gasto é obrigatória.")
            erro.statusCode = 400
            throw erro
        }

        if (!dadosGasto.data) {
            const erro = new Error("Data do gasto é obrigatória.")
            erro.statusCode = 400
            throw erro
        }

        if (dadosGasto.valor === undefined || dadosGasto.valor === null) {
            const erro = new Error("Valor do gasto é obrigatório.")
            erro.statusCode = 400
            throw erro
        }

        if (isNaN(Number(dadosGasto.valor)) || Number(dadosGasto.valor) < 0) {
            const erro = new Error("Valor do gasto deve ser um número positivo.")
            erro.statusCode = 400
            throw erro
        }

        const idGasto = await criarGasto(dadosGasto)

        return {
            id: idGasto,
            descricao: dadosGasto.descricao,
            data: dadosGasto.data,
            valor: dadosGasto.valor
        }

    } catch (error) {
        console.error("❌ Erro em cadastrarGasto:", error.message)
        throw error
    }
}

/**
 * Service para atualizar um gasto.
 */
export async function atualizarGasto(ID_gasto, dadosGasto) {
    try {
        if (!ID_gasto) {
            const erro = new Error("ID do gasto é obrigatório.")
            erro.statusCode = 400
            throw erro
        }

        if (dadosGasto.valor !== undefined && (isNaN(Number(dadosGasto.valor)) || Number(dadosGasto.valor) < 0)) {
            const erro = new Error("Valor do gasto deve ser um número positivo.")
            erro.statusCode = 400
            throw erro
        }

        console.log(`🔄 Atualizando gasto ID: ${ID_gasto}`)
        const atualizado = await updateGasto(ID_gasto, dadosGasto)

        if (!atualizado) {
            const erro = new Error("Gasto não encontrado.")
            erro.statusCode = 404
            throw erro
        }

        return {
            mensagem: "Gasto atualizado com sucesso.",
            id: ID_gasto
        }

    } catch (error) {
        console.error("❌ Erro em atualizarGasto:", error.message)
        throw error
    }
}

/**
 * Service para deletar um gasto.
 */
export async function deletarGasto(ID_gasto) {
    try {
        if (!ID_gasto) {
            const erro = new Error("ID do gasto é obrigatório.")
            erro.statusCode = 400
            throw erro
        }

        console.log(`🗑️ Deletando gasto ID: ${ID_gasto}`)
        const deletado = await deletarGastoModel(ID_gasto)

        if (!deletado) {
            const erro = new Error("Gasto não encontrado.")
            erro.statusCode = 404
            throw erro
        }

        return {
            mensagem: "Gasto deletado com sucesso."
        }

    } catch (error) {
        console.error("❌ Erro em deletarGasto:", error.message)
        throw error
    }
}
