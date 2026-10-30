
// server/routes/productos.js

import { Router } from "express";
import { listarProductos } from "../controllers/productos.controller.js";

const router = Router();

// GET /api/productos
router.get("/", listarProductos);

export default router;
