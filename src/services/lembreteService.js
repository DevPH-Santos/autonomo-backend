    import {
    criarLembrete,
    deletarLembrete as deletarLembreteModel,
    updateLembrete
} from "../models/lembreteModel.js"

const TIPOS_VALIDOS = ["Pagamento", "Atendimento", "Manutencao", "Manutenção", "Pessoal"]
const STATUS_VALIDOS = ["Pendente", "Concluido", "Concluído", "Atrasado"]
const PRIORIDADES_VALIDAS = ["Alta", "Media", "Média", "Baixa"]

function criarErro(message, statusCode = 400) {
    const erro = new Error(message)
    erro.statusCode = statusCode
    return erro
}

function normalizarTipo(tipo) {
    if (tipo === "Manutencao") return "Manutenção"
    return tipo || "Pessoal"
}

function normalizarStatus(status) {
    if (status === "Concluido") return "Concluído"
    return status || "Pendente"
}

function normalizarPrioridade(prioridade) {
    if (prioridade === "Media") return "Média"
    return prioridade || "Média"
}

function normalizarDados(dadosLembrete) {
    return {
        titulo: dadosLembrete.titulo ?? dadosLembrete.titulo_lembrete,
        descricao:
            dadosLembrete.descricao ??
            dadosLembrete.descri_lembrete ??
            dadosLembrete.descricao_lembrete ??
            "",
        tipo: normalizarTipo(dadosLembrete.tipo ?? dadosLembrete.tipo_lembrete),
        status: normalizarStatus(dadosLembrete.status ?? dadosLembrete.status_lembrete),
        prioridade: normalizarPrioridade(
            dadosLembrete.prioridade ?? dadosLembrete.prioridade_lembrete
        ),
        data: dadosLembrete.data ?? dadosLembrete.data_lembrete,
        fk_usuario_lembrete: dadosLembrete.fk_usuario_lembrete
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

    if (dadosLembrete.tipo !== undefined && !TIPOS_VALIDOS.includes(dadosLembrete.tipo)) {
        throw criarErro("Tipo do lembrete invalido.")
    }

    if (dadosLembrete.status !== undefined && !STATUS_VALIDOS.includes(dadosLembrete.status)) {
        throw criarErro("Status do lembrete invalido.")
    }

    if (
        dadosLembrete.prioridade !== undefined &&
        !PRIORIDADES_VALIDAS.includes(dadosLembrete.prioridade)
    ) {
        throw criarErro("Prioridade do lembrete invalida.")
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
            tipo: dadosLembrete.tipo,
            status: dadosLembrete.status,
            prioridade: dadosLembrete.prioridade,
            data: dadosLembrete.data
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

        const dadosLembrete = normalizarDados(dadosEntrada)
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
