import { Router } from "express"
import {
    registrarLembrete,
    listarLembretes,
    obterLembrete,
    editarLembrete,
    editarStatusLembrete,
    excluirLembrete
} from "../controllers/lembreteController.js"
import { autenticar } from "../middlewares/authMiddleware.js"

const router = Router()

router.post("/", autenticar, registrarLembrete)
router.get("/", autenticar, listarLembretes)
router.get("/:id", autenticar, obterLembrete)
router.put("/:id", autenticar, editarLembrete)
router.patch("/:id/status", autenticar, editarStatusLembrete)
router.delete("/:id", autenticar, excluirLembrete)

export default router
