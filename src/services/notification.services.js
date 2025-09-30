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
