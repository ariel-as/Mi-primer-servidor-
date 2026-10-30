
// server/controllers/productos.controller.js

import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Equivalente a __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta absoluta al archivo productos.json
const DATA_PATH = path.join(__dirname, "..", "data", "productos.json");

export async function listarProductos(req, res) {
  try {
    // Leer archivo JSON
    const content = await readFile(DATA_PATH, "utf8");

    // Convertir texto en datos
    const data = JSON.parse(content);

    // Seleccionar los campos necesarios
    const out = (Array.isArray(data) ? data : []).map(
      ({ id, nombre, precio, stock }) => ({
        id,
        nombre,
        precio,
        stock
      })
    );

    res.status(200).json({
      status: "success",
      data: out
    });

  } catch (err) {
    console.error(
      `[${req.correlationId}] Error listando productos:`,
      err
    );

    res.status(500).json({
      status: "error",
      message:
        err.code === "ENOENT"
          ? `No se encontró el archivo de datos: ${DATA_PATH}`
          : `No se pudo leer el archivo de datos (${err.message})`
    });
  }
}
