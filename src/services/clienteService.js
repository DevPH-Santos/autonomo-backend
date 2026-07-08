import { 
    criarCliente,
    deletarCliente as deletarClienteModel,
    updateCliente 
} from "../models/clienteModel.js";

/**
 * Service responsável pelo cadastro de clientes.
 */
export async function cadastrarCliente(dadosCliente) {
    
    try {
        // Validações
        if (!dadosCliente.nome_cliente || dadosCliente.nome_cliente.trim() === "") {
            const erro = new Error("Nome do cliente é obrigatório.")
            erro.statusCode = 400
            throw erro
        }

        if (!dadosCliente.email_cliente || dadosCliente.email_cliente.trim() === "") {
            const erro = new Error("Email do cliente é obrigatório.")
            erro.statusCode = 400
            throw erro
        }

        if (!dadosCliente.telefone_cliente || dadosCliente.telefone_cliente.trim() === "") {
            const erro = new Error("Telefone do cliente é obrigatório.")
            erro.statusCode = 400
            throw erro
        }

        // Valida formato de email
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!regexEmail.test(dadosCliente.email_cliente)) {
            const erro = new Error("Email inválido.")
            erro.statusCode = 400
            throw erro
        }

        const idCliente = await criarCliente(dadosCliente)
        
        return {
            id: idCliente,
            nome: dadosCliente.nome_cliente,
            telefone: dadosCliente.telefone_cliente,
            email: dadosCliente.email_cliente,
            endereco: dadosCliente.endereco_cliente,
            bairro: dadosCliente.bairro_cliente,
            tipoContratacao: dadosCliente.tipo_contratacao_cliente,
            frequencia: dadosCliente.frequencia_cliente,
            valorVisita: dadosCliente.valor_visita_cliente,
            status: dadosCliente.status_cliente,
            obs: dadosCliente.observacao_cliente
        }

    } catch (error) {
        console.error("❌ Erro em cadastrarCliente:", error.message)
        
        if (error.code === "ER_DUP_ENTRY") {
            const erro = new Error("Email já cadastrado no sistema.")
            erro.statusCode = 409
            throw erro
        }

        throw error
    }
}

/**
 * Service para atualizar um cliente.
 */
export async function atualizarCliente(ID_cliente, dadosCliente) {
    
    try {
        if (!ID_cliente) {
            const erro = new Error("ID do cliente é obrigatório.")
            erro.statusCode = 400
            throw erro
        }

        // Valida email se foi enviado
        if (dadosCliente.email_cliente) {
            const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!regexEmail.test(dadosCliente.email_cliente)) {
                const erro = new Error("Email inválido.")
                erro.statusCode = 400
                throw erro
            }
        }

        console.log(`🔄 Atualizando cliente ID: ${ID_cliente}`)
        const atualizado = await updateCliente(ID_cliente, dadosCliente)

        if (!atualizado) {
            const erro = new Error("Cliente não encontrado.")
            erro.statusCode = 404
            throw erro
        }

        return {
            mensagem: "Cliente atualizado com sucesso.",
            id: ID_cliente
        }

    } catch (error) {
        console.error("❌ Erro em atualizarCliente:", error.message)
        
        if (error.code === "ER_DUP_ENTRY") {
            const erro = new Error("Email já cadastrado no sistema.")
            erro.statusCode = 409
            throw erro
        }
        throw error
    }
}

/**
 * Service para deletar um cliente.
 */
export async function deletarCliente(ID_cliente) {
    
    try {
        if (!ID_cliente) {
            const erro = new Error("ID do cliente é obrigatório.")
            erro.statusCode = 400
            throw erro
        }

        console.log(`🗑️ Deletando cliente ID: ${ID_cliente}`)
        const deletado = await deletarClienteModel(ID_cliente)

        if (!deletado) {
            const erro = new Error("Cliente não encontrado.")
            erro.statusCode = 404
            throw erro
        }

        return {
            mensagem: "Cliente deletado com sucesso."
        }

    } catch (error) {
        console.error("❌ Erro em deletarCliente:", error.message)
        throw error
    }
}
