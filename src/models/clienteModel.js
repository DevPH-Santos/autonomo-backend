import pool from "../config/db.js"
import { cadastrarUsuario } from "../services/authService.js"

/**
 * Cria um novo cliente no banco de dados.
 */
export async function criarCliente(dadosCliente) {
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
        observacao_cliente,
        fk_usuario_cliente
    } = dadosCliente

    const sql = `
        INSERT INTO cliente(
            endereco_cliente, 
            frequencia_cliente, 
            nome_cliente, 
            telefone_cliente, 
            status_cliente, 
            email_cliente, 
            bairro_cliente, 
            tipo_contratacao_cliente, 
            valor_visita_cliente, 
            observacao_cliente,
            fk_usuario_cliente
        )
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const [result] = await pool.execute(sql, [
        endereco_cliente,
        frequencia_cliente,
        nome_cliente,
        telefone_cliente,
        status_cliente,
        email_cliente,
        bairro_cliente,
        tipo_contratacao_cliente,
        valor_visita_cliente,
        observacao_cliente,
        fk_usuario_cliente
    ])

    return result.insertId
}

/**
 * Deleta um cliente pelo ID.
 */
export async function deletarCliente(ID_cliente) {
    const sql = `
        DELETE FROM cliente
        WHERE ID_cliente = ?
    `

    const [result] = await pool.execute(sql, [ID_cliente])
    
    return result.affectedRows > 0
}

/**
 * Seleciona todos os clientes.
 * deve receber ID do usuario para fazer select somente dos clientes dele
 */
export async function selectCliente(idUsuario) {
    const sql = `
        SELECT * FROM cliente
        WHERE fk_usuario_cliente = ?
    `

    const [clientes] = await pool.execute(sql, [idUsuario])
    
    return clientes
}

/**
 * Seleciona um cliente específico pelo ID.
 */
export async function preencherCamposCliente(ID_cliente) {
    const sql = `
        SELECT * FROM cliente
        WHERE ID_cliente = ?
    `

    const [clientes] = await pool.execute(sql, [ID_cliente])
    
    return clientes[0] || null
}

/**
 * Atualiza apenas os campos que foram realmente enviados.
 * Isso evita o erro de undefined nos parâmetros do SQL.
 */
export async function updateCliente(ID_cliente, dadosCliente) {
    // Lista de todos os campos possíveis
    const camposDisponiveis = [
        "endereco_cliente",
        "frequencia_cliente",
        "nome_cliente",
        "telefone_cliente",
        "status_cliente",
        "email_cliente",
        "bairro_cliente",
        "tipo_contratacao_cliente",
        "valor_visita_cliente",
        "observacao_cliente"
    ]

    // Filtra apenas os campos que foram realmente enviados
    const camposAtualizacao = {}
    const valores = []

    for (const campo of camposDisponiveis) {
        if (dadosCliente[campo] !== undefined) {
            camposAtualizacao[campo] = dadosCliente[campo]
            valores.push(dadosCliente[campo])
        }
    }

    // Se nenhum campo foi enviado, retorna false
    if (Object.keys(camposAtualizacao).length === 0) {
        return false
    }

    // Constrói dinamicamente a query SET
    const setClauses = Object.keys(camposAtualizacao)
        .map(campo => `${campo} = ?`)
        .join(", ")

    const sql = `
        UPDATE cliente
        SET ${setClauses}
        WHERE ID_cliente = ?
    `

    // Adiciona o ID ao final do array de valores
    valores.push(ID_cliente)

    console.log(`📝 SQL gerado: UPDATE cliente SET ${setClauses} WHERE ID_cliente = ?`)
    console.log(`📝 Valores: ${valores}`)

    const [result] = await pool.execute(sql, valores)

    return result.affectedRows > 0
}
