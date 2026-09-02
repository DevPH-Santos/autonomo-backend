    import {
    criarLembrete,
    deletarLembrete as deletarLembreteModel,
    updateLembrete
} from "../models/lembreteModel.js"

const STATUS_VALIDOS = ["Pendente", "Concluido", "Concluído", "Atrasado"]
const TIPOS_VALIDOS = ["pessoal", "atendimento", "pagamento", "manutenção"]
const PRIORIDADES_VALIDAS = ["alta", "média", "baixa"]

function criarErro(message, statusCode = 400) {
    const erro = new Error(message)
    erro.statusCode = statusCode
    return erro
}

function normalizarStatus(status) {
    if (status === "Concluido") return "Concluído"
    return status || "Pendente"
}

function normalizarTipo(tipo) {
    return typeof tipo === "string" ? tipo.trim().toLowerCase() : tipo
}

function normalizarPrioridade(prioridade) {
    return typeof prioridade === "string" ? prioridade.trim().toLowerCase() : prioridade
}

function normalizarDados(dadosLembrete, parcial = false) {
    const descricao =
        dadosLembrete.descricao ??
        dadosLembrete.descri_lembrete ??
        dadosLembrete.descricao_lembrete

    return {
        titulo: dadosLembrete.titulo ?? dadosLembrete.titulo_lembrete,
        descricao: descricao ?? (parcial ? undefined : ""),
        status: parcial && dadosLembrete.status === undefined && dadosLembrete.status_lembrete === undefined
            ? undefined
            : normalizarStatus(dadosLembrete.status ?? dadosLembrete.status_lembrete),
        data: dadosLembrete.data ?? dadosLembrete.data_lembrete,
        tipo: parcial && dadosLembrete.tipo === undefined && dadosLembrete.tipo_lembrete === undefined
            ? undefined
            : normalizarTipo(dadosLembrete.tipo ?? dadosLembrete.tipo_lembrete),
        prioridade: parcial && dadosLembrete.prioridade === undefined && dadosLembrete.prioridade_lembrete === undefined
            ? undefined
            : normalizarPrioridade(dadosLembrete.prioridade ?? dadosLembrete.prioridade_lembrete),
        idUsuario: dadosLembrete.idUsuario
    }
}

function validarLembrete(dadosLembrete, parcial = false) {
    if (!parcial || dadosLembrete.titulo !== undefined) {
        if (!dadosLembrete.titulo || dadosLembrete.titulo.trim() === "") {
            throw criarErro("Titulo do lembrete e obrigatorio.")
        }
    }

    if (!parcial || dadosLembrete.data !== undefined) {
        if (!dadosLembrete.data) {
            throw criarErro("Data do lembrete e obrigatoria.")
        }
    }

    if (dadosLembrete.status !== undefined && !STATUS_VALIDOS.includes(dadosLembrete.status)) {
        throw criarErro("Status do lembrete invalido.")
    }

    if (!parcial || dadosLembrete.tipo !== undefined) {
        if (!TIPOS_VALIDOS.includes(dadosLembrete.tipo)) {
            throw criarErro("Tipo do lembrete invalido. Use: pessoal, atendimento, pagamento ou manutenção.")
        }
    }

    if (!parcial || dadosLembrete.prioridade !== undefined) {
        if (!PRIORIDADES_VALIDAS.includes(dadosLembrete.prioridade)) {
            throw criarErro("Prioridade do lembrete invalida. Use: alta, média ou baixa.")
        }
    }
}

export async function cadastrarLembrete(dadosEntrada) {
    try {
        const dadosLembrete = normalizarDados(dadosEntrada)
        validarLembrete(dadosLembrete)

        const idLembrete = await criarLembrete(dadosLembrete)

        return {
            id: idLembrete,
            titulo: dadosLembrete.titulo,
            descricao: dadosLembrete.descricao,
            status: dadosLembrete.status,
            data: dadosLembrete.data,
            tipo: dadosLembrete.tipo,
            prioridade: dadosLembrete.prioridade
        }
    } catch (error) {
        console.error("Erro em cadastrarLembrete:", error.message)
        throw error
    }
}

export async function atualizarLembrete(ID_lembrete, idUsuario, dadosEntrada) {
    try {
        if (!ID_lembrete) {
            throw criarErro("ID do lembrete e obrigatorio.")
        }

        const dadosLembrete = normalizarDados(dadosEntrada, true)
        validarLembrete(dadosLembrete, true)

        const atualizado = await updateLembrete(ID_lembrete, idUsuario, dadosLembrete)

        if (!atualizado) {
            throw criarErro("Lembrete nao encontrado.", 404)
        }

        return {
            mensagem: "Lembrete atualizado com sucesso.",
            id: ID_lembrete
        }
    } catch (error) {
        console.error("Erro em atualizarLembrete:", error.message)
        throw error
    }
}

export async function atualizarStatusLembrete(ID_lembrete, idUsuario, status) {
    return atualizarLembrete(ID_lembrete, idUsuario, {
        status: normalizarStatus(status)
    })
}

export async function deletarLembrete(ID_lembrete, idUsuario) {
    try {
        if (!ID_lembrete) {
            throw criarErro("ID do lembrete e obrigatorio.")
        }

        const deletado = await deletarLembreteModel(ID_lembrete, idUsuario)

        if (!deletado) {
            throw criarErro("Lembrete nao encontrado.", 404)
        }

        return {
            mensagem: "Lembrete deletado com sucesso."
        }
    } catch (error) {
        console.error("Erro em deletarLembrete:", error.message)
        throw error
    }
}
