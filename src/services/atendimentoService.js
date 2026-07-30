import {
    criarAtendimento,
    deletarAtendimento as deletarAtendimentoModel,
    updateAtendimento,
    adicionarProdutosAtendimento,
    atualizarProdutosAtendimento,
    buscarClientesPorTermo,
    buscarProdutosPorTermo,
    buscarAtendimentoCompleto,
    preencherCamposAtendimento
} from "../models/atendimentoModel.js"

import { cadastrarPagamento } from "./pagamentoService.js"

/**
 * Service responsável pelo cadastro de atendimentos.
 */
export async function cadastrarAtendimento(dadosAtendimento) {

    try {
        // Validações
        if (!dadosAtendimento.data_atendimento || dadosAtendimento.data_atendimento.trim() === "") {
            const erro = new Error("Data do atendimento é obrigatória.")
            erro.statusCode = 400
            throw erro
        }

        if (!dadosAtendimento.status_atendimento || dadosAtendimento.status_atendimento.trim() === "") {
            const erro = new Error("Status do atendimento é obrigatório.")
            erro.statusCode = 400
            throw erro
        }

        // Valida se o status está na lista permitida
        const statusPermitidos = ["Agendado", "Em Andamento", "Pendente", "Realizado"]
        if (!statusPermitidos.includes(dadosAtendimento.status_atendimento)) {
            const erro = new Error(`Status inválido. Valores permitidos: ${statusPermitidos.join(", ")}`)
            erro.statusCode = 400
            throw erro
        }

        if (dadosAtendimento.total_atendimento === undefined || dadosAtendimento.total_atendimento === null) {
            const erro = new Error("Valor do atendimento é obrigatório.")
            erro.statusCode = 400
            throw erro
        }

        // Valida se o total é um número positivo
        const totalNumerico = parseFloat(dadosAtendimento.total_atendimento)
        if (isNaN(totalNumerico) || totalNumerico < 0) {
            const erro = new Error("Valor do atendimento deve ser um número positivo.")
            erro.statusCode = 400
            throw erro
        }

        if (!dadosAtendimento.descri_atendimento || dadosAtendimento.descri_atendimento.trim() === "") {
            const erro = new Error("Descrição do atendimento é obrigatória.")
            erro.statusCode = 400
            throw erro
        }

        if (!dadosAtendimento.ID_user) {
            const erro = new Error("ID do usuário é obrigatório.")
            erro.statusCode = 400
            throw erro
        }

        if (!dadosAtendimento.ID_cliente) {
            const erro = new Error("ID do cliente é obrigatório.")
            erro.statusCode = 400
            throw erro
        }

        // Cria o atendimento
        // Cria o pagamento automaticamente com os dados do atendimento
        const pagamentoCriado = await cadastrarPagamento({
            valor_pgto: totalNumerico,
            data_pgto: dadosAtendimento.data_atendimento,
            status_pgto: "Pendente",
            forma_pgto: dadosAtendimento.forma_pgto,   // ← novo campo vindo do body
            obs_pgto: dadosAtendimento.obs_pgto || null // ← novo campo vindo do body
        })

        // Cria o atendimento já vinculado ao pagamento
        const idAtendimento = await criarAtendimento({
            ...dadosAtendimento,
            ID_pgto: pagamentoCriado.id
        })

        // Adiciona os produtos ao atendimento se fornecidos
        if (Array.isArray(dadosAtendimento.produtos) && dadosAtendimento.produtos.length > 0) {
            await adicionarProdutosAtendimento(idAtendimento, dadosAtendimento.produtos)
        }

        return {
            id: idAtendimento,
            data: dadosAtendimento.data_atendimento,
            status: dadosAtendimento.status_atendimento,
            total: totalNumerico,
            descricao: dadosAtendimento.descri_atendimento,
            idCliente: dadosAtendimento.ID_cliente,
            idUsuario: dadosAtendimento.ID_user,
            quantidadeProdutos: dadosAtendimento.produtos?.length || 0
        }

    } catch (error) {
        console.error("❌ Erro em cadastrarAtendimento:", error.message)
        throw error
    }
}

/**
 * Service para atualizar um atendimento.
 */
export async function atualizarAtendimento(ID_atendimento, dadosAtendimento) {

    try {
        if (!ID_atendimento) {
            const erro = new Error("ID do atendimento é obrigatório.")
            erro.statusCode = 400
            throw erro
        }

        // Valida status se foi enviado
        if (dadosAtendimento.status_atendimento) {
            const statusPermitidos = ["Agendado", "Em Andamento", "Pendente", "Realizado"]
            if (!statusPermitidos.includes(dadosAtendimento.status_atendimento)) {
                const erro = new Error(`Status inválido. Valores permitidos: ${statusPermitidos.join(", ")}`)
                erro.statusCode = 400
                throw erro
            }
        }

        // Valida total se foi enviado
        if (dadosAtendimento.total_atendimento !== undefined && dadosAtendimento.total_atendimento !== null) {
            const totalNumerico = parseFloat(dadosAtendimento.total_atendimento)
            if (isNaN(totalNumerico) || totalNumerico < 0) {
                const erro = new Error("Valor do atendimento deve ser um número positivo.")
                erro.statusCode = 400
                throw erro
            }
        }

        console.log(`🔄 Atualizando atendimento ID: ${ID_atendimento}`)
        const atualizado = await updateAtendimento(ID_atendimento, dadosAtendimento)

        if (!atualizado) {
            const erro = new Error("Atendimento não encontrado.")
            erro.statusCode = 404
            throw erro
        }

        return {
            mensagem: "Atendimento atualizado com sucesso.",
            id: ID_atendimento
        }

    } catch (error) {
        console.error("❌ Erro em atualizarAtendimento:", error.message)
        throw error
    }
}

/**
 * Service para atualizar os produtos de um atendimento.
 */
export async function atualizarProdutosDoAtendimento(ID_atendimento, novosProdutos) {

    try {
        if (!ID_atendimento) {
            const erro = new Error("ID do atendimento é obrigatório.")
            erro.statusCode = 400
            throw erro
        }

        if (!Array.isArray(novosProdutos)) {
            const erro = new Error("Produtos deve ser um array.")
            erro.statusCode = 400
            throw erro
        }

        console.log(`🛒 Atualizando produtos do atendimento ID: ${ID_atendimento}`)

        // Verifica se o atendimento existe
        const atendimento = await preencherCamposAtendimento(ID_atendimento)
        if (!atendimento) {
            const erro = new Error("Atendimento não encontrado.")
            erro.statusCode = 404
            throw erro
        }

        // Atualiza os produtos
        const atualizado = await atualizarProdutosAtendimento(ID_atendimento, novosProdutos)

        if (!atualizado) {
            const erro = new Error("Erro ao atualizar produtos.")
            erro.statusCode = 500
            throw erro
        }

        return {
            mensagem: "Produtos do atendimento atualizados com sucesso.",
            id: ID_atendimento,
            quantidadeProdutos: novosProdutos.length
        }

    } catch (error) {
        console.error("❌ Erro em atualizarProdutosDoAtendimento:", error.message)
        throw error
    }
}

/**
 * Service para deletar um atendimento.
 */
export async function deletarAtendimento(ID_atendimento) {

    try {
        if (!ID_atendimento) {
            const erro = new Error("ID do atendimento é obrigatório.")
            erro.statusCode = 400
            throw erro
        }

        console.log(`🗑️ Deletando atendimento ID: ${ID_atendimento}`)
        const deletado = await deletarAtendimentoModel(ID_atendimento)

        if (!deletado) {
            const erro = new Error("Atendimento não encontrado.")
            erro.statusCode = 404
            throw erro
        }

        return {
            mensagem: "Atendimento deletado com sucesso."
        }

    } catch (error) {
        console.error("❌ Erro em deletarAtendimento:", error.message)
        throw error
    }
}

/**
 * Service para buscar clientes com autocomplete.
 * Retorna clientes do usuário filtrando por termo de busca.
 */
export async function buscarClientes(idUsuario, termo) {

    try {
        if (!idUsuario) {
            const erro = new Error("ID do usuário é obrigatório.")
            erro.statusCode = 400
            throw erro
        }

        if (!termo || termo.trim() === "") {
            const erro = new Error("Termo de busca é obrigatório.")
            erro.statusCode = 400
            throw erro
        }

        console.log(`🔍 Buscando clientes para usuário ${idUsuario} com termo: "${termo}"`)
        const clientes = await buscarClientesPorTermo(idUsuario, termo.trim())

        return {
            quantidade: clientes.length,
            clientes: clientes.map(cliente => ({
                id: cliente.ID_cliente,
                nome: cliente.nome_cliente
            }))
        }

    } catch (error) {
        console.error("❌ Erro em buscarClientes:", error.message)
        throw error
    }
}

/**
 * Service para buscar produtos com autocomplete.
 * Retorna produtos do usuário filtrando por termo de busca.
 */
export async function buscarProdutos(idUsuario, termo) {

    try {
        if (!idUsuario) {
            const erro = new Error("ID do usuário é obrigatório.")
            erro.statusCode = 400
            throw erro
        }

        if (!termo || termo.trim() === "") {
            const erro = new Error("Termo de busca é obrigatório.")
            erro.statusCode = 400
            throw erro
        }

        console.log(`🔍 Buscando produtos para usuário ${idUsuario} com termo: "${termo}"`)
        const produtos = await buscarProdutosPorTermo(idUsuario, termo.trim())

        return {
            quantidade: produtos.length,
            produtos: produtos.map(produto => ({
                id: produto.ID_produto,
                nome: produto.nome_produto,
                valor: parseFloat(produto.valor_produto)
            }))
        }

    } catch (error) {
        console.error("❌ Erro em buscarProdutos:", error.message)
        throw error
    }
}

/**
 * Service para buscar um atendimento completo com todas as informações.
 */
export async function obterAtendimentoCompleto(ID_atendimento) {

    try {
        if (!ID_atendimento) {
            const erro = new Error("ID do atendimento é obrigatório.")
            erro.statusCode = 400
            throw erro
        }

        console.log(`📋 Buscando atendimento completo ID: ${ID_atendimento}`)
        const atendimento = await buscarAtendimentoCompleto(ID_atendimento)

        if (!atendimento) {
            const erro = new Error("Atendimento não encontrado.")
            erro.statusCode = 404
            throw erro
        }

        return {
            id: atendimento.ID_atendimento,
            data: atendimento.data_atendimento,
            status: atendimento.status_atendimento,
            total: parseFloat(atendimento.total_atendimento),
            descricao: atendimento.descri_atendimento,
            cliente: {
                id: atendimento.ID_cliente,
                nome: atendimento.nome_cliente,
                telefone: atendimento.telefone_cliente,
                email: atendimento.email_cliente
            },
            usuario: {
                id: atendimento.ID_user,
                nome: atendimento.nome_usuario
            },
            produtos: atendimento.produtos.map(p => ({
                id: p.ID_produto,
                nome: p.nome_produto,
                valor: parseFloat(p.valor_produto),
                quantidade: p.quantidade_produto,
                unidade: p.unidade_medida
            }))
        }

    } catch (error) {
        console.error("❌ Erro em obterAtendimentoCompleto:", error.message)
        throw error
    }
}
