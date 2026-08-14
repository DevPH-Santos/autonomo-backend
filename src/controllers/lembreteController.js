import {
    cadastrarLembrete,
    atualizarLembrete,
    atualizarStatusLembrete,
    deletarLembrete
} from "../services/lembreteService.js"

import {
    selectLembretes,
    selectLembretePorId
} from "../models/lembreteModel.js"

function responderErro(res, error) {
    const statusCode = error.statusCode || 500
    const mensagem = statusCode === 500 ? "Erro interno do servidor." : error.message

    return res.status(statusCode).json({ erro: mensagem })
}

export async function registrarLembrete(req, res) {
    try {
        const idUsuario = req.user?.id

        if (!idUsuario) {
            return res.status(401).json({ erro: "Usuario nao autenticado" })
        }

        const lembreteCriado = await cadastrarLembrete({
            ...req.body,
            fk_usuario_lembrete: idUsuario
        })

        return res.status(201).json({
            mensagem: "Lembrete cadastrado com sucesso.",
            lembrete: lembreteCriado
        })
    } catch (error) {
        console.error("Erro em registrarLembrete:", error)
        return responderErro(res, error)
    }
}

export async function listarLembretes(req, res) {
    try {
        const idUsuario = req.user?.id

        if (!idUsuario) {
            return res.status(401).json({ erro: "Usuario nao autenticado" })
        }

        const lembretes = await selectLembretes(idUsuario)

        return res.status(200).json({
            total: lembretes.length,
            lembretes
        })
    } catch (error) {
        console.error("Erro em listarLembretes:", error)
        return responderErro(res, error)
    }
}

export async function obterLembrete(req, res) {
    try {
        const idUsuario = req.user?.id
        const { id } = req.params

        if (!idUsuario) {
            return res.status(401).json({ erro: "Usuario nao autenticado" })
        }

        if (!id) {
            return res.status(400).json({ erro: "ID do lembrete e obrigatorio." })
        }

        const lembrete = await selectLembretePorId(id, idUsuario)

        if (!lembrete) {
            return res.status(404).json({ erro: "Lembrete nao encontrado." })
        }

        return res.status(200).json({ lembrete })
    } catch (error) {
        console.error("Erro em obterLembrete:", error)
        return responderErro(res, error)
    }
}

export async function editarLembrete(req, res) {
    try {
        const idUsuario = req.user?.id
        const { id } = req.params

        if (!idUsuario) {
            return res.status(401).json({ erro: "Usuario nao autenticado" })
        }

        const resultado = await atualizarLembrete(id, idUsuario, req.body)

        return res.status(200).json(resultado)
    } catch (error) {
        console.error("Erro em editarLembrete:", error)
        return responderErro(res, error)
    }
}

export async function editarStatusLembrete(req, res) {
    try {
        const idUsuario = req.user?.id
        const { id } = req.params
        const status = req.body.status ?? req.body.status_lembrete

        if (!idUsuario) {
            return res.status(401).json({ erro: "Usuario nao autenticado" })
        }

        const resultado = await atualizarStatusLembrete(id, idUsuario, status)

        return res.status(200).json({
            ...resultado,
            status
        })
    } catch (error) {
        console.error("Erro em editarStatusLembrete:", error)
        return responderErro(res, error)
    }
}

export async function excluirLembrete(req, res) {
    try {
        const idUsuario = req.user?.id
        const { id } = req.params

        if (!idUsuario) {
            return res.status(401).json({ erro: "Usuario nao autenticado" })
        }

        const resultado = await deletarLembrete(id, idUsuario)

        return res.status(200).json(resultado)
    } catch (error) {
        console.error("Erro em excluirLembrete:", error)
        return responderErro(res, error)
    }
}
