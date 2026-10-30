
// server/controllers/pedidos.controller.js

export function crearPedido(req, res) {
  const { items } = req.body || {};

  // Comprobar que haya productos
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      status: "fail",
      message: "Items inválidos (se requiere array con elementos)"
    });
  }

  // Validar cantidades
  for (const it of items) {
    if (
      !it ||
      typeof it.id !== "number" ||
      typeof it.qty !== "number" ||
      it.qty <= 0
    ) {
      return res.status(400).json({
        status: "fail",
        message: "Cada item debe tener { id:number, qty:number>0 }"
      });
    }
  }

  // Generar número de pedido simulado
  const orderId = Math.floor(1000 + Math.random() * 9000);

  console.log(
    `[${req.correlationId}] Pedido creado #${orderId} con ${items.length} ítems`
  );

  // Respuesta HTTP 201 Created
  res.status(201).json({
    status: "created",
    orderId,
    items
  });
}
