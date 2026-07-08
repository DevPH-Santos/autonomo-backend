import { 
    cadastrarCliente, 
    atualizarCliente,
    deletarCliente
} from "../services/clienteService.js";
import { 
    selectCliente, 
    preencherCamposCliente 
} from "../models/clienteModel.js";

/**
 * CREATE - Cadastra um novo cliente
 */
export async function registrarCliente(req, res) {
    try {
        console.log("📝 POST /clientes - Cadastrando novo cliente...")
        
        const { 
            endereco_cliente, 
            frequencia_cliente, 
            nome_cliente, 
            telefone_cliente, 
            status_cliente, 
            email_cliente, 
            bairro_cliente, 
            tipo_contratacao_cliente, 
            valor_visita_cliente, 
            observacao_cliente 
        } = req.body

        // Validação de campos obrigatórios
        if (!nome_cliente || !email_cliente || !telefone_cliente) {
            console.warn("⚠️ Campos obrigatórios faltando")
            return res.status(400).json({
                erro: "Nome, email e telefone são obrigatórios."
            })
        }

        const clienteCriado = await cadastrarCliente({ 
            endereco_cliente, 
            frequencia_cliente, 
            nome_cliente, 
            telefone_cliente, 
            status_cliente, 
            email_cliente, 
            bairro_cliente, 
            tipo_contratacao_cliente, 
            valor_visita_cliente, 
            observacao_cliente 
        })

        console.log("✅ Cliente cadastrado com sucesso!")
        return res.status(201).json({
            mensagem: "Cliente cadastrado com sucesso.",
            cliente: clienteCriado,
        })

    } catch (error) {
        console.error("❌ Erro em registrarCliente:", error)
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
 * READ ALL - Lista todos os clientes
 */
export async function listarClientes(req, res) {
    try {
        console.log("📖 GET /clientes - Listando todos os clientes...")
        
        const clientes = await selectCliente()

        console.log(`✅ ${clientes.length} clientes encontrados`)
        return res.status(200).json({
            total: clientes.length,
            clientes: clientes
        })

    } catch (error) {
        console.error("❌ Erro em listarClientes:", error)
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
 * READ BY ID - Obtém dados de um cliente específico
 */
export async function obterCliente(req, res) {
    try {
        const { id } = req.params
        console.log(`📖 GET /clientes/${id} - Obtendo cliente...`)

        if (!id) {
            console.warn("⚠️ ID não fornecido")
            return res.status(400).json({
                erro: "ID do cliente é obrigatório."
            })
        }

        const cliente = await preencherCamposCliente(id)

        if (!cliente) {
            console.warn(`⚠️ Cliente ${id} não encontrado`)
            return res.status(404).json({
                erro: "Cliente não encontrado."
            })
        }

        console.log(`✅ Cliente ${id} encontrado`)
        return res.status(200).json({
            cliente: cliente
        })

    } catch (error) {
        console.error("❌ Erro em obterCliente:", error)
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
 * UPDATE - Atualiza dados de um cliente
 */
export async function editarCliente(req, res) {
    try {
        const { id } = req.params
        const dadosAtualizacao = req.body
        
        console.log(`✏️ PUT /clientes/${id} - Atualizando cliente...`)

        if (!id) {
            console.warn("⚠️ ID não fornecido")
            return res.status(400).json({
                erro: "ID do cliente é obrigatório."
            })
        }

        const resultado = await atualizarCliente(id, dadosAtualizacao)

        console.log(`✅ Cliente ${id} atualizado`)
        return res.status(200).json(resultado)

    } catch (error) {
        console.error("❌ Erro em editarCliente:", error)
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
 * DELETE - Deleta um cliente
 */
export async function excluirCliente(req, res) {
    try {
        const { id } = req.params
        
        console.log(`🗑️ DELETE /clientes/${id} - Deletando cliente...`)

        if (!id) {
            console.warn("⚠️ ID não fornecido")
            return res.status(400).json({
                erro: "ID do cliente é obrigatório."
            })
        }

        const resultado = await deletarCliente(id)

        console.log(`✅ Cliente ${id} deletado`)
        return res.status(200).json(resultado)

    } catch (error) {
        console.error("❌ Erro em excluirCliente:", error)
        const statusCode = error.statusCode || 500
        const mensagem = statusCode === 500 
            ? "Erro interno do servidor." 
            : error.message

        return res.status(statusCode).json({
            erro: mensagem
        })
    }
}
