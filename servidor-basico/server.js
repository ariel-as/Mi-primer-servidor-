// server.js
import http from "http";
const servidor = http.createServer((req, res) => {
 res.writeHead(200, { "Content-Type": "text/plain" });
 res.end("Servidor básico Node.js en ejecución ");
});
servidor.listen(3000, () => {
 console.log("Servidor activo en http://localhost:3000");
});
