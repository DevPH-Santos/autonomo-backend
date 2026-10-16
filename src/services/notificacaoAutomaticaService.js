/**
 * Tipos de evento que possuem lembretes automáticos. Novos tipos entram aqui,
 * sem espalhar regras de categoria/data pelos serviços de domínio.
 */
export const TIPOS_DE_NOTIFICACAO = Object.freeze({
    atendimento: {
        categoria: "atendimentos",
        tipoLembrete: "atendimento",
        campoData: "data_atendimento",
        titulo: "Lembrete de atendimento"
    },
    pagamento: {
        categoria: "pagamentos",
        tipoLembrete: "pagamento",
        campoData: "data_pgto",
        // Pagamentos cadastrados somente com data são avisados às 09:00.
        horaPadraoEvento: 9,
        titulo: "Lembrete de pagamento"
    }
})

export const ANTECEDENCIA_PADRAO_MINUTOS = 24 * 60
export const FUSO_HORARIO_PADRAO = "America/Sao_Paulo"

function partesNoFuso(data, fusoHorario) {
    const partes = new Intl.DateTimeFormat("en-CA", {
        timeZone: fusoHorario,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23"
    }).formatToParts(data)

    return Object.fromEntries(partes
        .filter(({ type }) => type !== "literal")
        .map(({ type, value }) => [type, value]))
}

/**
 * Datas sem offset são DATETIME civis e, portanto, não devem ser interpretadas
 * no fuso do servidor. ISO com offset e Date são convertidos para o fuso do usuário.
 */
export function normalizarDataNoFuso(data, fusoHorario = FUSO_HORARIO_PADRAO) {
    if (typeof data === "string") {
        const civil = data.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/)
        if (civil) {
            return {
                ano: Number(civil[1]), mes: Number(civil[2]), dia: Number(civil[3]),
                hora: Number(civil[4] || 0), minuto: Number(civil[5] || 0), segundo: Number(civil[6] || 0)
            }
        }
    }

    const dataConvertida = data instanceof Date ? data : new Date(data)
    if (Number.isNaN(dataConvertida.getTime())) {
        throw new Error("Data do evento inválida para cálculo do lembrete.")
    }

    const partes = partesNoFuso(dataConvertida, fusoHorario)
    return {
        ano: Number(partes.year), mes: Number(partes.month), dia: Number(partes.day),
        hora: Number(partes.hour), minuto: Number(partes.minute), segundo: Number(partes.second)
    }
}

export function calcularDataProgramada(dataEvento, antecedenciaMinutos = ANTECEDENCIA_PADRAO_MINUTOS, fusoHorario = FUSO_HORARIO_PADRAO, opcoes = {}) {
    const data = normalizarDataNoFuso(dataEvento, fusoHorario)
    if (opcoes.horaPadraoEvento !== undefined && data.hora === 0 && data.minuto === 0 && data.segundo === 0) {
        data.hora = opcoes.horaPadraoEvento
    }
    const minutos = Number(antecedenciaMinutos)
    if (!Number.isInteger(minutos) || minutos < 0) {
        throw new Error("A antecedência da notificação deve ser um número inteiro não negativo de minutos.")
    }

    // UTC é usado somente para aritmética de calendário; a saída permanece um DATETIME no fuso do usuário.
    const instanteCivil = new Date(Date.UTC(data.ano, data.mes - 1, data.dia, data.hora, data.minuto - minutos, data.segundo))
    const pad = valor => String(valor).padStart(2, "0")
    return `${instanteCivil.getUTCFullYear()}-${pad(instanteCivil.getUTCMonth() + 1)}-${pad(instanteCivil.getUTCDate())} ${pad(instanteCivil.getUTCHours())}:${pad(instanteCivil.getUTCMinutes())}:${pad(instanteCivil.getUTCSeconds())}`
}

function detalhesDoEvento(tipo, evento) {
    const definicao = TIPOS_DE_NOTIFICACAO[tipo]
    if (!definicao) throw new Error(`Tipo de notificação não suportado: ${tipo}.`)
    if (!evento?.id || !evento?.idUsuario || !evento?.[definicao.campoData]) {
        throw new Error("Evento incompleto para sincronizar lembrete automático.")
    }
    return definicao
}

/**
 * Dependências injetáveis deixam a regra testável sem banco. O repositório real
 * é fornecido pelo adaptador em lembreteAutomaticoModel.
 */
export async function sincronizarLembreteAutomatico(tipo, evento, repositorio) {
    const definicao = detalhesDoEvento(tipo, evento)
    const dataProgramada = calcularDataProgramada(
        evento[definicao.campoData],
        ANTECEDENCIA_PADRAO_MINUTOS,
        FUSO_HORARIO_PADRAO,
        { horaPadraoEvento: definicao.horaPadraoEvento }
    )

    await repositorio.salvarAutomatico({
        idUsuario: evento.idUsuario,
        tipoNotificacao: tipo,
        idEventoOrigem: evento.id,
        dataProgramada,
        categoria: definicao.categoria,
        tipoLembrete: definicao.tipoLembrete,
        titulo: definicao.titulo,
        descricao: evento.descricao || "",
        chaveIdempotencia: `automatico:${tipo}:${evento.id}:${dataProgramada}`
    })
    return { acao: "sincronizado", dataProgramada }
}

export async function removerLembretesAutomaticosDoEvento(tipo, evento, repositorio) {
    detalhesDoEvento(tipo, evento)
    return repositorio.removerAutomaticos(tipo, evento.id, evento.idUsuario)
}
