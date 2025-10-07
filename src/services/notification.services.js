import Notification from "../models/notification.js";

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

//para sockets
// export const create = async (req, res) =>{
//   try {
//     const { userId, message } = req.body;

//     const notification = await Notification.create({ userId, message });

//     // ✅ Emitir al usuario correcto
//     io.to(String(userId)).emit("new-notification", notification);

//     res.status(201).json(notification);
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   };
// };
