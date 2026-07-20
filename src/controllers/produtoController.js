import {
    cadastrarProduto,
    atualizarProduto,
    deletarProduto
} from "../services/produtoService.js"

import {
    selectProduto,
    preencherCamposProduto
} from "../models/produtoModel.js"

/**
 * CREATE - Cadastra um novo produto
 */
export async function registrarProduto(req, res) {
    try {
        console.log("📝 POST /produtos - Cadastrando novo produto...")

        const idUsuario = req.user?.id

        if (!idUsuario) {
            return res.status(401).json({
                erro: "Usuário não autenticado"
            })
        }

        const {
            nome_produto,
            quantidade_produto,
            valor_produto,
            unidade_medida
        } = req.body

        // Validação de campos obrigatórios
        if (!nome_produto) {
            console.warn("⚠️ Campo obrigatório faltando")
            return res.status(400).json({
                erro: "Nome do produto é obrigatório."
            })
        }

        const produtoCriado = await cadastrarProduto({
            nome_produto,
            quantidade_produto,
            valor_produto,
            unidade_medida,
            fk_usuario_produto: idUsuario
        })

        console.log("✅ Produto cadastrado com sucesso!")
        return res.status(201).json({
            mensagem: "Produto cadastrado com sucesso.",
            produto: produtoCriado
        })

    } catch (error) {
        console.error("❌ Erro em registrarProduto:", error)

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
 * READ ALL - Lista todos os produtos
 */
export async function listarProdutos(req, res) {
    try {
        console.log("📖 GET /produtos - Listando todos os produtos...")

        const idUsuario = req.user?.id

        if (!idUsuario) {
            return res.status(401).json({
                erro: "Usuário não autenticado"
            })
        }

        const produtos = await selectProduto(idUsuario)

        console.log(`✅ ${produtos.length} produtos encontrados`)
        return res.status(200).json({
            total: produtos.length,
            produtos: produtos
        })

    } catch (error) {
        console.error("❌ Erro em listarProdutos:", error)

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
 * READ BY ID - Obtém dados de um produto específico
 */
export async function obterProduto(req, res) {
    try {
        const { id } = req.params

        console.log(`📖 GET /produtos/${id} - Obtendo produto...`)

        if (!id) {
            console.warn("⚠️ ID não fornecido")
            return res.status(400).json({
                erro: "ID do produto é obrigatório."
            })
        }

        const produto = await preencherCamposProduto(id)

        if (!produto) {
            console.warn(`⚠️ Produto ${id} não encontrado`)
            return res.status(404).json({
                erro: "Produto não encontrado."
            })
        }

        console.log(`✅ Produto ${id} encontrado`)
        return res.status(200).json({
            produto: produto
        })

    } catch (error) {
        console.error("❌ Erro em obterProduto:", error)

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
 * UPDATE - Atualiza dados de um produto
 */
export async function editarProduto(req, res) {
    try {
        const { id } = req.params
        const dadosAtualizacao = req.body

        console.log(`✏️ PUT /produtos/${id} - Atualizando produto...`)

        if (!id) {
            console.warn("⚠️ ID não fornecido")
            return res.status(400).json({
                erro: "ID do produto é obrigatório."
            })
        }

        const resultado = await atualizarProduto(id, dadosAtualizacao)

        console.log(`✅ Produto ${id} atualizado`)
        return res.status(200).json(resultado)

    } catch (error) {
        console.error("❌ Erro em editarProduto:", error)

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
 * DELETE - Deleta um produto
 */
export async function excluirProduto(req, res) {
    try {
        const { id } = req.params

        console.log(`🗑️ DELETE /produtos/${id} - Deletando produto...`)

        if (!id) {
            console.warn("⚠️ ID não fornecido")
            return res.status(400).json({
                erro: "ID do produto é obrigatório."
            })
        }

        const resultado = await deletarProduto(id)

        console.log(`✅ Produto ${id} deletado`)
        return res.status(200).json(resultado)

    } catch (error) {
        console.error("❌ Erro em excluirProduto:", error)

        const statusCode = error.statusCode || 500
        const mensagem = statusCode === 500
            ? "Erro interno do servidor."
            : error.message

        return res.status(statusCode).json({
            erro: mensagem
        })
    }
}
