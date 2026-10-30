
import express from "express";

const app = express();

// Permite recibir datos JSON
app.use(express.json());

// Ruta principal
app.get("/", (req, res) => {
  res.send("Servidor Express funcionando correctamente ✅ ");
});

// Ruta para mostrar productos
app.get("/api/productos", (req, res) => {
  const productos = [
    { id: 1, nombre: "Café Premium", precio: 22.9 },
    { id: 2, nombre: "Té Verde", precio: 18.5 }
  ];

  res.status(200).json(productos);
});

// Puerto del segundo servidor
const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Servidor Express en http://localhost:${PORT}`);
});
