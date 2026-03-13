import dotenv from "dotenv";
dotenv.config(); // busca .env en la raíz del proyecto

export const {
  PORT,
  SECRET_KEY,
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  EMAIL_USER,
  EMAIL_PASS,
  FRONTEND_URL,
  MYSQL_SSL,
  AIVEN_CA_PEM_B64,
  PAGES_PROJECT,
  ALLOWED_ORIGINS,
  NODE_ENV,
} = process.env;
