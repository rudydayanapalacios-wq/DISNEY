// MÓDULO NATIVO OBLIGATORIO: Se importa "http" integrado por defecto en Node.js (Sin librerías de terceros)
const http = require("http");
// Importamos la capa encargada de la gestión del almacén de datos temporal
const DisneyStore = require("./store/DisneyStore");

// ============================================================
// CLASE DisneyServer (Controlador Maestro del Servidor HTTP)
// ============================================================
class DisneyServer {
  constructor(port) {
    this.port = port;
    this.store = new DisneyStore(); // Relación de composición: el servidor crea y administra su propio almacén
    
    // Inicializa el servidor nativo. Cada paquete de red entrante invocará asíncronamente a handleRequest
    this.server = http.createServer((req, res) => this.handleRequest(req, res));
  }

  // Inyección manual de cabeceras de seguridad CORS para habilitar la intercomunicación con puertos externos
  setCorsHeaders(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }

  // Enrutador Principal: Analiza el método HTTP y la ruta web para delegar las operaciones
  handleRequest(req, res) {
    this.setCorsHeaders(res); // Aplica cabeceras CORS en todas las ejecuciones de salida

    // Captura peticiones preflight OPTIONS enviadas por navegadores modernos retornando estatus exitoso vacío
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    // ENRUTAMIENTO EXCLUSIVO: Filtra solicitudes destinadas al nuevo endpoint solicitado: "/disney"
    if (req.url === "/disney" || req.url === "/disney/") {
      if (req.method === "GET") {
        return this.handleGetCharacters(req, res);
      }
      if (req.method === "POST") {
        return this.handlePostCharacter(req, res);
      }
    }

    // Ruta por defecto en caso de no concordar con los endpoints de nuestra Wiki
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Ruta no encontrada en el Reino Mágico" }));
  }

  // Gestiona el flujo de lectura (GET) respondiendo la lista actual en memoria
  handleGetCharacters(req, res) {
    const list = this.store.list();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(list));
  }

  // Gestiona el flujo de recepción y escritura (POST)
  handlePostCharacter(req, res) {
    this.readBody(req)
      .then((bodyText) => {
        if (!bodyText || bodyText.trim() === "") {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Estructura inválida. El cuerpo de la petición está vacío." }));
          return;
        }

        const data = JSON.parse(bodyText); // Deserializa el string de red en formato JSON

        // Convalidación obligatoria de seguridad: exige la existencia de _id y name
        if (!data._id || !data.name) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Estructura inválida. Se requiere obligatoriamente _id y name." }));
          return;
        }

        // Delega la inserción o actualización al almacén en RAM
        const { character, isNew } = this.store.save(data);

        // Envía la información formateada a la consola del sistema siguiendo las reglas de la Opción B
        this.logSave(character, isNew);

        // Concluye la transacción enviando una confirmación JSON exitosa 200 al frontend
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, character }));
      })
      .catch((err) => {
        console.error("⚠️ Error capturado en el Stream de Red Backend:", err.message);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "JSON corrupto o mal estructurado" }));
      });
  }

  // Capturador de Streams nativo basado en Promesas para acumular los trozos (Chunks) de datos enviados
  readBody(req) {
    return new Promise((resolve, reject) => {
      let chunks = [];
      // Evento "data": se ejecuta cada vez que un fragmento de datos binario arriba al servidor
      req.on("data", (chunk) => { chunks.push(chunk); });
      // Evento "end": se ejecuta cuando la transmisión ha finalizado en su totalidad
      req.on("end", () => {
        const body = Buffer.concat(chunks).toString("utf-8"); // Une los buffers de manera segura sin romper tildes
        resolve(body);
      });
      // Evento "error": por si ocurre una interrupción física inesperada del flujo
      req.on("error", (err) => reject(err));
    });
  }

  // Método de Registro (Logger): Imprime de manera estructurada y elegante el mensaje de guardado en consola (Opción B)
  logSave(character, isNew) {
    const action = isNew ? "GUARDADO" : "ACTUALIZADO";
    console.log("\n======================================================================");
    console.log(`✨ [ACCION EN TERMINAL: ${action}] ✨`);
    // Emplea el polimorfismo llamando a .describe() del objeto instanciado (POO)
    console.log(`👉 ${character.describe()}`);
    console.log(`Personajes totales en la memoria RAM: ${this.store.size}`);
    console.log("Lista completa actual:", this.store.list().map((c) => c.name).join(" | "));
    console.log("======================================================================\n");
  }

  // Enciende los escuchadores del socket de red vinculándolos al puerto especificado
  start() {
    this.server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`El puerto ${this.port} está ocupado por otro proceso de Node.js.`);
        process.exit(1);
      }
      throw error;
    });

    this.server.listen(this.port, () => {
      console.log(`Servidor de Disney activo de forma nativa en: http://localhost:${this.port}`);
    });
  }
}

// Inicialización del servicio en el puerto 3000
const server = new DisneyServer(3000);
server.start();