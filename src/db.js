import { Sequelize } from "sequelize";
import {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT,
  MYSQL_SSL,
  AIVEN_CA_PEM_B64,
} from "./config/env.js";

// ¿Forzamos SSL?
const useSsl = String(MYSQL_SSL || "").toLowerCase() === "true";

// Si subiste el CA en base64, lo decodificamos a texto PEM (contenido del cert)
const caPem = AIVEN_CA_PEM_B64
  ? Buffer.from(AIVEN_CA_PEM_B64, "base64").toString("utf8")
  : undefined;

// `mysql2` permite pasar el CONTENIDO del certificado en ssl.ca (string)
const dialectOptions = useSsl
  ? {
      ssl: {
        rejectUnauthorized: true, // validación estricta del servidor
        ...(caPem ? { ca: caPem } : {}),
      },
    }
  : {};

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: Number(DB_PORT || 3306),
  dialect: "mysql",
  dialectOptions,
  pool: { max: 5, min: 0, idle: 10000, acquire: 30000 },
  logging: false,
  timezone: "+00:00",
});

export default sequelize;
