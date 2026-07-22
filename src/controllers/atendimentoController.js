import {
    cadastrarAtendimento,
    atualizarAtendimento,
    atualizarProdutosDoAtendimento,
    deletarAtendimento,
    buscarClientes,
    buscarProdutos,
    obterAtendimentoCompleto
} from "../services/atendimentoService.js"
import {
    selectAtendimento,
    preencherCamposAtendimento,
    listarAtendimentosComCliente
} from "../models/atendimentoModel.js"

/**
 * CREATE - Cadastra um novo atendimento
 */
export async function registrarAtendimento(req, res) {
    try {
        console.log("📝 POST /atendimentos - Cadastrando novo atendimento...")

        const idUsuario = req.user?.id

        if (!idUsuario) {
            return res.status(401).json({
                erro: "Usuário não autenticado"
            })
        }

        const {
            data_atendimento,
            status_atendimento,
            total_atendimento,
            descri_atendimento,
            ID_cliente,
            ID_pgto,
            produtos
        } = req.body

        // Validação de campos obrigatórios
        if (!data_atendimento || !status_atendimento || total_atendimento === undefined || !descri_atendimento || !ID_cliente) {
            console.warn("⚠️ Campos obrigatórios faltando")
            return res.status(400).json({
                erro: "Data, status, valor, descrição e cliente são obrigatórios."
            })
        }

        const atendimentoCriado = await cadastrarAtendimento({
            data_atendimento,
            status_atendimento,
            total_atendimento,
            descri_atendimento,
            ID_user: idUsuario,
            ID_cliente,
            ID_pgto: ID_pgto || null,
            produtos: produtos || []
        })

        console.log("✅ Atendimento cadastrado com sucesso!")
        return res.status(201).json({
            mensagem: "Atendimento cadastrado com sucesso.",
            atendimento: atendimentoCriado
        })

    } catch (error) {
        console.error("❌ Erro em registrarAtendimento:", error)
        const statusCode = error.statusCode || 500
        const mensagem = statusCode === 500
            ? "Erro interno do servidor."
            : error.message

        return res.status(statusCode).json({
            erro: mensagem
        })
    }
}

/**
 * READ ALL - Lista todos os atendimentos
 */
export async function listarAtendimentos(req, res) {
    try {
        console.log("📖 GET /atendimentos - Listando todos os atendimentos...")

        const idUsuario = req.user?.id

        if (!idUsuario) {
            return res.status(401).json({
                erro: "Usuário não autenticado"
            })
        }

        const atendimentos = await listarAtendimentosComCliente(idUsuario)

        console.log(`✅ ${atendimentos.length} atendimentos encontrados`)
        return res.status(200).json({
            total: atendimentos.length,
            atendimentos: atendimentos
        })

    } catch (error) {
        console.error("❌ Erro em listarAtendimentos:", error)
        const statusCode = error.statusCode || 500
        const mensagem = statusCode === 500
            ? "Erro interno do servidor."
            : error.message

        return res.status(statusCode).json({
            erro: mensagem
        })
    }
}

/**
 * READ BY ID - Obtém dados de um atendimento específico
 */
export async function obterAtendimento(req, res) {
    try {
        const { id } = req.params
        console.log(`📖 GET /atendimentos/${id} - Obtendo atendimento...`)

        if (!id) {
            console.warn("⚠️ ID não fornecido")
            return res.status(400).json({
                erro: "ID do atendimento é obrigatório."
            })
        }

        const atendimento = await obterAtendimentoCompleto(id)

        if (!atendimento) {
            console.warn(`⚠️ Atendimento ${id} não encontrado`)
            return res.status(404).json({
                erro: "Atendimento não encontrado."
            })
        }

        console.log(`✅ Atendimento ${id} encontrado`)
        return res.status(200).json({
            atendimento: atendimento
        })

    } catch (error) {
        console.error("❌ Erro em obterAtendimento:", error)
        const statusCode = error.statusCode || 500
        const mensagem = statusCode === 500
            ? "Erro interno do servidor."
            : error.message

        return res.status(statusCode).json({
            erro: mensagem
        })
    }
}

/**
 * UPDATE - Atualiza dados de um atendimento
 */
export async function editarAtendimento(req, res) {
    try {
        const { id } = req.params
        const dadosAtualizacao = req.body

        console.log(`✏️ PUT /atendimentos/${id} - Atualizando atendimento...`)

        if (!id) {
            console.warn("⚠️ ID não fornecido")
            return res.status(400).json({
                erro: "ID do atendimento é obrigatório."
            })
        }

        const resultado = await atualizarAtendimento(id, dadosAtualizacao)

        console.log(`✅ Atendimento ${id} atualizado`)
        return res.status(200).json(resultado)

    } catch (error) {
        console.error("❌ Erro em editarAtendimento:", error)
        const statusCode = error.statusCode || 500
        const mensagem = statusCode === 500
            ? "Erro interno do servidor."
            : error.message

        return res.status(statusCode).json({
            erro: mensagem
        })
    }
}

/**
 * DELETE - Deleta um atendimento
 */
export async function excluirAtendimento(req, res) {
    try {
        const { id } = req.params

        console.log(`🗑️ DELETE /atendimentos/${id} - Deletando atendimento...`)

        if (!id) {
            console.warn("⚠️ ID não fornecido")
            return res.status(400).json({
                erro: "ID do atendimento é obrigatório."
            })
        }

        const resultado = await deletarAtendimento(id)

        console.log(`✅ Atendimento ${id} deletado`)
        return res.status(200).json(resultado)

    } catch (error) {
        console.error("❌ Erro em excluirAtendimento:", error)
        const statusCode = error.statusCode || 500
        const mensagem = statusCode === 500
            ? "Erro interno do servidor."
            : error.message

        return res.status(statusCode).json({
            erro: mensagem
        })
    }
}

/**
 * AUTOCOMPLETE - Busca clientes com filtro por termo
 */
export async function buscarClientesAutocomplete(req, res) {
    try {
        console.log("🔍 GET /atendimentos/clientes/buscar - Buscando clientes...")

        const idUsuario = req.user?.id
        const { termo } = req.query

        if (!idUsuario) {
            return res.status(401).json({
                erro: "Usuário não autenticado"
            })
        }

        if (!termo) {
            return res.status(400).json({
                erro: "Termo de busca é obrigatório."
            })
        }

        const resultado = await buscarClientes(idUsuario, termo)

        console.log(`✅ ${resultado.quantidade} cliente(s) encontrado(s)`)
        return res.status(200).json(resultado)

    } catch (error) {
        console.error("❌ Erro em buscarClientesAutocomplete:", error)
        const statusCode = error.statusCode || 500
        const mensagem = statusCode === 500
            ? "Erro interno do servidor."
            : error.message

        return res.status(statusCode).json({
            erro: mensagem
        })
    }
}

/**
 * AUTOCOMPLETE - Busca produtos com filtro por termo
 */
export async function buscarProdutosAutocomplete(req, res) {
    try {
        console.log("🔍 GET /atendimentos/produtos/buscar - Buscando produtos...")

        const idUsuario = req.user?.id
        const { termo } = req.query

        if (!idUsuario) {
            return res.status(401).json({
                erro: "Usuário não autenticado"
            })
        }

        if (!termo) {
            return res.status(400).json({
                erro: "Termo de busca é obrigatório."
            })
        }

        const resultado = await buscarProdutos(idUsuario, termo)

        console.log(`✅ ${resultado.quantidade} produto(s) encontrado(s)`)
        return res.status(200).json(resultado)

    } catch (error) {
        console.error("❌ Erro em buscarProdutosAutocomplete:", error)
        const statusCode = error.statusCode || 500
        const mensagem = statusCode === 500
            ? "Erro interno do servidor."
            : error.message

        return res.status(statusCode).json({
            erro: mensagem
        })
    }
}

/**
 * UPDATE PRODUTOS - Atualiza os produtos de um atendimento
 */
export async function atualizarProdutosAtendimento(req, res) {
    try {
        const { id } = req.params
        const { produtos } = req.body

        console.log(`🛒 PUT /atendimentos/${id}/produtos - Atualizando produtos...`)

        if (!id) {
            console.warn("⚠️ ID não fornecido")
            return res.status(400).json({
                erro: "ID do atendimento é obrigatório."
            })
        }

        if (!Array.isArray(produtos)) {
            console.warn("⚠️ Produtos deve ser um array")
            return res.status(400).json({
                erro: "Produtos deve ser um array."
            })
        }

        const resultado = await atualizarProdutosDoAtendimento(id, produtos)

        console.log(`✅ Produtos do atendimento ${id} atualizados`)
        return res.status(200).json(resultado)

    } catch (error) {
        console.error("❌ Erro em atualizarProdutosAtendimento:", error)
        const statusCode = error.statusCode || 500
        const mensagem = statusCode === 500
            ? "Erro interno do servidor."
            : error.message

        return res.status(statusCode).json({
            erro: mensagem
        })
    }
}
