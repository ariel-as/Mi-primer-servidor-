
// server/middleware/correlation.js
// Middleware que garantiza que cada request tenga un Correlation-ID.

// Generador simple de IDs.
// Para producción podrías usar crypto.randomUUID()
function cryptoRandom() {
  return "cid-" + Math.random().toString(36).slice(2, 10);
}

export function correlation(req, res, next) {

  // 1) Tomar el correlation-id del cliente si existe,
  // caso contrario generar uno
  const id = req.headers["x-correlation-id"] || cryptoRandom();

  // 2) Incluirlo en la respuesta
  res.setHeader("x-correlation-id", id);

  // 3) Guardarlo en el objeto request
  req.correlationId = id;

  // 4) Log del método, ruta e ID
  console.log(`[${id}] ${req.method} ${req.url}`);

  // 5) Continuar con el siguiente middleware
  next();
}
