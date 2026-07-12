import jwt from "jsonwebtoken"

export function autenticar(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1]
    
    if (!token) {
        return res.status(401).json({ erro: "Token não fornecido" })
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded // { id: usuario.ID_user }
        next()
    } catch (erro) {
        res.status(401).json({ erro: "Token inválido" })
    }
}
