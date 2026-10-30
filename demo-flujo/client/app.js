
// client/app.js

const API = "http://localhost:3000";

const catalogo = document.querySelector("#catalogo");
const carritoUL = document.querySelector("#carrito");
const statusEl = document.querySelector("#status");
const btnEnviar = document.querySelector("#enviar");

// Carrito en memoria
let carrito = [];

init();

// Cargar productos desde el servidor
async function init() {
  announce("Cargando productos...");

  try {
    const res = await fetch(`${API}/api/productos`, {
      headers: { "x-correlation-id": cid() }
    });

    if (!res.ok) {
      throw new Error("No se pudo obtener el catálogo");
    }

    const json = await res.json();

    renderCatalogo(json.data || []);
    announce("Productos cargados");

  } catch (e) {
    announce("Error al cargar productos");
    console.error(e);
  }
}

// Mostrar tarjetas de productos
function renderCatalogo(items) {
  catalogo.innerHTML = items.map(p => card(p)).join("");

  catalogo.querySelectorAll("button[data-id]").forEach(btn => {
    btn.addEventListener("click", () => addToCart(btn.dataset));
  });
}

// Crear tarjeta individual
function card(p) {
  return `
    <article class="card" aria-label="Producto ${escapeHTML(p.nombre)}">
      <h3>${escapeHTML(p.nombre)}</h3>
      <p>Precio: $${Number(p.precio).toFixed(2)}</p>
      <p>Stock: ${p.stock}</p>
      <footer>
        <button
          data-id="${p.id}"
          data-nombre="${escapeHTML(p.nombre)}"
          data-precio="${p.precio}">
          Agregar
        </button>
      </footer>
    </article>
  `;
}

// Agregar producto al carrito
function addToCart({ id, nombre, precio }) {
  const idx = carrito.findIndex(x => x.id == id);

  if (idx >= 0) {
    carrito[idx].qty += 1;
  } else {
    carrito.push({
      id: Number(id),
      nombre,
      precio: Number(precio),
      qty: 1
    });
  }

  renderCart();
  announce(`${nombre} agregado al carrito`);
}

// Mostrar productos del carrito
function renderCart() {
  carritoUL.innerHTML = carrito.map(i => `
    <li>
      ${escapeHTML(i.nombre)} —
      $${i.precio.toFixed(2)} x ${i.qty}
    </li>
  `).join("");
}

// Enviar pedido al servidor
btnEnviar.addEventListener("click", async () => {
  if (carrito.length === 0) {
    announce("El carrito está vacío");
    return;
  }

  const items = carrito.map(({ id, qty }) => ({
    id,
    qty
  }));

  try {
    announce("Enviando pedido...");

    const res = await fetch(`${API}/api/pedidos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-correlation-id": cid()
      },
      body: JSON.stringify({ items })
    });

    const json = await res.json();

    if (res.status === 201) {
      announce(`Pedido creado (#${json.orderId})`);
      carrito = [];
      renderCart();
    } else {
      announce(json.message || "No se pudo crear el pedido");
    }

  } catch (e) {
    announce("Error de red al enviar pedido");
    console.error(e);
  }
});

// Mostrar mensajes
function announce(msg) {
  statusEl.textContent = msg;
}

// Escapar HTML
function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  }[m]));
}

// Generar identificador de petición
function cid() {
  return "cid-" + Math.random().toString(36).slice(2, 10);
}
