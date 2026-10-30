
// server/routes/pedidos.js

import { Router } from "express";
import { crearPedido } from "../controllers/pedidos.controller.js";

const router = Router();

// POST /api/pedidos
router.post("/", crearPedido);

export default router;
