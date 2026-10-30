
// server/server.js

import express from "express";
import productos from "./routes/productos.js";
import pedidos from "./routes/pedidos.js";
import { setupCORS } from "./middleware/cors.js";
import { correlation } from "./middleware/correlation.js";

const app = express();

// 1. Middleware para recibir JSON
app.use(express.json());

// 2. Configurar CORS
app.use(setupCORS("http://127.0.0.1:5500"));

// 3. Correlation-ID
app.use(correlation);

// 4. Ruta principal
app.get("/", (req, res) => {
  res.status(200).send("API Demo Flujo Cliente-Servidor ✅");
});

// 5. Rutas de la API
app.use("/api/productos", productos);
app.use("/api/pedidos", pedidos);

// 6. Iniciar servidor
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`API activa en http://localhost:${PORT}`);
});
