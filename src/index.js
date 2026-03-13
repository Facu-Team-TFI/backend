import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { initAssociations } from "./Associations.js";
import {
  PORT,
  PAGES_PROJECT,
  ALLOWED_ORIGINS,
  NODE_ENV,
} from "./config/env.js";
import { sequelize } from "./models/index.js";

import publicationRouter from "./routes/publication.routes.js";
import buyerRouter from "./routes/buyers.routes.js";
import contactRouter from "./routes/contact.routes.js";
import purchaseRouter from "./routes/purchase.routes.js";
import locationRouter from "./routes/location.routes.js";
import orderRouter from "./routes/order.routes.js";
import categoriesRouter from "./routes/categories.routes.js";
import chatRouter from "./routes/chats.routes.js";
import notificationRouter from "./routes/notification.routes.js";

import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// ============================
// Validación de variables env
// ============================
function requireEnv(name, value) {
  if (!value) {
    console.error(
      `[CONFIG] Falta la variable ${name} en el entorno (.env o Railway).`,
    );
    process.exit(1);
  }
}
requireEnv("PAGES_PROJECT", PAGES_PROJECT);
requireEnv("ALLOWED_ORIGINS", ALLOWED_ORIGINS);
// NODE_ENV lo usamos solo para desarrollo/prod; si no está, no abortamos, pero lo tratamos como 'production' más abajo.

// =======================================
// 1) Configuración de CORS “inteligente”
// =======================================
const STATIC_ALLOWED = ALLOWED_ORIGINS.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Opción 4: permitir front local (Vite) SOLO en desarrollo
const DEV_ALLOWED = ["http://localhost:5173", "http://127.0.0.1:5173"];

function isAllowedOrigin(origin) {
  if (!origin) return true; // permite requests sin Origin (curl/health checks)

  try {
    const url = new URL(origin);
    const { protocol, hostname } = url;

    // Permitir localhost solo si NO estamos en producción
    if (NODE_ENV !== "production" && DEV_ALLOWED.includes(origin)) {
      return true;
    }

    // En producción, exigir HTTPS
    if (NODE_ENV === "production" && !protocol.startsWith("https")) {
      return false;
    }

    // Dominios declarados explícitamente
    if (STATIC_ALLOWED.includes(origin)) return true;

    // Previews y root de Cloudflare Pages para el proyecto
    if (
      hostname === `${PAGES_PROJECT}.pages.dev` ||
      hostname.endsWith(`.${PAGES_PROJECT}.pages.dev`)
    ) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

const corsOptions = {
  origin: (origin, cb) => {
    if (isAllowedOrigin(origin)) return cb(null, true);
    return cb(null, false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  // credentials: true, // <-- activalo SOLO si usás cookies/sesiones cross-site
};

const app = express();
const server = createServer(app);

// Aplica CORS *antes* que tus rutas
app.use(cors(corsOptions));
// Preflight explícito (opcional)
app.options(/.*/, cors(corsOptions));

// =======================================
// 2) Socket.IO con CORS alineado
// =======================================
export const io = new Server(server, {
  cors: {
    origin: (origin, cb) => {
      if (isAllowedOrigin(origin)) return cb(null, true);
      return cb(null, false);
    },
    methods: ["GET", "POST"],
    // credentials: true, // <-- activalo SOLO si usás cookies de sesión
  },
  // path: "/socket.io", // deja el default salvo que lo cambies en el cliente
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use(express.json({ limit: "2mb" }));
app.get("/health", (_req, res) => res.status(200).send("ok"));

app.use(publicationRouter);
app.use(buyerRouter);
app.use(contactRouter);
app.use(purchaseRouter);
app.use(locationRouter);
app.use(orderRouter);
app.use(categoriesRouter);
app.use(chatRouter);
app.use(notificationRouter);

io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);

  //Notifications
  socket.on("client:join_notifications", (userId) => {
    socket.join(String(userId));
    console.log(`🔔 Usuario ${userId} suscrito a su canal de notificaciones`);
  });

  //Chat
  socket.on("join", (chatId) => {
    socket.join(String(chatId));
    console.log(`Usuario unido a la sala: ${chatId}`);
  });

  socket.on("sendMessage", (message) => {
    io.to(String(message.chat_id)).emit("receiveMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado");
  });
});

async function main() {
  try {
    initAssociations();
    console.log("Model associations initialized");
    await sequelize.sync({ alter: false });
    console.log("Base de datos sincronizada");

    const port = PORT || process.env.PORT || 3000;
    server.listen(port, () => {
      console.log(`Servidor corriendo en http://localhost:${port}`);
      console.log(
        `[CORS] NODE_ENV=${NODE_ENV || "undefined"} | PAGES_PROJECT=${PAGES_PROJECT} | STATIC_ALLOWED=${STATIC_ALLOWED.join(
          " ",
        )}`,
      );
    });
  } catch (err) {
    console.error("Error al conectar con la base de datos:", err);
  }
}

main();
