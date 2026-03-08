// import { Sequelize } from "sequelize";
// import {
//   DB_HOST,
//   DB_USER,
//   DB_PASSWORD,
//   DB_NAME,
//   DB_PORT,
// } from "./config/env.js";

// const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
//   host: DB_HOST,
//   dialect: "mysql",
// });

// export default sequelize;

import { Sequelize } from "sequelize";
import fs from "fs";
import path from "path";
import {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT,
} from "./config/env.js";

// Ruta robusta al CA de Aiven (ubicado en backend/certs/ca.pem)
const caPath = path.join(process.cwd(), "certs", "ca.pem");

// Carga el CA una sola vez
const sslCa = fs.readFileSync(caPath);

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: Number(DB_PORT),
  dialect: "mysql",
  // Opciones SSL requeridas por Aiven
  dialectOptions: {
    ssl: {
      ca: sslCa,
      // Aiven requiere SSL; con 'ca' alcanza. Si en algún entorno
      // hay problemas de validación local, podés agregar:
      // rejectUnauthorized: true, // (por defecto true)
    },
  },
  // Pool saludable para serverless o prod
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
    acquire: 30000,
  },
  // Ajustá según tu preferencia
  logging: false, // poné true si querés ver las queries
  timezone: "+00:00", // guarda en UTC (recomendado)
});

export default sequelize;
