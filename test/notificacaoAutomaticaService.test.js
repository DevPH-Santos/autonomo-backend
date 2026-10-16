import test from "node:test"
import assert from "node:assert/strict"
import {
    calcularDataProgramada,
    sincronizarLembreteAutomatico,
    removerLembretesAutomaticosDoEvento
} from "../src/services/notificacaoAutomaticaService.js"

function criarRepositorio() {
    const lembretes = new Map()
    return {
        lembretes,
        async salvarAutomatico(lembrete) {
            // Representa a chave única por evento/tipo existente na migration.
            lembretes.set(`${lembrete.tipoNotificacao}:${lembrete.idEventoOrigem}`, lembrete)
        },
        async removerAutomaticos(tipo, idEvento) {
            lembretes.delete(`${tipo}:${idEvento}`)
        }
    }
}

const atendimento = {
    id: 10,
    idUsuario: 7,
    data_atendimento: "2026-10-20 14:30:00",
    descricao: "Consulta de retorno"
}

test("usa antecedência padrão de um dia e preserva a hora civil", async () => {
    const repositorio = criarRepositorio()
    const resultado = await sincronizarLembreteAutomatico("atendimento", atendimento, repositorio)
    assert.equal(resultado.dataProgramada, "2026-10-19 14:30:00")
    assert.equal(repositorio.lembretes.size, 1)
})
test("cria pagamento com categoria correta e antecedência padrão", async () => {
    const repositorio = criarRepositorio()
    await sincronizarLembreteAutomatico("pagamento", {
        id: 3, idUsuario: 7, data_pgto: "2026-10-20 09:00:00", descricao: "Fatura"
    }, repositorio)
    const lembrete = repositorio.lembretes.get("pagamento:3")
    assert.equal(lembrete.dataProgramada, "2026-10-19 09:00:00")
    assert.equal(lembrete.categoria, "pagamentos")
})

test("sincronização repetida é idempotente e reagenda o mesmo lembrete", async () => {
    const repositorio = criarRepositorio()
    await sincronizarLembreteAutomatico("atendimento", atendimento, repositorio)
    await sincronizarLembreteAutomatico("atendimento", { ...atendimento, data_atendimento: "2026-10-22 14:30:00" }, repositorio)
    assert.equal(repositorio.lembretes.size, 1)
    assert.equal(repositorio.lembretes.get("atendimento:10").dataProgramada, "2026-10-21 14:30:00")
})

test("atendimento recebe a categoria plural correta", async () => {
    const repositorio = criarRepositorio()
    await sincronizarLembreteAutomatico("atendimento", atendimento, repositorio)
    assert.equal(repositorio.lembretes.get("atendimento:10").categoria, "atendimentos")
})

test("remove o lembrete automático quando o evento é excluído", async () => {
    const repositorio = criarRepositorio()
    await sincronizarLembreteAutomatico("atendimento", atendimento, repositorio)
    await removerLembretesAutomaticosDoEvento("atendimento", atendimento, repositorio)
    assert.equal(repositorio.lembretes.size, 0)
})

test("calcula um dia antes com data ISO respeitando o fuso informado", () => {
    assert.equal(
        calcularDataProgramada("2026-10-20T17:00:00.000Z", 1440, "America/Sao_Paulo"),
        "2026-10-19 14:00:00"
    )
})

test("pagamento sem horário usa 09:00 antes de calcular a antecedência", async () => {
    const repositorio = criarRepositorio()
    await sincronizarLembreteAutomatico("pagamento", {
        id: 4, idUsuario: 7, data_pgto: "2026-10-20", descricao: "Fatura sem horário"
    }, repositorio)
    assert.equal(repositorio.lembretes.get("pagamento:4").dataProgramada, "2026-10-19 09:00:00")
})
