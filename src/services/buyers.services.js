import { where } from "sequelize";
import models from "../models/index.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config/jwt.js";
import { EMAIL_PASS, EMAIL_USER, FRONTEND_URL } from "../config/env.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";

const { Buyers, Sellers, Publications, OrderDetail, Chats, Messages } = models;

export async function findBuyerById(id) {
  return await Buyers.findByPk(id);
}

export async function updateBuyer(id, data) {
  const buyer = await Buyers.findByPk(id);
  if (!buyer) return null;

  await buyer.update(data);
  return buyer;
}

export const updateBuyerWhitImage = async (req, res) => {
  try {
    const buyer = await Buyers.findByPk(req.params.id);
    if (!buyer) return res.status(404).json({ error: "No encontrado" });

    let avatarUrl = buyer.avatarUrl ?? null;

    if (req.file) {
      const result = await uploadBufferToCloudinary(req.file.buffer, {
        folder: "buyer_avatars",
      });
      avatarUrl = result.secure_url;
    }

    await buyer.update({
      ...req.body,
      ...(avatarUrl ? { avatarUrl } : {}),
    });

    return res.json(buyer);
  } catch (err) {
    console.error("Error en updateBuyer:", err);
    return res.status(500).json({ error: "Error al actualizar el comprador" });
  }
};

export async function deleteBuyer(id) {
  const buyer = await Buyers.findByPk(id);
  if (!buyer) return null;

  await buyer.destroy();
  return buyer;
}

export const createSeller = async (req, res) => {
  const { buyerId } = req.body;

  try {
    const existingSeller = await Sellers.findOne({
      where: { ID_Buyers: buyerId },
    });

    if (existingSeller) {
      return res
        .status(400)
        .json({ message: "Ya estás registrado como vendedor." });
    }

    const newSeller = await Sellers.create({
      ID_Buyers: buyerId,
      RegistrationDate: new Date(),
      QuantitySales: 0,
    });

    return res
      .status(201)
      .json({ message: "¡Registro como vendedor exitoso!", seller: newSeller });
  } catch (error) {
    console.error("Error al registrar vendedor:", error);
    return res
      .status(500)
      .json({ message: "Error al registrar como vendedor." });
  }
};

export async function removeBuyer(id) {
  try {
    const buyer = await Buyers.findByPk(id);
    if (!buyer) return null;

    const seller = await Sellers.findOne({ where: { ID_Buyers: id } });

    if (seller) {
      const publications = await Publications.findAll({
        where: { ID_Sellers: seller.ID_Sellers },
      });

      for (const pub of publications) {
        await OrderDetail.destroy({
          where: { ID_Publications: pub.ID_Publication },
        });
      }

      await Publications.destroy({
        where: { ID_Sellers: seller.ID_Sellers },
      });

      await seller.destroy();
    }

    await Messages.destroy({
      where: { sender_id: id },
    });

    await Chats.destroy({
      where: {
        ID_User: id,
        ID_Buyers: id,
      },
    });

    await buyer.destroy();

    return buyer;
  } catch (error) {
    console.error("Error al eliminar buyer:", error);
    throw error;
  }
}

export async function createsBuyer(data) {
  const existingBuyer = await Buyers.findOne({
    where: { Email: data.Email },
  });

  if (existingBuyer) {
    throw new Error("El email ya está registrado");
  }
  //Hasheamos el password
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(data.Passwords, salt);
  data.Passwords = hashedPassword;

  return await Buyers.create(data);
}

export async function removeSeller(id) {
  try {
    const buyer = await Buyers.findByPk(id);
    if (!buyer) return null;

    const seller = await Sellers.findOne({ where: { ID_Buyers: id } });

    if (seller) {
      const publications = await Publications.findAll({
        where: { ID_Sellers: seller.ID_Sellers },
      });

      for (const pub of publications) {
        await OrderDetail.destroy({
          where: { ID_Publications: pub.ID_Publication },
        });
      }

      await Publications.destroy({
        where: { ID_Sellers: seller.ID_Sellers },
      });

      await seller.destroy();
    }

    return buyer;
  } catch (error) {
    console.error("Error al eliminar buyer:", error);
    throw error;
  }
}

export const forgotPassword = async (req, res) => {
  //Primero comprobamos si el usuario no existe
  const { email } = req.body;
  const buyer = await Buyers.findOne({ where: { Email: email } });

  if (!buyer) {
    return res.status(404).json({
      success: false,
      message: "El email ingresado no se encuentra registrado",
    });
  }

  //Si encontró el usuario, le envía un email
  try {
    // Configuramos el transporte (SMTP)
    const transporter = nodemailer.createTransport({
      service: "gmail", // También podés usar host, port y auth para SMTP personalizado
      auth: {
        user: EMAIL_USER, // email del emisor
        pass: EMAIL_PASS, // contraseña o app password
      },
      tls: {
        rejectUnauthorized: false, // <-- Esto ignora el error de certificado
      },
    });

    const token = jwt.sign({ id: buyer.ID_Buyers }, SECRET_KEY, {
      expiresIn: "1h",
    });

    // Campos del mail
    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: "Recuperación de contraseña",
      html: `
    <h2>Recuperación de contraseña</h2>
    <p>Hola,</p>
    <p>Recibimos una solicitud para restablecer tu contraseña.</p>
    <p>Haz click en el siguiente enlace para crear una nueva contraseña:</p>
    <a href="${FRONTEND_URL}/auth/reset-password?token=${token}">
      Restablecer contraseña
    </a>
    <p>Si no solicitaste el cambio, ignora este correo.</p>
    <p>Saludos,<br>El equipo de CarpinChords</p>
  `,
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({
      success: true,
      message:
        "Se ha enviado un email con instrucciones para restablecer la contraseña",
    });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    res.status(500).json({ success: false, message: "Error enviando correo" });
  }
};

export const verifyTokenByQuery = (req, res, next) => {
  // esta función se puede modificar para que también pueda recibir el token por header o algun otro lado

  const { token } = req.query;

  // Si no hay token, devuelve error 401 (no autorizado)
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No posee autorización requerida" });
  }

  try {
    // Verifica que el token sea válido usando la clave secreta
    const payload = jwt.verify(token, SECRET_KEY);
    req.id = payload.id;

    next();
  } catch (error) {
    return res
      .status(403)
      .json({ success: false, message: "No posee permisos correctos" });
  }
};

export const resetPassword = async (req, res) => {
  const id = req.id;
  const { password } = req.body;

  try {
    // Buscamos al usuario
    const buyer = await Buyers.findByPk(id);
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Hasheamos la nueva contraseña
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    buyer.Passwords = hashedPassword;
    await buyer.save();

    res.status(200).json({
      success: true,
      message: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "No se ha podido cambiar la contraseña",
    });
  }
};
