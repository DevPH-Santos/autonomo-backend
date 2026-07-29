import {
    listarPagamentos,
    obterPagamento,
    atualizarPagamento,
    deletarPagamento,
    atualizarStatusPagamento
} from "../services/pagamentoService.js"

/**
 * READ ALL - Lista todos os pagamentos do usuário autenticado
 * GET /pagamentos
 */
export async function listarTodosPagamentos(req, res) {
    try {
        console.log("📖 GET /pagamentos - Listando pagamentos...")

        const idUsuario = req.user?.id

        if (!idUsuario) {
            return res.status(401).json({
                erro: "Usuário não autenticado"
            })
        }

        const resultado = await listarPagamentos(idUsuario)

        console.log(`✅ ${resultado.total} pagamento(s) encontrado(s)`)
        return res.status(200).json(resultado)

    } catch (error) {
        console.error("❌ Erro em listarTodosPagamentos:", error)
        const statusCode = error.statusCode || 500
        const mensagem = statusCode === 500
            ? "Erro interno do servidor."
            : error.message

        return res.status(statusCode).json({ erro: mensagem })
    }
}

/**
 * READ BY ID - Obtém um pagamento específico
 * GET /pagamentos/:id
 */
export async function obterUmPagamento(req, res) {
    try {
        const { id } = req.params
        console.log(`📖 GET /pagamentos/${id} - Obtendo pagamento...`)

        if (!id) {
            return res.status(400).json({
                erro: "ID do pagamento é obrigatório."
            })
        }

        const pagamento = await obterPagamento(id)

        console.log(`✅ Pagamento ${id} encontrado`)
        return res.status(200).json({ pagamento })

    } catch (error) {
        console.error("❌ Erro em obterUmPagamento:", error)
        const statusCode = error.statusCode || 500
        const mensagem = statusCode === 500
            ? "Erro interno do servidor."
            : error.message

        return res.status(statusCode).json({ erro: mensagem })
    }
}

/**
 * UPDATE - Atualiza dados de um pagamento
 * PUT /pagamentos/:id
 */
export async function editarPagamento(req, res) {
    try {
        const { id } = req.params
        const dadosAtualizacao = req.body

        console.log(`✏️ PUT /pagamentos/${id} - Atualizando pagamento...`)

        if (!id) {
            return res.status(400).json({
                erro: "ID do pagamento é obrigatório."
            })
        }

        const resultado = await atualizarPagamento(id, dadosAtualizacao)

        console.log(`✅ Pagamento ${id} atualizado`)
        return res.status(200).json(resultado)

    } catch (error) {
        console.error("❌ Erro em editarPagamento:", error)
        const statusCode = error.statusCode || 500
        const mensagem = statusCode === 500
            ? "Erro interno do servidor."
            : error.message

        return res.status(statusCode).json({ erro: mensagem })
    }
}

/**
 * DELETE - Deleta um pagamento
 * DELETE /pagamentos/:id
 */
export async function excluirPagamento(req, res) {
    try {
        const { id } = req.params

        console.log(`🗑️ DELETE /pagamentos/${id} - Deletando pagamento...`)

        if (!id) {
            return res.status(400).json({
                erro: "ID do pagamento é obrigatório."
            })
        }

        const resultado = await deletarPagamento(id)

        console.log(`✅ Pagamento ${id} deletado`)
        return res.status(200).json(resultado)

    } catch (error) {
        console.error("❌ Erro em excluirPagamento:", error)
        const statusCode = error.statusCode || 500
        const mensagem = statusCode === 500
            ? "Erro interno do servidor."
            : error.message

        return res.status(statusCode).json({ erro: mensagem })
    }
}

/**
 * PATCH STATUS - Atualiza apenas o status de um pagamento
 * PATCH /pagamentos/:id/status
 * Body: { status_pgto: "Pago" | "Pendente" | "Atrasado" }
 */
export async function alterarStatusPagamento(req, res) {
    try {
        const { id } = req.params
        const { status_pgto } = req.body

        console.log(`🔁 PATCH /pagamentos/${id}/status - Alterando status para "${status_pgto}"...`)

        if (!id) {
            return res.status(400).json({
                erro: "ID do pagamento é obrigatório."
            })
        }

        if (!status_pgto) {
            return res.status(400).json({
                erro: "Campo status_pgto é obrigatório."
            })
        }

        const resultado = await atualizarStatusPagamento(id, status_pgto)

        console.log(`✅ Status do pagamento ${id} atualizado`)
        return res.status(200).json(resultado)

    } catch (error) {
        console.error("❌ Erro em alterarStatusPagamento:", error)
        const statusCode = error.statusCode || 500
        const mensagem = statusCode === 500
            ? "Erro interno do servidor."
            : error.message

        return res.status(statusCode).json({ erro: mensagem })
    }
}
