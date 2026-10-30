
// server/middleware/cors.js
// Middleware CORS configurable.

export function setupCORS(allowedOrigin = "*") {
  return (req, res, next) => {

    // Origen autorizado
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);

    // Métodos permitidos
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,OPTIONS"
    );

    // Headers permitidos
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type,Authorization,x-correlation-id"
    );

    // Si es preflight, respondemos de inmediato
    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }

    // Continuar con el siguiente middleware
    next();
  };
}
