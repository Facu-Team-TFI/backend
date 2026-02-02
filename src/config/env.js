import dotenv from "dotenv";

dotenv.config({ path: "src/.env" }); //ruta absoluta de .env

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
} = process.env;
