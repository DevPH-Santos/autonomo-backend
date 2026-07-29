import {
    criarPagamento as criarPagamentoModel,
    buscarPagamentoPorId,
    listarPagamentosDoUsuario,
    atualizarPagamento as atualizarPagamentoModel,
    deletarPagamento as deletarPagamentoModel
} from "../models/pagamentoModel.js"

const STATUS_PERMITIDOS = ["Pago", "Pendente", "Atrasado"]

/**
 * Cria um pagamento no banco.
 * Chamado automaticamente por atendimentoService ao cadastrar um atendimento.
 * Retorna o objeto com id e dados do pagamento criado.
 */
export async function cadastrarPagamento(dadosPagamento) {
    try {
        const { valor_pgto, data_pgto, status_pgto, forma_pgto, obs_pgto } = dadosPagamento

        if (valor_pgto === undefined || valor_pgto === null) {
            const erro = new Error("Valor do pagamento é obrigatório.")
            erro.statusCode = 400
            throw erro
        }

        const valorNumerico = parseFloat(valor_pgto)
        if (isNaN(valorNumerico) || valorNumerico < 0) {
            const erro = new Error("Valor do pagamento deve ser um número positivo.")
            erro.statusCode = 400
            throw erro
        }

        if (!data_pgto || data_pgto.trim() === "") {
            const erro = new Error("Data do pagamento é obrigatória.")
            erro.statusCode = 400
            throw erro
        }

        if (!status_pgto || !STATUS_PERMITIDOS.includes(status_pgto)) {
            const erro = new Error(`Status inválido. Valores permitidos: ${STATUS_PERMITIDOS.join(", ")}`)
            erro.statusCode = 400
            throw erro
        }

        if (!forma_pgto || forma_pgto.trim() === "") {
            const erro = new Error("Forma de pagamento é obrigatória.")
            erro.statusCode = 400
            throw erro
        }

        console.log("💳 Criando pagamento...")

        const ID_pgto = await criarPagamentoModel({
            valor_pgto: valorNumerico,
            data_pgto,
            status_pgto,
            forma_pgto: forma_pgto.trim(),
            obs_pgto: obs_pgto?.trim() || null
        })

        return {
            id: ID_pgto,
            valor: valorNumerico,
            data: data_pgto,
            status: status_pgto,
            forma: forma_pgto.trim(),
            observacao: obs_pgto || null
        }

    } catch (error) {
        console.error("❌ Erro em cadastrarPagamento:", error.message)
        throw error
    }
}

/**
 * Lista todos os pagamentos de um usuário com dados do cliente e atendimento.
 */
export async function listarPagamentos(idUsuario) {
    try {
        if (!idUsuario) {
            const erro = new Error("ID do usuário é obrigatório.")
            erro.statusCode = 400
            throw erro
        }

        console.log(`📋 Listando pagamentos do usuário ${idUsuario}`)
        const pagamentos = await listarPagamentosDoUsuario(idUsuario)

        return {
            total: pagamentos.length,
            pagamentos: pagamentos.map(p => ({
                id: p.ID_pgto,
                valor: parseFloat(p.valor_pgto),
                data: p.data_pgto,
                status: p.status_pgto,
                forma: p.forma_pgto,
                observacao: p.obs_pgto,
                cliente: p.nome_cliente,
                telefoneCliente: p.telefone_cliente,
                atendimento: {
                    id: p.ID_atendimento,
                    descricao: p.descri_atendimento
                }
            }))
        }

    } catch (error) {
        console.error("❌ Erro em listarPagamentos:", error.message)
        throw error
    }
}

/**
 * Busca um pagamento específico com todos os dados relacionados.
 */
export async function obterPagamento(ID_pgto) {
    try {
        if (!ID_pgto) {
            const erro = new Error("ID do pagamento é obrigatório.")
            erro.statusCode = 400
            throw erro
        }

        console.log(`🔍 Buscando pagamento ID: ${ID_pgto}`)
        const pagamento = await buscarPagamentoPorId(ID_pgto)

        if (!pagamento) {
            const erro = new Error("Pagamento não encontrado.")
            erro.statusCode = 404
            throw erro
        }

        return {
            id: pagamento.ID_pgto,
            valor: parseFloat(pagamento.valor_pgto),
            data: pagamento.data_pgto,
            status: pagamento.status_pgto,
            forma: pagamento.forma_pgto,
            observacao: pagamento.obs_pgto,
            cliente: pagamento.nome_cliente,
            telefoneCliente: pagamento.telefone_cliente,
            atendimento: {
                id: pagamento.ID_atendimento,
                descricao: pagamento.descri_atendimento
            }
        }

    } catch (error) {
        console.error("❌ Erro em obterPagamento:", error.message)
        throw error
    }
}

/**
 * Atualiza campos de um pagamento existente.
 */
export async function atualizarPagamento(ID_pgto, dadosPagamento) {
    try {
        if (!ID_pgto) {
            const erro = new Error("ID do pagamento é obrigatório.")
            erro.statusCode = 400
            throw erro
        }

        if (dadosPagamento.status_pgto && !STATUS_PERMITIDOS.includes(dadosPagamento.status_pgto)) {
            const erro = new Error(`Status inválido. Valores permitidos: ${STATUS_PERMITIDOS.join(", ")}`)
            erro.statusCode = 400
            throw erro
        }

        if (dadosPagamento.valor_pgto !== undefined) {
            const valorNumerico = parseFloat(dadosPagamento.valor_pgto)
            if (isNaN(valorNumerico) || valorNumerico < 0) {
                const erro = new Error("Valor do pagamento deve ser um número positivo.")
                erro.statusCode = 400
                throw erro
            }
            dadosPagamento.valor_pgto = valorNumerico
        }

        console.log(`🔄 Atualizando pagamento ID: ${ID_pgto}`)
        const atualizado = await atualizarPagamentoModel(ID_pgto, dadosPagamento)

        if (!atualizado) {
            const erro = new Error("Pagamento não encontrado.")
            erro.statusCode = 404
            throw erro
        }

        return {
            mensagem: "Pagamento atualizado com sucesso.",
            id: ID_pgto
        }

    } catch (error) {
        console.error("❌ Erro em atualizarPagamento:", error.message)
        throw error
    }
}

/**
 * Deleta um pagamento e desvincula o atendimento relacionado.
 */
export async function deletarPagamento(ID_pgto) {
    try {
        if (!ID_pgto) {
            const erro = new Error("ID do pagamento é obrigatório.")
            erro.statusCode = 400
            throw erro
        }

        console.log(`🗑️ Deletando pagamento ID: ${ID_pgto}`)
        const deletado = await deletarPagamentoModel(ID_pgto)

        if (!deletado) {
            const erro = new Error("Pagamento não encontrado.")
            erro.statusCode = 404
            throw erro
        }

        return {
            mensagem: "Pagamento deletado com sucesso."
        }

    } catch (error) {
        console.error("❌ Erro em deletarPagamento:", error.message)
        throw error
    }
}

/**
 * Atalho para atualizar apenas o status de um pagamento.
 * Ex.: marcar como "Pago" ou "Atrasado" sem alterar os outros campos.
 */
export async function atualizarStatusPagamento(ID_pgto, novoStatus) {
    try {
        if (!ID_pgto) {
            const erro = new Error("ID do pagamento é obrigatório.")
            erro.statusCode = 400
            throw erro
        }

        if (!novoStatus || !STATUS_PERMITIDOS.includes(novoStatus)) {
            const erro = new Error(`Status inválido. Valores permitidos: ${STATUS_PERMITIDOS.join(", ")}`)
            erro.statusCode = 400
            throw erro
        }

        console.log(`🔁 Atualizando status do pagamento ${ID_pgto} para "${novoStatus}"`)
        const atualizado = await atualizarPagamentoModel(ID_pgto, { status_pgto: novoStatus })

        if (!atualizado) {
            const erro = new Error("Pagamento não encontrado.")
            erro.statusCode = 404
            throw erro
        }

        return {
            mensagem: `Status atualizado para "${novoStatus}".`,
            id: ID_pgto,
            status: novoStatus
        }

    } catch (error) {
        console.error("❌ Erro em atualizarStatusPagamento:", error.message)
        throw error
    }
}
