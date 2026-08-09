import {
    cadastrarGasto,
    atualizarGasto,
    deletarGasto
} from "../services/despesaService.js"

import {
    selectGastos,
    selectGastoPorId
} from "../models/despesaModel.js"

/**
 * CREATE - Cadastra um novo gasto
 */
export async function registrarGasto(req, res) {
    try {
        console.log("📝 POST /despesas - Cadastrando novo gasto...")

        const idUsuario = req.user?.id

        if (!idUsuario) {
            return res.status(401).json({
                erro: "Usuário não autenticado"
            })
        }

        const { descricao, data, valor, id_produto } = req.body

        if (!descricao) {
            console.warn("⚠️ Campo obrigatório faltando: descricao")
            return res.status(400).json({
                erro: "Descrição do gasto é obrigatória."
            })
        }

        if (!data) {
            console.warn("⚠️ Campo obrigatório faltando: data")
            return res.status(400).json({
                erro: "Data do gasto é obrigatória."
            })
        }

        if (valor === undefined || valor === null) {
            console.warn("⚠️ Campo obrigatório faltando: valor")
            return res.status(400).json({
                erro: "Valor do gasto é obrigatório."
            })
        }

        const gastoCriado = await cadastrarGasto({
            descricao,
            data,
            valor,
            fk_usuario_gasto: idUsuario
        })

        console.log("✅ Gasto cadastrado com sucesso!")
        return res.status(201).json({
            mensagem: "Gasto cadastrado com sucesso.",
            despesa: gastoCriado
        })

    } catch (error) {
        console.error("❌ Erro em registrarGasto:", error)

        const statusCode = error.statusCode || 500
        const mensagem = statusCode === 500
            ? "Erro interno do servidor."
            : error.message

        return res.status(statusCode).json({ erro: mensagem })
    }
}

/**
 * READ ALL - Lista todos os gastos
 */
export async function listarGastos(req, res) {
    try {
        console.log("📖 GET /despesas - Listando todos os gastos...")

        const idUsuario = req.user?.id

        if (!idUsuario) {
            return res.status(401).json({
                erro: "Usuário não autenticado"
            })
        }

        const gastos = await selectGastos(idUsuario)

        console.log(`✅ ${gastos.length} gastos encontrados`)
        return res.status(200).json({
            total: gastos.length,
            despesas: gastos
        })

    } catch (error) {
        console.error("❌ Erro em listarGastos:", error)

        const statusCode = error.statusCode || 500
        const mensagem = statusCode === 500
            ? "Erro interno do servidor."
            : error.message

        return res.status(statusCode).json({ erro: mensagem })
    }
}

/**
 * READ BY ID - Obtém dados de um gasto específico
 */
export async function obterGasto(req, res) {
    try {
        const { id } = req.params

        console.log(`📖 GET /despesas/${id} - Obtendo gasto...`)

        if (!id) {
            console.warn("⚠️ ID não fornecido")
            return res.status(400).json({
                erro: "ID do gasto é obrigatório."
            })
        }

        const gasto = await selectGastoPorId(id)

        if (!gasto) {
            console.warn(`⚠️ Gasto ${id} não encontrado`)
            return res.status(404).json({
                erro: "Gasto não encontrado."
            })
        }

        console.log(`✅ Gasto ${id} encontrado`)
        return res.status(200).json({
            despesa: gasto
        })

    } catch (error) {
        console.error("❌ Erro em obterGasto:", error)

        const statusCode = error.statusCode || 500
        const mensagem = statusCode === 500
            ? "Erro interno do servidor."
            : error.message

        return res.status(statusCode).json({ erro: mensagem })
    }
}

/**
 * UPDATE - Atualiza dados de um gasto
 */
export async function editarGasto(req, res) {
    try {
        const { id } = req.params
        const dadosAtualizacao = req.body

        console.log(`✏️ PUT /despesas/${id} - Atualizando gasto...`)

        if (!id) {
            console.warn("⚠️ ID não fornecido")
            return res.status(400).json({
                erro: "ID do gasto é obrigatório."
            })
        }

        const resultado = await atualizarGasto(id, dadosAtualizacao)

        console.log(`✅ Gasto ${id} atualizado`)
        return res.status(200).json(resultado)

    } catch (error) {
        console.error("❌ Erro em editarGasto:", error)

        const statusCode = error.statusCode || 500
        const mensagem = statusCode === 500
            ? "Erro interno do servidor."
            : error.message

        return res.status(statusCode).json({ erro: mensagem })
    }
}

/**
 * DELETE - Deleta um gasto
 */
export async function excluirGasto(req, res) {
    try {
        const { id } = req.params

        console.log(`🗑️ DELETE /despesas/${id} - Deletando gasto...`)

        if (!id) {
            console.warn("⚠️ ID não fornecido")
            return res.status(400).json({
                erro: "ID do gasto é obrigatório."
            })
        }

        const resultado = await deletarGasto(id)

        console.log(`✅ Gasto ${id} deletado`)
        return res.status(200).json(resultado)

    } catch (error) {
        console.error("❌ Erro em excluirGasto:", error)

        const statusCode = error.statusCode || 500
        const mensagem = statusCode === 500
            ? "Erro interno do servidor."
            : error.message

        return res.status(statusCode).json({ erro: mensagem })
    }
}
