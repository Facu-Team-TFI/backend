import Notification from "../models/notification.js";
import Chats from "../models/chats.js";
import Buyers from "../models/buyers.js";
import Publications from "../models/publication.js";
import { io } from "../index.js";
import Sellers from "../models/sellers.js";

export const getAll = async (req, res) => {
  const { userId } = req.params;
  const notifications = await Notification.findAll({
    where: { userId },
    order: [["createdAt", "DESC"]],
  });
  res.status(200).json({ success: true, notifications });
};

export const remove = async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findByPk(id);
  if (!notification) {
    return res
      .status(404)
      .json({ success: false, message: "Notificación no encontrada" });
  }
  await notification.destroy();
  res.status(200).json({
    success: true,
    message: `La notificación ${notification.title} ha sido eliminada correctamente`,
  });
};

export const handleMessageNotification = async (message) => {
  const { sender_id, ID_Chat: chat_id } = message;

  const chat = await Chats.findByPk(chat_id);

  const userId = chat.ID_User === sender_id ? chat.ID_Buyers : chat.ID_User;

  // Evitar duplicar notificaciones
  const existing = await Notification.findOne({
    where: {
      userId,
      type: "mensaje",
      senderId: sender_id,
    },
  });

  if (existing) return;

  const sender = await Buyers.findByPk(sender_id);

  const notification = await Notification.create({
    userId,
    title: "Nuevo/s Mensaje/s",
    type: "mensaje",
    senderId: sender_id,
    description: `Tienes nuevo/s mensajes de ${sender.NickName}`,
  });

  //sockets
  io.to(String(userId)).emit("server:new-notification", notification);
};

export const handlePurchaseNotifications = async (buyer_id, publication_id) => {
  const buyer = await Buyers.findByPk(buyer_id);
  const publication = await Publications.findByPk(publication_id);
  const seller = await Sellers.findByPk(publication.ID_Sellers);

  const buyerNotification = await Notification.create({
    userId: buyer_id,
    title: "Orden de compra realizada",
    type: "compraExitosa",
    description: `Has realizado la orden de compra de ${publication.Title} con éxito.`,
  });

  const sellerNotification = await Notification.create({
    userId: seller.ID_Buyers,
    title: "Nueva orden de compra",
    type: "ventaExitosa",
    description: `Tienes una nueva orden de compra para ${publication.Title} de "${buyer.NickName}"`,
  });

  io.to(String(buyer_id)).emit("server:new-notification", buyerNotification);
  io.to(String(seller.ID_Buyers)).emit(
    "server:new-notification",
    sellerNotification,
  );
};
