import { spawn } from "node:child_process";
import { once } from "node:events";
import net from "node:net";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const host = "127.0.0.1";

function parseJson(body, label) {
  try {
    return JSON.parse(body);
  } catch {
    throw new Error(`${label}: la respuesta no es JSON válido`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { ...options, signal: controller.signal }).finally(() => {
    clearTimeout(timer);
  });
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port, host);
  });
}

async function waitForServer(url, child, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`el servidor terminó con código ${child.exitCode}`);
    }

    try {
      const response = await fetchWithTimeout(url, {}, 2000);
      await response.arrayBuffer();
      return;
    } catch {
      await delay(250);
    }
  }

  throw new Error(`tiempo de espera agotado esperando ${url}`);
}

async function stopServer(child) {
  if (child.exitCode !== null) {
    return;
  }

  child.kill("SIGTERM");

  const terminated = await Promise.race([
    once(child, "exit").then(() => true),
    delay(3000).then(() => false)
  ]);

  if (!terminated && child.exitCode === null) {
    child.kill("SIGKILL");
    await Promise.race([once(child, "exit"), delay(2000)]);
  }
}

const suites = [
  {
    name: "servidor-basico / servidor HTTP nativo",
    cwd: "servidor-basico",
    entry: "server.js",
    port: 3000,
    readyPath: "/",
    cases: [
      {
        method: "GET",
        path: "/",
        expect: 200,
        validate(body) {
          assert(body.includes("Servidor"), "la respuesta no contiene el mensaje esperado");
        }
      }
    ]
  },
  {
    name: "servidor-basico / servidor Express",
    cwd: "servidor-basico",
    entry: "serverexpress.js",
    port: 3001,
    readyPath: "/",
    cases: [
      {
        method: "GET",
        path: "/",
        expect: 200
      },
      {
        method: "GET",
        path: "/api/productos",
        expect: 200,
        validate(body) {
          const data = parseJson(body, "GET /api/productos");
          assert(Array.isArray(data) && data.length > 0, "se esperaba un arreglo de productos no vacío");
        }
      }
    ]
  },
  {
    name: "servidor-basico1 / Express modular",
    cwd: "servidor-basico1",
    entry: "server.js",
    port: 3002,
    readyPath: "/health",
    cases: [
      {
        method: "GET",
        path: "/health",
        expect: 200,
        validate(body) {
          assert(body.trim() === "OK", "se esperaba la respuesta OK");
        }
      },
      {
        method: "GET",
        path: "/api/productos",
        expect: 200,
        validate(body) {
          const data = parseJson(body, "GET /api/productos");
          assert(Array.isArray(data) && data.length > 0, "se esperaba un arreglo de productos no vacío");
        }
      }
    ]
  },
  {
    name: "demo-flujo / API cliente-servidor",
    cwd: path.join("demo-flujo", "server"),
    entry: "server.js",
    port: 3000,
    readyPath: "/api/productos",
    cases: [
      {
        method: "GET",
        path: "/api/productos",
        expect: 200,
        validate(body) {
          const json = parseJson(body, "GET /api/productos");
          assert(json.status === "success", "se esperaba status success");
          assert(Array.isArray(json.data) && json.data.length > 0, "se esperaba data con productos");
        }
      },
      {
        method: "POST",
        path: "/api/pedidos",
        expect: 201,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ id: 1, qty: 2 }] }),
        validate(body) {
          const json = parseJson(body, "POST /api/pedidos");
          assert(json.status === "created", "se esperaba status created");
          assert(Number.isInteger(json.orderId), "se esperaba un orderId numérico");
        }
      },
      {
        method: "POST",
        path: "/api/pedidos",
        expect: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [] }),
        validate(body) {
          const json = parseJson(body, "POST /api/pedidos (inválido)");
          assert(json.status === "fail", "se esperaba status fail para un pedido inválido");
        }
      }
    ]
  }
];

let failures = 0;

for (const suite of suites) {
  const baseUrl = `http://${host}:${suite.port}`;
  console.log(`\n=== ${suite.name} (${suite.port}) ===`);

  if (!(await isPortFree(suite.port))) {
    console.error(`  FAIL el puerto ${suite.port} ya está en uso`);
    failures += 1;
    continue;
  }

  const cwd = path.join(repoRoot, suite.cwd);
  const logs = [];
  const child = spawn(process.execPath, [suite.entry], {
    cwd,
    env: { ...process.env, NODE_ENV: "test" },
    stdio: ["ignore", "pipe", "pipe"]
  });

  child.stdout.on("data", (chunk) => {
    logs.push(chunk.toString());
  });
  child.stderr.on("data", (chunk) => {
    logs.push(chunk.toString());
  });

  try {
    await waitForServer(`${baseUrl}${suite.readyPath}`, child);

    for (const testCase of suite.cases) {
      const response = await fetchWithTimeout(`${baseUrl}${testCase.path}`, {
        method: testCase.method,
        headers: testCase.headers,
        body: testCase.body
      });
      const body = await response.text();

      if (response.status !== testCase.expect) {
        throw new Error(
          `${testCase.method} ${testCase.path} devolvió ${response.status}; se esperaba ${testCase.expect}`
        );
      }

      if (testCase.validate) {
        testCase.validate(body);
      }

      console.log(`  OK ${testCase.method} ${testCase.path} -> ${response.status}`);
    }
  } catch (error) {
    failures += 1;
    console.error(`  FAIL ${error.message}`);

    if (logs.length > 0) {
      console.error("  Salida del servidor:");
      console.error(
        logs
          .join("")
          .split(/\r?\n/)
          .filter(Boolean)
          .map((line) => `    ${line}`)
          .join("\n")
      );
    }
  } finally {
    await stopServer(child);
  }
}

if (failures > 0) {
  console.error(`\n${failures} suite(s) fallaron.`);
  process.exit(1);
}

console.log("\nTodas las pruebas de endpoints pasaron correctamente.");
