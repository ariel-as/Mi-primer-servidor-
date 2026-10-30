
import express from "express";
import productosRouter from "./routes/productos.js";

const app = express();

console.log("Iniciando servidor...");

// Middleware para recibir JSON
app.use(express.json());

// Ruta principal
app.get("/", (req, res) => {
  res.send("Servidor modular funcionando correctamente ✅");
});

// Ruta de verificación
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Ruta para consultar productos
app.use("/api/productos", productosRouter);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error("Error:", err);

  res.status(err.statusCode || 500).json({
    error: err.name || "ErrorInterno",
    message: err.message || "Error interno del servidor"
  });
});

// Puerto del servidor modular
const PORT = 3002;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
