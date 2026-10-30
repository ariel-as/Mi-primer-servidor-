// controllers/productosController.js
// ============================
// Controladores (lógica) para los recursos "productos".
// Puntos clave:
// 1) Usamos fs/promises para lectura asíncrona.
// 2) Construimos una RUTA ABSOLUTA hacia /data/productos.json independientemente
// de desde dónde ejecutes `node` o `npm run`.
// 3) Manejo explícito de errores: si el archivo no existe o el JSON está mal formado,
// devolvemos un error claro al cliente.
// ============================
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
// Estas 3 líneas nos dan __dirname de manera compatible con ESM (import/export).
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// DATA_PATH: ruta absoluta hacia ../data/productos.json (subimos un nivel desde controllers/)
const DATA_PATH = path.join(__dirname, "..", "data", "productos.json");
// Controlador: GET /api/productos
export const listarProductos = async (req, res, next) => {
 try {
 // Leemos el archivo como texto UTF-8
 const content = await readFile(DATA_PATH, "utf8");
 // Intentamos parsear el JSON. Si el contenido no es JSON válido, esto lanzará un error.
  const data = JSON.parse(content);
 // Respondemos con el contenido del JSON
 res.status(200).json(data);
 } catch (err) {
 // Clasificamos errores comunes para dar mensajes más útiles:
 // - ENOENT: archivo no encontrado (ruta incorrecta o archivo faltante)
 // - SyntaxError: JSON inválido (comas de más, llaves mal cerradas, etc.)
 if (err.code === "ENOENT") {
 err.statusCode = 500;
 err.message = `No se encontró el archivo de datos en: ${DATA_PATH}. Verifica que exista y la ruta
sea correcta.`;
 } else if (err instanceof SyntaxError) {
 err.statusCode = 500;
 err.message = `El archivo de datos no contiene JSON válido. Verifica la sintaxis de
${DATA_PATH}.`;
 }
 // Pasamos el error al manejador global de errores en server.js
 next(err);
 }
};