// routes/productos.js
// ============================
// Router específico para recursos "productos"
// Aquí definimos las rutas y delegamos la lógica a los controladores.
// ============================
import { Router } from "express";
import { listarProductos } from "../controllers/productosController.js";
const router = Router();
// GET /api/productos
// Devuelve el listado de productos leyendo desde el JSON en /data/productos.json
router.get("/", listarProductos);
export default router;